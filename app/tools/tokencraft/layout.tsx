import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TokenCraft — BPE Tokenizer & Multi-Model Cost Engine",
  description:
    "Zero-latency, in-browser BPE tokenization with real-time token boundary visualization, context-window safety gauges, multi-model cost projection, and prompt minification. 100% client-side.",
  keywords: [
    "tokenizer",
    "BPE",
    "gpt-4o tokenizer",
    "o200k",
    "cl100k",
    "context window optimizer",
    "prompt minifier",
    "LLM cost calculator",
  ],
  alternates: {
    canonical: "/tools/tokencraft",
  },
  openGraph: {
    type: "website",
    title: "TokenCraft — BPE Tokenizer & Multi-Model Cost Engine",
    description:
      "Inspect BPE token boundaries, hex encodings, and multi-model costs in real time. Fully client-side, zero cloud storage.",
    url: "/tools/tokencraft",
    siteName: "TokenCraft Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "TokenCraft — BPE Tokenizer & Cost Engine",
    description:
      "Real-time BPE tokenization and multi-model cost projection in your browser.",
  },
};

export default function TokenCraftLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
