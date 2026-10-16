// Saves the thumbnail and caption of every Instagram reel listed in src/lib/portfolio.ts.
// Run with `npm run portfolio`. Already saved reels are skipped; delete a .jpg to fetch it again.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const list = readFileSync("src/lib/portfolio.ts", "utf8");
const codes = [...new Set([...list.matchAll(/instagram\.com\/(?:[\w.]+\/)?(?:reel|p)\/([\w-]+)/g)].map((m) => m[1]))];
const metaFile = "src/lib/portfolio-meta.json";
const meta = existsSync(metaFile) ? JSON.parse(readFileSync(metaFile, "utf8")) : {};
mkdirSync("public/portfolio", { recursive: true });

const decode = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&");

/** "timy. on Instagram: "wealth at its peak 🪙 | song: HALO #caredit"" -> "wealth at its peak 🪙" */
function titleFrom(ogTitle) {
  const caption = decode(ogTitle).match(/on Instagram: "([\s\S]*)"\s*$/)?.[1] ?? "";
  const first = caption.split("|")[0].replace(/#[^\s#]+/g, "").replace(/\s+/g, " ").trim();
  return first.slice(0, 80);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let saved = 0;
for (const code of codes) {
  const file = `public/portfolio/${code}.jpg`;
  if (existsSync(file) && meta[code]) continue;
  try {
    const page = await fetch(`https://www.instagram.com/reel/${code}/`, {
      headers: { "user-agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" },
    }).then((r) => r.text());
    const image = page.match(/property="og:image" content="([^"]+)"/)?.[1];
    const ogTitle = page.match(/property="og:title" content="([^"]+)"/)?.[1] ?? "";
    if (!image) throw new Error("no thumbnail in the page");
    const res = await fetch(decode(image));
    if (!res.ok) throw new Error(`thumbnail ${res.status}`);
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    meta[code] = { title: titleFrom(ogTitle) };
    saved++;
    console.log(`ok   ${code}  ${meta[code].title}`);
  } catch (err) {
    console.log(`fail ${code}  ${err.message}`);
  }
  await sleep(700); // stay gentle with Instagram
}
writeFileSync(metaFile, JSON.stringify(meta, null, 2) + "\n");
console.log(`${saved} new thumbnail(s), ${codes.length} reels listed.`);
