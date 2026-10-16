import type { BrandName } from "./brand-icons";

// Everything you are likely to edit on the site lives in this file.

export const site = {
  name: "timy.",
  handle: "timyedit",
  domain: "timy.studio",
  email: "contact@timy.studio",
  description:
    "Automotive CGI and 3D animation. Car films, stills, ads and Spotify Canvas, built in Blender.",
};

/**
 * Your links. Entries with an icon are shown as small logos (footer and About page); entries without
 * an icon are shown as text. Entries with an empty href are hidden.
 */
/**
 * Spotify. Paste your artist page and the link of each release (in the Spotify app: ··· > Share > Copy link).
 * Each cover on the About page opens its own link; a release without a link opens your artist page.
 */
export const spotifyArtistUrl = ""; // e.g. https://open.spotify.com/artist/xxxxxxxxxxxxxxxxxxxxxx
export const spotifyReleases: Record<string, string> = {
  HALO: "https://open.spotify.com/album/3lL9z243aCKmeMQ3bOTMDP",
  ATREY: "https://open.spotify.com/album/6li3fPJh8FoClg3gJTjWV7",
  ARYX: "https://open.spotify.com/album/1pZOFMDIJA4Axhk1ZTixbu",
  ELARIS: "https://open.spotify.com/album/4FC0H2hlRZSrRnarpRR0X0",
  NYTH: "https://open.spotify.com/album/5q7py3NPHjW7CBjidAhLbY",
  "LEVITAÇÃO": "https://open.spotify.com/album/04w3wa84FZTXCSrlWRmFkK",
  "ÓRBITA": "https://open.spotify.com/album/3ARpTEhr21GwfIXuJxQ0nO",
};

export const links: { label: string; href: string; group: string; icon: BrandName | null }[] = [
  { label: "TikTok", href: "https://www.tiktok.com/@timyedit", group: "social", icon: "tiktok" },
  { label: "Instagram", href: "https://www.instagram.com/timyedit", group: "social", icon: "instagram" },
  { label: "YouTube", href: "https://www.youtube.com/@timyedit", group: "social", icon: "youtube" },
  { label: "Spotify", href: spotifyArtistUrl, group: "listen", icon: "spotify" },
  // Add the URL of your SoundCloud profile to show its logo:
  { label: "SoundCloud", href: "", group: "listen", icon: "soundcloud" },
  { label: "Apple Music", href: "http://music.apple.com/us/artist/timy/1882198272", group: "listen", icon: "applemusic" },
  { label: "3D Hub (Discord)", href: "https://discord.gg/3dhub", group: "community", icon: "discord" },
  {
    label: "ProRender Cloud, $20 credit",
    href: "https://prorendercloud.com/sign-up?promo=timy20",
    group: "tools",
    icon: null,
  },
];

/**
 * Legal notice (/legal). Required by French law (LCEN) once you sell: fill address, phone and SIRET
 * as soon as you have them. Empty fields are simply left out of the page.
 */
export const legal = {
  name: "Timéo CATILLION",
  status: "Entrepreneur individuel (micro-entreprise)",
  address: "", // your business address, or a domiciliation address
  phone: "",
  siret: "", // shown as "registration in progress" while empty
  vat: "VAT not applicable, article 293 B of the French General Tax Code (CGI).",
  mediator: "", // consumer mediator (name + website), required before selling to consumers
};

export const linktreeUrl = "https://linktr.ee/timyedit";

/**
 * Your showcase. Paste the full URL of each video.
 * - YouTube Shorts / videos: shown as click-to-play embeds (nothing from YouTube loads until a visitor presses play).
 * - Anything else (TikTok, Instagram): shown as a card that opens the video in a new tab; for TikTok the
 *   thumbnail and title are fetched automatically, and you can override them with `title` / `thumb`.
 */
export const works: { url: string; title?: string; thumb?: string }[] = [
  { url: "https://www.youtube.com/shorts/NaR4L0-baXg" },
  { url: "https://www.youtube.com/shorts/lI13MS9YnOk" },
  { url: "https://www.youtube.com/shorts/znob-P5k22Q" },
  { url: "https://www.youtube.com/shorts/EsL0pJllq9o" },
  { url: "https://www.youtube.com/shorts/duW_oiJKw44" },
  { url: "https://www.youtube.com/shorts/QMl4HS9x_hA" },
  { url: "https://www.youtube.com/shorts/URLE88owFlo" },
  { url: "https://www.youtube.com/shorts/w2jyPkwYc60" },
  { url: "https://www.youtube.com/shorts/HfSrwJAI-kc" },
  { url: "https://www.youtube.com/shorts/bmJBvJkbVNI" },
];

/**
 * What you offer. It drives the strip on the first screen, the chapters of the scroll story and the
 * links to the brief form. `type` must match an entry of projectTypes below: it preselects that type on the form.
 */
export const services: { name: string; text: string; delivery: string; type: string }[] = [
  {
    name: "Car films",
    text: "A fully CG film of a car for a launch, a brand or an artist. Modelling clean-up, lighting, camera work, grade and sound sync.",
    delivery: "Landscape and vertical masters",
    type: "Car film",
  },
  {
    name: "Stills",
    text: "Photoreal renders of a car in a studio or somewhere it should not be. For covers, ads and catalogues.",
    delivery: "Single frames at print size",
    type: "Stills",
  },
  {
    name: "Ads",
    text: "Short ads for a car, a brand or a product, cut for TikTok, Reels, Shorts or the big screen.",
    delivery: "Short edits in the formats you need",
    type: "Ads",
  },
  {
    name: "Spotify Canvas",
    text: "The looping vertical visual that plays behind a track on Spotify, built around your release.",
    delivery: "Seamless vertical loops",
    type: "Spotify Canvas",
  },
  {
    name: "And more",
    text: "Cover art, visualizers, something that does not fit in a box. Describe it in a brief and we'll see what's possible.",
    delivery: "Scoped together in the chat",
    type: "Something else",
  },
];

export const steps = [
  { title: "Send a brief", text: "Describe the project, your budget and any files or references. It takes about five minutes." },
  { title: "Talk it through", text: "We chat on a private page made for your project. I ask questions, you adjust the idea." },
  { title: "Agree a price, then pay", text: "I propose a final price. You only pay once you accept it, securely through Stripe." },
  { title: "Receive your files", text: "I produce the work and send the final files through your project page." },
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

export const projectTypes = ["Car film", "Stills", "Ads", "Spotify Canvas", "Something else"];

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

/**
 * Your Spotify artist ID (the part after /artist/ in your Spotify URL). Optional.
 * With SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET set on the server (free, from developer.spotify.com),
 * your releases come straight from Spotify, with direct album links. Without them, covers come from
 * Apple Music and each cover links to a Spotify search for that release.
 */
export const spotifyArtistId = "";

/** Shown if the Apple Music lookup is unavailable. */
export const releasesFallback: { title: string; year?: string; art?: string; href?: string }[] = [];
