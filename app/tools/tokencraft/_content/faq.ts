export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "How do I count tokens for ChatGPT or GPT models?",
    answer:
      "Paste your text into the prompt box and pick a GPT model. TokenCraft runs OpenAI's own o200k_base or cl100k_base encoding in your browser, so the count matches what the API bills, and each token is underlined in place so you can see where it splits.",
  },
  {
    question: "Are the counts for Claude, Gemini, Llama and other models exact?",
    answer:
      "No, and TokenCraft says so on every one of them with an “≈ Estimate” stamp. Those labs use their own tokenizers, which are not all public. TokenCraft counts them with o200k_base as a close stand-in. Real counts can differ, and newer non-OpenAI tokenizers often produce more tokens for the same text, so leave headroom when a prompt is near a limit.",
  },
  {
    question: "How much does my prompt cost?",
    answer:
      "The answer panel prices the prompt three ways for the model you pick: the input alone, one full call including the reply you expect, and that call times the number of calls you plan. The rate board below it prices the same call on every model, cheapest first.",
  },
  {
    question: "Where do the prices come from, and how fresh are they?",
    answer:
      "From OpenRouter's public model catalog. A copy is built into the page and refreshed weekly, and the page fetches current rates when it opens. The stamp in the top bar tells you which you are looking at: live, cached from an earlier visit, or the built-in snapshot with its date.",
  },
  {
    question: "Does TokenCraft store or send my prompts anywhere?",
    answer:
      "No. Tokenizing happens in a Web Worker inside your browser tab. Your text is saved only in your own browser's storage so it is still there when you come back, and you can clear it any time. The only network request the tool makes is fetching prices.",
  },
  {
    question: "How many words is 1,000 tokens?",
    answer:
      "For everyday English, roughly 700 to 800 words. Code, JSON and tables use more tokens per word, and Hindi, other Indic scripts and CJK text use more still. Paste your own text for the real figure; the Stats view shows characters and bytes per token.",
  },
  {
    question: "What is the difference between o200k_base and cl100k_base?",
    answer:
      "They are OpenAI's two current vocabularies. cl100k_base (about 100,000 tokens) came with GPT-4 and is still used by the text-embedding-3 models. o200k_base (about 200,000 tokens) came with GPT-4o and is used by newer GPT models. The larger vocabulary usually needs fewer tokens, with the biggest gains on non-English text. The guide below has a live comparison.",
  },
  {
    question: "Does the minifier change what my prompt means?",
    answer:
      "It only removes formatting: comments in code blocks, repeated spaces and blank lines, trailing spaces, JSON indentation and Markdown table padding. It never rewrites words. You see a side-by-side diff with the real token saving before anything is applied, and you can undo it.",
  },
  {
    question: "Is TokenCraft free?",
    answer:
      "Yes. Counting, pricing, the rate board and the minifier are free with no account. A free account is needed only to export the rate board as CSV, JSON or Markdown.",
  },
  {
    question: "Does it work offline?",
    answer:
      "Once the page has loaded, counting keeps working without a connection because the tokenizer runs on your device. Prices fall back to the last rates you fetched, or to the built-in snapshot.",
  },
];
