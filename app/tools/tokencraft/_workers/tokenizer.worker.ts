import {
  tokenizeText,
  countWords,
  type TokenizeRequest,
  type TokenizeResponse,
} from "../_lib/tokenize";

self.onmessage = (e: MessageEvent<TokenizeRequest>) => {
  const { id, text, model } = e.data;

  if (!text) {
    const empty: TokenizeResponse = {
      id,
      tokens: [],
      count: 0,
      characterCount: 0,
      wordCount: 0,
      byteCount: 0,
      executionTimeMs: 0,
    };
    self.postMessage(empty);
    return;
  }

  try {
    const result = tokenizeText(text, model);
    self.postMessage({ ...result, id } satisfies TokenizeResponse);
  } catch (error) {
    console.error("Tokenization worker error:", error);
    // Degrade gracefully: report counts we can compute without the encoder
    const degraded: TokenizeResponse = {
      id,
      tokens: [],
      count: 0,
      characterCount: text.length,
      wordCount: countWords(text),
      byteCount: new TextEncoder().encode(text).length,
      executionTimeMs: 0,
    };
    self.postMessage(degraded);
  }
};
