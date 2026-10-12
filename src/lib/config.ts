// Everything you are likely to edit on the site lives in this file.

export const site = {
  name: "timy.",
  handle: "timyedit",
  domain: "timy.studio",
  email: "contact.timyedit@gmail.com",
  description:
    "Automotive CGI and 3D animation. Photoreal car films, social cuts and stills, built in Blender.",
};

/** Links shown in the footer, on the About page and in the Links section. Entries with an empty href are hidden. */
export const links = [
  { label: "TikTok", href: "https://www.tiktok.com/@timyedit", group: "social" },
  { label: "Instagram", href: "https://www.instagram.com/timyedit", group: "social" },
  { label: "YouTube", href: "https://www.youtube.com/@timyedits", group: "social" },
  // Add the exact URLs from your Linktree for these two:
  { label: "SoundCloud", href: "", group: "listen" },
  { label: "Spotify", href: "", group: "listen" },
  { label: "Apple Music", href: "http://music.apple.com/us/artist/timy/1882198272", group: "listen" },
  { label: "3D Hub (Discord)", href: "https://discord.gg/3dhub", group: "community" },
  {
    label: "ProRender Cloud, $20 credit",
    href: "https://prorendercloud.com/sign-up?promo=timy20",
    group: "tools",
  },
] as const;

export const linktreeUrl = "https://linktr.ee/timyedit";

/**
 * Your TikTok showcase. Paste the full URL of each video.
 * Thumbnails and titles are fetched automatically from TikTok (oEmbed).
 * You can override either one, or use a local image in /public/work/.
 * Example:
 *   { url: "https://www.tiktok.com/@timyedit/video/7300000000000000000", title: "Bordeaux coupe, salt flat", thumb: "/work/coupe.jpg" }
 */
export const works: { url: string; title?: string; thumb?: string }[] = [];

/** Optional looping showreel for the hero (put the file in /public/media/). Leave empty to keep the plain hero. */
export const heroReel = ""; // e.g. "/media/reel.mp4"

export const services = [
  {
    name: "Car films",
    text: "A fully CG film of a car for a launch, a brand or an artist. Modelling clean-up, lighting, camera work, grade and sound sync.",
    delivery: "Landscape and vertical masters",
  },
  {
    name: "Social cuts",
    text: "Short vertical loops and teasers made for TikTok, Reels and Shorts, from your car or from a model of mine.",
    delivery: "Short vertical edits",
  },
  {
    name: "Stills",
    text: "Photoreal renders of a car in a studio or somewhere it should not be. For covers, ads and catalogues.",
    delivery: "Single frames at print size",
  },
  {
    name: "Visuals for music",
    text: "Covers, visualizers and promo loops for a release, built around the track.",
    delivery: "Loops, visualizers and covers",
  },
];

export const projectTypes = [
  "Car film",
  "Social cuts",
  "Stills",
  "Visuals for music",
  "Something else",
];

// Budget choices on the brief form. Edit freely (values are stored as plain text).
export const budgets = [
  "Under 300 EUR",
  "300 to 800 EUR",
  "800 to 2,000 EUR",
  "2,000 EUR and more",
  "Not sure yet",
];

export const maxFiles = 5;
export const maxFileSizeMB = 50; // Supabase free plan allows 50 MB per file

/** Apple Music artist IDs whose releases are shown on the About page (find the ID at the end of the artist URL). */
export const appleArtistIds = ["1882198272"]; // add the IDs of your other artist names here

/** Shown if the Apple Music lookup is unavailable. */
export const releasesFallback: { title: string; year?: string; art?: string; href?: string }[] = [];
