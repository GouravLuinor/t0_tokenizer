/**
 * Tokenizer-free shared types and the wire→store mapping.
 *
 * These live OUTSIDE tokenize.ts on purpose: the page mount path imports this
 * module, so it must never pull the gpt-tokenizer BPE rank tables (~1.5 MB)
 * into the initial bundle. Only the worker and the lazy inline fallback may
 * import tokenize.ts, which owns the actual encoders.
 */

export type TokenizerEncoding = "o200k_base" | "cl100k_base";

export interface TokenChunk {
  index: number;
  id: number;
  text: string;
  byteLength: number;
  /**
   * UTF-16 offsets of this token in the source text. Tokens that each hold
   * part of one multi-byte character share the span of that whole character.
   */
  start: number;
  end: number;
  /** Precomputed lowercase haystack for client-side filtering */
  search: string;
}

export interface TokenizeRequest {
  id: number;
  text: string;
  encoding: TokenizerEncoding;
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
