import {
  encode as encode4o,
  decode as decode4o,
} from "gpt-tokenizer/model/gpt-4o";
import {
  encode as encode4,
  decode as decode4,
} from "gpt-tokenizer/model/gpt-4";

export interface TokenChunk {
  index: number;
  id: number;
  text: string;
  byteLength: number;
  /** Precomputed lowercase haystack for client-side filtering */
  search: string;
}

export interface TokenizeRequest {
  id: number;
  text: string;
  model: string;
}

export interface TokenizeStats {
  tokens: TokenChunk[];
  count: number;
  characterCount: number;
  wordCount: number;
  byteCount: number;
  executionTimeMs: number;
}

export interface TokenizeResponse extends TokenizeStats {
  id: number;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Pure tokenization core shared by the Web Worker and the
 * main-thread fallback path.
 */
export function tokenizeText(
  text: string,
  model: string
): TokenizeStats {
  const startTime = performance.now();

  const isLegacy =
    model === "gpt-4" || model === "gpt-3.5-turbo" || model === "cl100k_base";
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
  model: string
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
    return tokenizeText(text, model);
  } catch {
    return null;
  }
}

/**
 * Wire-format → store-schema patch. The worker protocol says {tokens, count};
 * the store schema says {tokenChunks, tokenCount}. Spreading one into the
 * other silently writes phantom keys, so every application MUST go through
 * this explicit mapping (guarded by unit tests).
 */
export const TOKEN_STATS_STORE_FIELDS = [
  "tokenChunks",
  "tokenCount",
  "characterCount",
  "wordCount",
  "byteCount",
  "executionTimeMs",
] as const;

export function mapStatsToStorePatch(
  stats: TokenizeStats
): {
  tokenChunks: TokenChunk[];
  tokenCount: number;
  characterCount: number;
  wordCount: number;
  byteCount: number;
  executionTimeMs: number;
} {
  return {
    tokenChunks: stats.tokens,
    tokenCount: stats.count,
    characterCount: stats.characterCount,
    wordCount: stats.wordCount,
    byteCount: stats.byteCount,
    executionTimeMs: stats.executionTimeMs,
  };
}
