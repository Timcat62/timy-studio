/**
 * Your best videos, shown on /portfolio in this order, playable right on the page.
 * Paste the YouTube Short link and a title. After adding videos, run `npm run portfolio` once:
 * it saves a clean vertical cover for each one in public/portfolio.
 */
export const portfolio: { url: string; title: string }[] = [
  { url: "https://www.youtube.com/shorts/lRLQeJtkSxA", title: "Wealth at its peak 🪙" },
  { url: "https://www.youtube.com/shorts/lI13MS9YnOk", title: "A shower of money 💵" },
  { url: "https://www.youtube.com/shorts/xl5OjoMAi7w", title: "Two space shuttles 🚀" },
  { url: "https://www.youtube.com/shorts/NaR4L0-baXg", title: "R35 in Minecraft 🌸" },
  { url: "https://www.youtube.com/shorts/OElCAqVOAhc", title: "Is this 4DX? 🍿" },
  { url: "https://www.youtube.com/shorts/bmJBvJkbVNI", title: "In the ocean depths 🌊" },
  { url: "https://www.youtube.com/shorts/_Jv-Eawk-x4", title: "The last shot is my favourite ✨" },
  { url: "https://www.youtube.com/shorts/HtTqFIGWukk", title: "I might have missed the turn-off 🏜️" },
  { url: "https://www.youtube.com/shorts/2QeXgKil_y4", title: "Porsche in the storm ⚡" },
  { url: "https://www.youtube.com/shorts/HfSrwJAI-kc", title: "As a bed of cotton ☁️" },
  { url: "https://www.youtube.com/shorts/YPshTy0y6To", title: "It makes me dizzy 😵‍💫" },
  { url: "https://www.youtube.com/shorts/znob-P5k22Q", title: "Lost in a flower field 🌷" },
  { url: "https://www.youtube.com/shorts/z2pA7FhH7vI", title: "BMW M4 GT3 falling from the sky" },
  { url: "https://www.youtube.com/shorts/D4EDyZtzYHM", title: "Pink Porsche in bloom 🌸" },
  { url: "https://www.youtube.com/shorts/4glVYyq1Khs", title: "Armstrong took the wrong rover" },
  { url: "https://www.youtube.com/shorts/EsL0pJllq9o", title: "GT3 RS in space 🛰️" },
  { url: "https://www.youtube.com/shorts/yTcQb0xd8w0", title: "BMW falling in the void" },
  { url: "https://www.youtube.com/shorts/w2jyPkwYc60", title: "Best mod" },
  { url: "https://www.youtube.com/shorts/ibGIZzWvKdw", title: "DeLorean in space" },
  { url: "https://www.youtube.com/shorts/duW_oiJKw44", title: "DeLorean falling from the sky" },
  { url: "https://www.youtube.com/shorts/KqMX42Y8VhY", title: "Pagani falling from the sky" },
  { url: "https://www.youtube.com/shorts/NeeOQobwt9E", title: "Formula 1 falling from the sky" },
  { url: "https://www.youtube.com/shorts/QMl4HS9x_hA", title: "Porsche R Rennsport falling from the sky" },
];

export interface PortfolioItem {
  id: string;
  url: string;
  title: string;
  poster: string;
}

const shortId = (url: string) => url.match(/(?:shorts\/|v=|youtu\.be\/)([\w-]{6,})/)?.[1] ?? "";

export function getPortfolio(): PortfolioItem[] {
  return portfolio
    .map((p) => ({ ...p, id: shortId(p.url) }))
    .filter((p) => p.id)
    .map((p) => ({ id: p.id, url: `https://www.youtube.com/shorts/${p.id}`, title: p.title, poster: `/portfolio/${p.id}.jpg` }));
}
