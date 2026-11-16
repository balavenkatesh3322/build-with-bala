import type { Metadata, Viewport } from "next";
import { Outfit, Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import VotesProvider from "@/components/VotesProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Effects from "@/components/Effects";
import { keywords, site } from "@/lib/site";

const display = Outfit({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"], display: "swap" });
const body = Roboto({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "700"], display: "swap" });
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["500"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  keywords,
  authors: [{ name: site.owner, url: site.portfolio }],
  creator: site.owner,
  publisher: site.owner,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "en_US", siteName: site.name, title: `${site.name}: ${site.tagline}`, description: site.description, url: "/" },
  twitter: { card: "summary_large_image", title: `${site.name}: ${site.tagline}`, description: site.description, creator: "@balavenkatesh22", site: "@balavenkatesh22" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  formatDetection: { telephone: false },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
};
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: dark)", color: "#16151c" }, { media: "(prefers-color-scheme: light)", color: "#fcfbfd" }],
  colorScheme: "dark light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, description: site.description, inLanguage: "en", publisher: { "@id": `${site.url}/#person` } },
    { "@type": "Person", "@id": `${site.url}/#person`, name: site.owner, url: site.portfolio, image: `${site.url}/bala.jpg`,
      sameAs: [site.portfolio, site.socials.github, site.socials.instagram, site.socials.x, site.socials.linkedin, site.socials.medium] },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-motion="on" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <ThemeProvider>
          <VotesProvider>
            <a href="#main" className="skip">Skip to content</a>
            <Nav />
            <main id="main">{children}</main>
            <Footer />
            <WhatsAppButton />
            <Effects />
          </VotesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
