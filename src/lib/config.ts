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

/**
 * The service rows on the homepage. `type` must match an entry of projectTypes below:
 * it preselects that type on the brief form. `media` is optional: a short looping video (.mp4/.webm)
 * or an image from /public (e.g. "/media/car-film.mp4") that plays when the row is hovered.
 */
export const services: { name: string; text: string; delivery: string; type: string; media?: string }[] = [
  {
    name: "Car films",
    text: "A fully CG film of a car for a launch, a brand or an artist. Modelling clean-up, lighting, camera work, grade and sound sync.",
    delivery: "Landscape and vertical masters",
    type: "Car film",
  },
  {
    name: "Social cuts",
    text: "Short vertical loops and teasers made for TikTok, Reels and Shorts, from your car or from a model of mine.",
    delivery: "Short vertical edits",
    type: "Social cuts",
  },
  {
    name: "Stills",
    text: "Photoreal renders of a car in a studio or somewhere it should not be. For covers, ads and catalogues.",
    delivery: "Single frames at print size",
    type: "Stills",
  },
  {
    name: "Visuals for music",
    text: "Covers, visualizers and promo loops for a release, built around the track.",
    delivery: "Loops, visualizers and covers",
    type: "Visuals for music",
  },
];

export const faq = [
  {
    q: "When do I pay?",
    a: "Only after we've talked it through and agreed on a final price. I send the price in your project chat and you pay securely through Stripe. Nothing is charged when you send a brief.",
  },
  {
    q: "What can I send you?",
    a: "Reference images, logos, brand guidelines, audio, and 3D models of the car if you have them: up to 5 files of 50 MB each on the form. For anything larger, share a link. No model? Tell me the car and we'll see what's possible.",
  },
  {
    q: "How do we talk during the project?",
    a: "Every brief gets a private page with a chat. You receive the link by email, and you can always reach me by email or on Instagram too.",
  },
  {
    q: "How are timing and revisions handled?",
    a: "Both are agreed in the chat before you pay, based on the scope of the job.",
  },
  {
    q: "Which payment methods can I use?",
    a: "Stripe shows what is available for your country at checkout, typically cards and wallets such as Apple Pay and Google Pay.",
  },
  {
    q: "Can I use the final files commercially?",
    a: "Yes, for the purpose we agree on together. The details are written down in the chat and in the terms.",
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
