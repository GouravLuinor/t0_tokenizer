import type { Metadata } from "next";
import { INITIAL_MODEL_REGISTRY } from "./_lib/priceService";

const MODELS = Object.keys(INITIAL_MODEL_REGISTRY).length;
const TITLE = "Token Counter & LLM Cost Calculator · TokenCraft by Nor AI";
const OG_IMAGE = {
  url: "/tools/tokencraft/opengraph-image",
  width: 1200,
  height: 630,
  alt: "TokenCraft by Nor AI: token counter and LLM cost calculator",
};
const DESCRIPTION = `Count tokens and price your prompt across ${MODELS} models at live OpenRouter rates. Exact counts for GPT (o200k_base, cl100k_base), clearly marked estimates for Claude, Gemini, Llama and others. Free, no sign-up, runs in your browser.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "token counter",
    "LLM cost calculator",
    "GPT token counter",
    "Claude token counter",
    "Gemini token calculator",
    "tokenizer",
    "o200k_base",
    "cl100k_base",
    "AI API pricing",
    "prompt minifier",
  ],
  alternates: { canonical: "/tools/tokencraft" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: "/tools/tokencraft",
    siteName: "TokenCraft by Nor AI",
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE.url] },
};

export default function TokenCraftLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
