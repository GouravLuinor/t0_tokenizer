export interface KnowledgeCard {
  title: string;
  body: string;
}

export const KNOWLEDGE_CARDS: KnowledgeCard[] = [
  {
    title: "What is an AI Tokenizer?",
    body: "Large language models don't read words or characters directly; they process text as numeric IDs called tokens. A tokenizer is a deterministic algorithm that decomposes raw text into these tokens using a fixed dictionary. Tokens represent whole words, word fragments, punctuation, or individual bytes.",
  },
  {
    title: "How are tokens counted?",
    body: "Token counting applies Byte Pair Encoding (BPE) merge rules against text. Starting from individual bytes, the algorithm iteratively merges the most frequent pairs in its vocabulary into composite tokens. Formatting, spaces, capitalization, and numbers directly alter merge boundaries.",
  },
  {
    title: "How many words are in 1,000 tokens?",
    body: "For standard English prose, 1,000 tokens is approximately 750 words (~0.75 words per token, or ~1.33 tokens per word). For source code, JSON, and LaTeX, the ratio shifts closer to 0.5–0.6 words per token due to indentation, punctuation, and camelCase syntax.",
  },
  {
    title: "How many tokens are in 1,000 words?",
    body: "In general English, 1,000 words yields approximately 1,300 to 1,400 tokens. Older vocabularies like cl100k_base trend higher (~1,350 tokens), while modern o200k_base compresses this by 5–15% thanks to its expanded 200,000-token dictionary.",
  },
  {
    title: "What is the difference between o200k and cl100k?",
    body: "cl100k_base (100k vocab) was introduced with GPT-4 and remains the standard for vector embeddings (text-embedding-3). o200k_base (200k vocab) powers GPT-4o, o1, and GPT-6, compressing code by ~15% and non-Latin scripts (Devanagari, CJK) by up to 25–40%.",
  },
  {
    title: "How does prompt caching reduce API costs?",
    body: "Prompt caching allows providers (Anthropic, OpenAI, DeepSeek, Google) to reuse pre-computed KV-cache states for identical prompt prefixes. Reusing stable context discounts input pricing by 75% to 95% (e.g. Claude Sonnet 5.5 drops from $2.00 to $0.10/1M on cache hits).",
  },
];
