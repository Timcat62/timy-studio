import meta from "./portfolio-meta.json";

/**
 * Your best videos, shown on /portfolio in this order. Paste Instagram reel links (TikTok and YouTube work too).
 * After adding Instagram reels, run `npm run portfolio` once: it saves their thumbnails in public/portfolio
 * (Instagram's own image links expire after a few days) and their captions in portfolio-meta.json.
 * Titles can be edited in portfolio-meta.json. To use your own cover instead of Instagram's (which has a play
 * button printed on it), replace public/portfolio/<code>.jpg with a 9:16 image of the same name.
 */
export const portfolio: string[] = [
  "https://www.instagram.com/timyedit/reel/DeJUg7FOVdz/",
  "https://www.instagram.com/timyedit/reel/DeAi3FxBTFV/",
  "https://www.instagram.com/timyedit/reel/Ddmcq_fOWe-/",
  "https://www.instagram.com/timyedit/reel/DdbPkGwO1d_/",
  "https://www.instagram.com/timyedit/reel/DcJTqGzgl0L/",
  "https://www.instagram.com/timyedit/reel/DcEjIhYpE8u/",
  "https://www.instagram.com/timyedit/reel/Db6qrGlOqSF/",
  "https://www.instagram.com/timyedit/reel/Dbso2Bruy5x/",
  "https://www.instagram.com/timyedit/reel/Dbk2bz8uTFc/",
  "https://www.instagram.com/timyedit/reel/Dbfaw5YO56P/",
  "https://www.instagram.com/timyedit/reel/DbbxwFtoDbI/",
  "https://www.instagram.com/timyedit/reel/DbWGGmTO4Vx/",
  "https://www.instagram.com/timyedit/reel/DbNnxBrO2RM/",
  "https://www.instagram.com/timyedit/reel/DbBKxG7IEWE/",
  "https://www.instagram.com/timyedit/reel/Da-pt2RIzr7/",
  "https://www.instagram.com/timyedit/reel/DZNLMiKoGAJ/",
  "https://www.instagram.com/timyedit/reel/DYo2UZduAcn/",
  "https://www.instagram.com/timyedit/reel/DX-Yr-voBQ0/",
  "https://www.instagram.com/timyedit/reel/DXPmpJ7jtki/",
  "https://www.instagram.com/timyedit/reel/DWeNmckCLR8/",
  "https://www.instagram.com/timyedit/reel/DVtTAgzCHkE/",
  "https://www.instagram.com/timyedit/reel/DUCBX8diEFE/",
  "https://www.instagram.com/timyedit/reel/DTQ1fGmjtx-/",
  "https://www.instagram.com/timyedit/reel/DXM_YVEjgVd/",
  "https://www.instagram.com/timyedit/reel/DUF7mb-iJ1N/",
  "https://www.instagram.com/timyedit/reel/DUDkl0biJHg/",
  "https://www.instagram.com/timyedit/reel/DT8bNF0AHF4/",
  "https://www.instagram.com/timyedit/reel/DTyQAJWDop-/",
  "https://www.instagram.com/timyedit/reel/DT4873kgD-Q/",
  "https://www.instagram.com/timyedit/reel/DTqhHeJDpEX/",
  "https://www.instagram.com/timyedit/reel/DTkue3HiEho/",
  "https://www.instagram.com/timyedit/reel/DTfRdUJCKgg/",
  "https://www.instagram.com/timyedit/reel/DTaZsYSCOD2/",
  "https://www.instagram.com/timyedit/reel/DTXchCcCMPh/",
  "https://www.instagram.com/timyedit/reel/DTVxQrRDt8d/",
  "https://www.instagram.com/timyedit/reel/DTTNRp7gOMt/",
  "https://www.instagram.com/timyedit/reel/DTRV2rsCB8-/",
  "https://www.instagram.com/timyedit/reel/DTSweItiIpI/",
  "https://www.instagram.com/timyedit/reel/DTRFvHcCOK8/",
];

export interface PortfolioItem {
  url: string;
  title: string;
  thumb?: string;
}

const instagramCode = (url: string) => url.match(/instagram\.com\/(?:[\w.]+\/)?(?:reel|p)\/([\w-]+)/)?.[1];

export function getPortfolio(): PortfolioItem[] {
  const known = meta as Record<string, { title?: string }>;
  return portfolio.map((url) => {
    const code = instagramCode(url);
    const info = code ? known[code] : undefined;
    return {
      url,
      title: info?.title || "Watch on Instagram",
      thumb: code && info ? `/portfolio/${code}.jpg` : undefined,
    };
  });
}
