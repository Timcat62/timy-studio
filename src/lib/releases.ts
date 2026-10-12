import { appleArtistIds, releasesFallback } from "./config";

export interface Release {
  title: string;
  year?: string;
  art?: string;
  href?: string;
}

interface ItunesItem {
  wrapperType: string;
  collectionName?: string;
  collectionViewUrl?: string;
  artworkUrl100?: string;
  releaseDate?: string;
}

/** Pulls your releases from Apple Music's public lookup API (no key needed). Cached for 6 hours. */
export async function getReleases(): Promise<Release[]> {
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
        const key = item.collectionName.toLowerCase();
        if (found.has(key)) continue;
        found.set(key, {
          title: item.collectionName.replace(/\s+-\s+(Single|EP)$/i, ""),
          year: item.releaseDate?.slice(0, 4),
          art: item.artworkUrl100?.replace("100x100bb", "600x600bb"),
          href: item.collectionViewUrl,
          date: item.releaseDate ? Date.parse(item.releaseDate) : 0,
        });
      }
    } catch {
      // fall through to fallback
    }
  }
  const list = [...found.values()].sort((a, b) => b.date - a.date).map(({ date: _d, ...rest }) => rest);
  return list.length ? list : releasesFallback;
}
