import { works } from "./config";

export interface Work {
  url: string;
  title: string;
  thumb?: string;
}

/** Resolves each TikTok URL from config into a title and thumbnail through TikTok's public oEmbed endpoint. */
export async function getWorks(): Promise<Work[]> {
  return Promise.all(
    works.map(async (w) => {
      let title = w.title;
      let thumb = w.thumb;
      if (!title || !thumb) {
        try {
          const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(w.url)}`, {
            next: { revalidate: 60 * 60 * 6 },
          });
          if (res.ok) {
            const data = (await res.json()) as { title?: string; thumbnail_url?: string };
            title = title || data.title?.slice(0, 90);
            thumb = thumb || data.thumbnail_url;
          }
        } catch {
          // keep whatever we have
        }
      }
      return { url: w.url, title: title || "Watch on TikTok", thumb };
    }),
  );
}
