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
      start: 0,
      end: 0,
      search: `${rawChunk} #${id}`.toLowerCase(),
    };
  });

  assignOffsets(text, tokens);

  return {
    tokens,
    count: tokenIds.length,
    characterCount: text.length,
    wordCount: countWords(text),
    byteCount: encoder.encode(text).length,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
  };
}

/**
 * Walks the token list once, giving every token its UTF-16 span in `text`.
 *
 * gpt-tokenizer decodes statefully: a token holding only part of a
 * multi-byte character decodes to "" and the token that completes it carries
 * the whole character. Those leading partial tokens share the span of the
 * character they help build, so the overlay can underline it as one unit.
 */
function assignOffsets(text: string, tokens: TokenChunk[]): void {
  let pos = 0;
  let pendingFrom = -1;
  for (let i = 0; i < tokens.length; i++) {
    const piece = tokens[i].text;
    if (piece.length === 0) {
      if (pendingFrom < 0) pendingFrom = i;
      continue;
    }

    const at = text.startsWith(piece, pos) ? pos : text.indexOf(piece, pos);
    const start = at < 0 ? pos : at;
    const end = at < 0 ? pos : start + piece.length;

    if (pendingFrom >= 0) {
      const firstChar = String.fromCodePoint(piece.codePointAt(0) ?? 0);
      for (let k = pendingFrom; k < i; k++) {
        tokens[k].start = start;
        tokens[k].end = start + firstChar.length;
      }
      pendingFrom = -1;
    }

    tokens[i].start = start;
    tokens[i].end = end;
    pos = end;
  }

  for (let k = Math.max(pendingFrom, 0); pendingFrom >= 0 && k < tokens.length; k++) {
    tokens[k].start = pos;
    tokens[k].end = pos;
  }
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
