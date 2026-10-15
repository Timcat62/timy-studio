import { appleArtistIds, releasesFallback, spotifyArtistId } from "./config";

export interface Release {
  title: string;
  year?: string;
  art?: string;
  href?: string;
}

const spotifySearch = (title: string) => `https://open.spotify.com/search/${encodeURIComponent(`${title} timy.`)}`;

/* ---------- Spotify (direct links, needs a free developer app) ---------- */

let token: { value: string; expires: number } | null = null;

async function spotifyToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (token && token.expires > Date.now() + 30_000) return token.value;
  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string; expires_in: number };
    token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
    return token.value;
  } catch {
    return null;
  }
}

interface SpotifyAlbum {
  name: string;
  release_date?: string;
  images?: { url: string; width: number }[];
  external_urls?: { spotify?: string };
}

async function fromSpotify(): Promise<Release[] | null> {
  if (!spotifyArtistId) return null;
  const t = await spotifyToken();
  if (!t) return null;
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/artists/${spotifyArtistId}/albums?include_groups=album,single&limit=50`,
      { headers: { Authorization: `Bearer ${t}` }, next: { revalidate: 60 * 60 * 6 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: SpotifyAlbum[] };
    const seen = new Set<string>();
    const out: (Release & { date: number })[] = [];
    for (const a of data.items ?? []) {
      const key = a.name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      const img = [...(a.images ?? [])].sort((x, y) => x.width - y.width).find((i) => i.width >= 300) ?? a.images?.[0];
      out.push({
        title: a.name,
        year: a.release_date?.slice(0, 4),
        art: img?.url,
        href: a.external_urls?.spotify ?? spotifySearch(a.name),
        date: a.release_date ? Date.parse(a.release_date) : 0,
      });
    }
    return out.sort((x, y) => y.date - x.date).map(({ date: _d, ...rest }) => rest);
  } catch {
    return null;
  }
}

/* ---------- Apple Music (public lookup, no key) ---------- */

interface ItunesItem {
  wrapperType: string;
  collectionName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
}

async function fromApple(): Promise<Release[]> {
  const found = new Map<string, Release & { date: number }>();
  for (const id of appleArtistIds) {
    try {
      const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=album&limit=100`, {
        next: { revalidate: 60 * 60 * 6 },
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { results?: ItunesItem[] };
      for (const item of data.results ?? []) {
        if (item.wrapperType !== "collection" || !item.collectionName) continue;
        const title = item.collectionName.replace(/\s+-\s+(Single|EP)$/i, "");
        const key = title.toLowerCase();
        if (found.has(key)) continue;
        found.set(key, {
          title,
          year: item.releaseDate?.slice(0, 4),
          art: item.artworkUrl100?.replace("100x100bb", "300x300bb"),
          href: spotifySearch(title),
          date: item.releaseDate ? Date.parse(item.releaseDate) : 0,
        });
      }
    } catch {
      // try the next artist ID
    }
  }
  return [...found.values()].sort((a, b) => b.date - a.date).map(({ date: _d, ...rest }) => rest);
}

/** Your releases, newest first. Every cover links to Spotify. Cached for 6 hours. */
export async function getReleases(): Promise<Release[]> {
  const spotify = await fromSpotify();
  if (spotify && spotify.length) return spotify;
  const apple = await fromApple();
  return apple.length ? apple : releasesFallback.map((r) => ({ ...r, href: r.href ?? spotifySearch(r.title) }));
}
