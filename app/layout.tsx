import type { Metadata } from "next";
import { Source_Serif_4, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display-family",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-family",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EEF College - Administration & Student Portal",
  description:
    "Official administration console and student portal for EEF College.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sourceSerif.variable} ${inter.variable} ${plexMono.variable}`}
      style={
        {
          "--font-display": "var(--font-display-family), Georgia, serif",
          "--font-body": "var(--font-body-family), sans-serif",
          "--font-mono": "var(--font-mono-family), monospace",
        } as React.CSSProperties
      }
    >
      <body>{children}</body>
    </html>
  );
}
