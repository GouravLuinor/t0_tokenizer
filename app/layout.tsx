import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#09090B",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "TokenCraft & Context Optimizer | Nor AI Tier-0 Flagship",
  description:
    "In-browser BPE tokenization with exact o200k and cl100k token boundaries, real-time context window inspection, multi-model cost projection, and prompt minification. Your text never leaves your device.",
  keywords: [
    "tokenizer",
    "BPE",
    "gpt-4o",
    "cl100k",
    "o200k",
    "context window optimizer",
    "prompt minifier",
    "Nor AI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-background text-zinc-100 min-h-screen antialiased selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
