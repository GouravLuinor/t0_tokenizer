import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F3B2E" },
    { media: "(prefers-color-scheme: dark)", color: "#0F3B2E" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Token Counter & LLM Cost Calculator — TokenCraft",
    template: "%s — TokenCraft",
  },
  description:
    "Count tokens for GPT, Claude, Gemini, Llama and 90+ models, see exactly where each token splits, and compare what your prompt costs at live OpenRouter rates. Free, private, runs in your browser.",
  applicationName: "TokenCraft",
  authors: [{ name: "Nor AI", url: "https://norai.tech" }],
  creator: "Nor AI",
  publisher: "Nor AI",
};

/**
 * Applies the stored or system theme before first paint so neither theme
 * flashes. Kept tiny and dependency-free; ThemeToggle owns later changes.
 */
const THEME_BOOT = `(function(){try{var t=localStorage.getItem("tc-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${barlow.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
