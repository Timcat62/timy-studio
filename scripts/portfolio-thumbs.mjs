// Saves a clean vertical cover (540x960) for every YouTube Short listed in src/lib/portfolio.ts.
// Run with `npm run portfolio`. Covers already saved are skipped; delete one to fetch it again.
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

const list = readFileSync("src/lib/portfolio.ts", "utf8");
const ids = [...new Set([...list.matchAll(/youtube\.com\/shorts\/([\w-]{6,})/g)].map((m) => m[1]))];
mkdirSync("public/portfolio", { recursive: true });

let saved = 0;
for (const id of ids) {
  const file = `public/portfolio/${id}.jpg`;
  if (existsSync(file)) continue;
  // oar2 is the vertical cover of a Short; hqdefault is a last resort
  for (const name of ["oar2", "oardefault", "hqdefault"]) {
    const res = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
    if (!res.ok) continue;
    // trim() cuts the black bars YouTube adds around horizontal videos
    const trimmed = await sharp(Buffer.from(await res.arrayBuffer())).trim({ background: "#000", threshold: 12 }).toBuffer();
    await sharp(trimmed)
      .resize(540, 960, { fit: "cover" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(file);
    saved++;
    console.log(`ok   ${id} (${name})`);
    break;
  }
  if (!existsSync(file)) console.log(`fail ${id}`);
}
console.log(`${saved} new cover(s), ${ids.length} videos listed.`);
