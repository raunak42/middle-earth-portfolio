import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

const cardImage = {
  url: "/meta/lotr-portfolio-card.jpg",
  width: 1200,
  height: 675,
  alt: "Paper-crafted Lord of the Rings characters for a 3D portfolio.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Raunak's Middle Earth",
  description: "3D Portfolio",
  openGraph: {
    title: "Raunak's Middle Earth",
    description: "3D Portfolio",
    type: "website",
    siteName: "Raunak's Middle Earth",
    images: [cardImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raunak's Middle Earth",
    description: "3D Portfolio",
    images: [cardImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ backgroundColor: "#000000" }}>
      <head>
        <link
          rel="preload"
          href="/bgggg.webp"
          as="image"
          type="image/webp"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/shantell-sans/ShantellSans-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/shantell-sans/ShantellSans-ExtraBold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body style={{ backgroundColor: "#000000" }}>{children}</body>
    </html>
  );
}