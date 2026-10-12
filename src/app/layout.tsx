import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
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
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0c0e12",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
