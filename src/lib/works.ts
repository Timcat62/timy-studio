import { works } from "./config";

export type Work =
  | { kind: "youtube"; id: string; title: string; url: string }
  | { kind: "link"; url: string; title: string; thumb?: string };

/** Extracts the video ID from a youtube.com/shorts, /watch, /embed or youtu.be URL. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "").replace(/^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1).split("/")[0] || null;
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]{6,})/);
      if (m) return m[2];
    }
  } catch {
    // not a URL
  }
  return null;
}

async function oembed(endpoint: string, url: string): Promise<{ title?: string; thumbnail_url?: string } | null> {
  try {
    const res = await fetch(`${endpoint}?url=${encodeURIComponent(url)}&format=json`, {
      next: { revalidate: 60 * 60 * 6 },
    });
    return res.ok ? ((await res.json()) as { title?: string; thumbnail_url?: string }) : null;
  } catch {
    return null;
  }
}

/** Turns the URLs from config into displayable works. Titles come from the platforms' public oEmbed endpoints. */
export async function getWorks(): Promise<Work[]> {
  return Promise.all(
    works.map(async (w, i): Promise<Work> => {
      const id = youtubeId(w.url);
      if (id) {
        const data = w.title ? null : await oembed("https://www.youtube.com/oembed", w.url);
        return { kind: "youtube", id, url: `https://www.youtube.com/shorts/${id}`, title: w.title || data?.title || `Short ${String(i + 1).padStart(2, "0")}` };
      }
      let title = w.title;
      let thumb = w.thumb;
      if ((!title || !thumb) && w.url.includes("tiktok.com")) {
        const data = await oembed("https://www.tiktok.com/oembed", w.url);
        title = title || data?.title?.slice(0, 90);
        thumb = thumb || data?.thumbnail_url;
      }
      return { kind: "link", url: w.url, title: title || "Watch the video", thumb };
    }),
  );
}
