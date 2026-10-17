/**
 * The site's release notes, newest first, shown on /updates.
 * Add an entry at the top for every update that visitors or clients can notice.
 */
export const updates: { version: string; date: string; title: string; changes: string[] }[] = [
  {
    version: "1.5",
    date: "2026-10-17",
    title: "Shop, files in the chat",
    changes: [
      "New shop: Blender project files, models and more, to buy or get for free and download right away.",
      "Send files in the project chat, up to 4 GB each, and download everything from your project page.",
      "Your account sits in a bubble next to the menu bar, and phones get a proper menu.",
      "Screenshots of each step next to “How working with me works”, following the scroll.",
      "Glass that bends what's behind its edges, like a real lens.",
      "Questions in the FAQ open and close smoothly.",
      "A longer portfolio, Instagram links next to YouTube and TikTok, and a lighter footer.",
    ],
  },
  {
    version: "1.4",
    date: "2026-10-17",
    title: "Portfolio you can watch here",
    changes: [
      "The portfolio now plays the videos right on the page, like the recent work on the homepage.",
      "Lighter, thinner liquid glass, and clear buttons with a touch of gold on the edge.",
      "Your account is now one tap away from the round button in the corner of every page.",
      "Stills from my videos fill the “And more” chapter and the homepage.",
      "Contact address in the footer for any other request, and a smaller footer logo.",
      "This page, so you can see what changed and when.",
    ],
  },
  {
    version: "1.3",
    date: "2026-10-17",
    title: "Portfolio and profiles",
    changes: [
      "New portfolio page with a selection of my best videos.",
      "Set your name and profile photo from your account.",
      "Rewritten texts: this is a one-person service, not a studio.",
      "New site icon, centred sign-in page, updated legal notice.",
    ],
  },
  {
    version: "1.2",
    date: "2026-10-16",
    title: "Client accounts",
    changes: [
      "Create an account with Google or with an email and password.",
      "All your projects, messages and files in one place, and only you can open them.",
      "Download the files you sent from your project page.",
      "Email notifications for every new message, both ways.",
      "Spotify buttons now open each release directly.",
    ],
  },
  {
    version: "1.1",
    date: "2026-10-16",
    title: "Payments and project chat",
    changes: [
      "Send a brief with your files, chat on a private project page and pay securely with Stripe once we agree on a price.",
      "Liquid glass buttons and header.",
    ],
  },
  {
    version: "1.0",
    date: "2026-10-12",
    title: "Launch",
    changes: ["First version of timy.studio: services, recent work, music and links."],
  },
];
