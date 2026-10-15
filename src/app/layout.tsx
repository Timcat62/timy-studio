import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { GlassPointer } from "@/components/GlassPointer";
import { Header } from "@/components/Header";
import { site } from "@/lib/config";
import { siteUrl } from "@/lib/format";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "timy. | Automotive CGI and 3D animation", template: "%s | timy." },
  description: site.description,
  openGraph: {
    title: "timy. | Automotive CGI and 3D animation",
    description: site.description,
    url: siteUrl(),
    siteName: "timy.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "A car floating in orbit above the Earth" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export const viewport: Viewport = {
  themeColor: "#0c0e12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlassPointer />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
