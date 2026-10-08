import {
  encode as encode4o,
  decode as decode4o,
} from "gpt-tokenizer/model/gpt-4o";
import {
  encode as encode4,
  decode as decode4,
} from "gpt-tokenizer/model/gpt-4";

import type {
  TokenChunk,
  TokenizeStats,
  TokenizerEncoding,
} from "./tokenizeTypes";

export * from "./tokenizeTypes";

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Pure tokenization core shared by the Web Worker and the
 * main-thread fallback path.
 *
 * `encoding` is supplied by the caller from the active model's registry
 * entry — never inferred from display strings — so the cl100k_base path is
 * genuinely reachable (legacy GPT-3.5/GPT-4 models).
 */
export function tokenizeText(
  text: string,
  encoding: TokenizerEncoding
): TokenizeStats {
  const startTime = performance.now();

  const isLegacy = encoding === "cl100k_base";
  const encodeFn = isLegacy ? encode4 : encode4o;
  const decodeFn = isLegacy ? decode4 : decode4o;

  const encoder = new TextEncoder();
  const tokenIds = encodeFn(text);

  const tokens: TokenChunk[] = tokenIds.map((id, index) => {
    const rawChunk = decodeFn([id]);
    const byteLength = encoder.encode(rawChunk).length;
    return {
      index,
      id,
      text: rawChunk,
      byteLength,
      search: `${rawChunk} #${id}`.toLowerCase(),
    };
  });

  return {
    tokens,
    count: tokenIds.length,
    characterCount: text.length,
    wordCount: countWords(text),
    byteCount: encoder.encode(text).length,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
  };
}

/** Safe variant for the main-thread fallback: never throws. */
export function tokenizeTextSafe(
  text: string,
  encoding: TokenizerEncoding
): TokenizeStats | null {
  try {
    if (!text) {
      return {
        tokens: [],
        count: 0,
        characterCount: 0,
        wordCount: 0,
        byteCount: 0,
        executionTimeMs: 0,
      };
    }
    return tokenizeText(text, encoding);
  } catch {
    return null;
  }
}
