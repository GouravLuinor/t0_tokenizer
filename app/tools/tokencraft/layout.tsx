import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tokenizer & Token Cost Calculator — TokenCraft",
  description:
    "Count tokens with exact OpenAI o200k and cl100k BPE encodings in your browser. See token boundaries, check context window usage, and price your prompt across 95 live models. 100% client-side, no cloud storage.",
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
    title: "AI Tokenizer & Token Cost Calculator — TokenCraft",
    description:
      "Inspect BPE token boundaries, context window usage, and multi-model costs in real time. Fully client-side, your text never leaves the browser.",
    url: "/tools/tokencraft",
    siteName: "TokenCraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Tokenizer & Token Cost Calculator — TokenCraft",
    description:
      "Exact o200k & cl100k token counting and multi-model cost projection, in your browser.",
  },
};

export default function TokenCraftLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
