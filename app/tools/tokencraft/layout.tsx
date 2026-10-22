import type { Metadata } from "next";
import { INITIAL_MODEL_REGISTRY } from "./_lib/priceService";

const MODELS = Object.keys(INITIAL_MODEL_REGISTRY).length;
const TITLE = "Token Counter & LLM Cost Calculator for GPT, Claude, Gemini";
const DESCRIPTION = `Count tokens and price your prompt across ${MODELS} models at live OpenRouter rates. Exact counts for GPT (o200k_base, cl100k_base), clearly marked estimates for Claude, Gemini, Llama and others. Free, no sign-up, runs in your browser.`;

export const metadata: Metadata = {
  title: { absolute: `${TITLE} — TokenCraft` },
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
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function TokenCraftLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
