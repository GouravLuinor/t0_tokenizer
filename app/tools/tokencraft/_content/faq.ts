export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "Does TokenCraft store or log my prompts?",
    answer: "No. TokenCraft runs 100% locally in your browser using Web Workers and client-side BPE rank tables. Your text never leaves your device and is never transmitted to our servers, analytics, or third parties.",
  },
  {
    question: "Is TokenCraft free to use?",
    answer: "Yes, TokenCraft is completely free forever. We do not paywall features, display ads, or require credit cards. Free accounts unlock saved presets and audit report exports.",
  },
  {
    question: "Why do Claude, Gemini, and GPT models have different token counts?",
    answer: "Each AI lab trains a proprietary tokenizer with distinct vocabulary sizes (100k–256k) and merge rules. TokenCraft calculates exact counts for OpenAI's o200k_base and cl100k_base, and labels other models as estimates (o200k ≈), which track within ±2–4% on English and code.",
  },
  {
    question: "How are model pricing rates updated?",
    answer: "TokenCraft ships with a compile-time static snapshot of verified rates, and synchronizes live pricing in the background directly from OpenRouter's public models catalog.",
  },
  {
    question: "Can I use TokenCraft offline?",
    answer: "Once loaded in your browser tab, all tokenization runs completely offline — the engine, BPE rank tables, and fallback pricing are bundled into the application. Load the page once while connected, and it keeps working without an internet connection. Live pricing sync is the only feature that needs the network, and it degrades silently to the bundled snapshot.",
  },
];
