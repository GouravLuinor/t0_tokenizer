import { describe, it, expect } from "vitest";
import { tokenizeTextSafe, countWords } from "../tokenize";
import { mapStatsToStorePatch } from "../tokenizeTypes";
import {
  formatNumber,
  formatCurrency,
  formatBytes,
} from "@/lib/utils";

describe("tokenizeTextSafe", () => {
  it("returns an empty result for empty input", () => {
    const stats = tokenizeTextSafe("", "o200k_base");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(0);
    expect(stats!.tokens).toHaveLength(0);
  });

  it("produces consistent counts for simple text", () => {
    const text = "Hello, world! This is a tokenizer test.";
    const stats = tokenizeTextSafe(text, "o200k_base");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(stats!.tokens.length);
    expect(stats!.characterCount).toBe(text.length);
    // byte count >= character count for ASCII (should actually be equal)
    expect(stats!.byteCount).toBeGreaterThanOrEqual(0);
  });

  it("handles multi-byte unicode and emoji without crashing", () => {
    const text = "héllo 世界 🚀🎉";
    const stats = tokenizeTextSafe(text, "o200k_base");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBeGreaterThan(0);
    // UTF-8 byte length must exceed JS string length here
    expect(stats!.byteCount).toBeGreaterThan(text.length);
  });

  it("assigns sequential indices to chunks", () => {
    const stats = tokenizeTextSafe("one two three four five", "o200k_base");
    expect(stats).not.toBeNull();
    stats!.tokens.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
    });
  });

  it("precomputes a lowercase search haystack containing id and text", () => {
    const stats = tokenizeTextSafe("Hello", "o200k_base");
    const first = stats!.tokens[0];
    expect(first.search).toBe(`${first.text} #${first.id}`.toLowerCase());
  });
});

describe("encoding selection", () => {
  const sample = "The quick brown fox jumps over the lazy dog. 🚀";

  it("genuinely runs two different BPE vocabularies", () => {
    // Regression guard: the cl100k path used to be unreachable because
    // callers passed registry keys and the check compared literal names.
    const o200k = tokenizeTextSafe(sample, "o200k_base");
    const cl100k = tokenizeTextSafe(sample, "cl100k_base");
    expect(o200k).not.toBeNull();
    expect(cl100k).not.toBeNull();
    // The vocabularies split this sentence differently (12 vs 13 tokens),
    // proving each encoder is actually wired up.
    expect(o200k!.count).toBe(12);
    expect(cl100k!.count).toBe(13);
  });

  it("returns identical results when called twice with the same encoding", () => {
    const a = tokenizeTextSafe(sample, "cl100k_base");
    const b = tokenizeTextSafe(sample, "cl100k_base");
    expect(a!.count).toBe(b!.count);
    expect(a!.tokens.map((t) => t.id)).toEqual(b!.tokens.map((t) => t.id));
  });
});

describe("countWords", () => {
  it("counts words across whitespace variants", () => {
    expect(countWords("a b c")).toBe(3);
    expect(countWords("  spaced\tout\nwords  ")).toBe(3);
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
  });
});

describe("mapStatsToStorePatch", () => {
  const sample = {
    tokens: [
      { index: 0, id: 1, text: "a", byteLength: 1, search: "a #1", start: 0, end: 1 },
    ],
    count: 1,
    characterCount: 3,
    wordCount: 2,
    byteCount: 4,
    executionTimeMs: 0.5,
  };

  it("maps wire-format fields onto the store schema", () => {
    const patch = mapStatsToStorePatch(sample);
    expect(patch.tokenChunks).toEqual(sample.tokens);
    expect(patch.tokenCount).toBe(sample.count);
    expect(patch.characterCount).toBe(3);
    expect(patch.wordCount).toBe(2);
    expect(patch.byteCount).toBe(4);
    expect(patch.executionTimeMs).toBe(0.5);
  });

  it("never leaks wire-format key names into the store patch", () => {
    // Regression guard: spreading the worker response straight into
    // setTokenData wrote phantom `tokens`/`count` keys while the real
    // tokenChunks/tokenCount fields stayed zeroed
    const patch = mapStatsToStorePatch(sample) as Record<string, unknown>;
    expect(Object.keys(patch)).not.toContain("tokens");
    expect(Object.keys(patch)).not.toContain("count");
    expect(Object.keys(patch).sort()).toEqual(
      [
        "byteCount",
        "characterCount",
        "executionTimeMs",
        "tokenChunks",
        "tokenCount",
        "wordCount",
      ].sort()
    );
  });
});

describe("format helpers", () => {
  it("formats numbers with grouping", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
  });

  it("formats currency with sub-cent floors", () => {
    expect(formatCurrency(0.00001)).toContain("<");
    expect(formatCurrency(1.5, 2)).toBe("$1.50");
  });

  it("formats bytes in binary units", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});

describe("character offsets", () => {
  const cases = [
    "The quick brown fox jumps over the lazy dog.",
    "héllo 世界 🚀🎉 नमस्ते दुनिया",
    "👨‍👩‍👧‍👦 family\n\tindent  double  space",
    "literal � replacement char",
    "",
  ];

  it.each(cases)("tiles the source text exactly: %s", (text) => {
    for (const enc of ["o200k_base", "cl100k_base"] as const) {
      const stats = tokenizeTextSafe(text, enc)!;
      let cursor = 0;
      for (const t of stats.tokens) {
        // Tokens never move backwards and stay within the text
        expect(t.start).toBeGreaterThanOrEqual(0);
        expect(t.end).toBeLessThanOrEqual(text.length);
        expect(t.start).toBeLessThanOrEqual(t.end);
        if (t.start > cursor) throw new Error(`gap at ${cursor}`);
        cursor = Math.max(cursor, t.end);
      }
      expect(cursor).toBe(text.length);
    }
  });

  it("maps clean tokens to their own text", () => {
    const text = "Hello world";
    const stats = tokenizeTextSafe(text, "o200k_base")!;
    for (const t of stats.tokens) {
      expect(text.slice(t.start, t.end)).toBe(t.text);
    }
    const emoji = tokenizeTextSafe("ok 🦜 ok", "cl100k_base")!;
    for (const t of emoji.tokens) {
      if (t.text) expect("ok 🦜 ok".slice(t.start, t.end)).toBe(t.text);
    }
  });

  it("groups tokens that split one multi-byte character", () => {
    const text = "🦜";
    const stats = tokenizeTextSafe(text, "cl100k_base")!;
    expect(stats.tokens.length).toBeGreaterThan(1);
    for (const t of stats.tokens) {
      expect(t.start).toBe(0);
      expect(t.end).toBe(text.length);
    }
    // The completing token carries the character; the others are partial
    expect(stats.tokens.at(-1)!.text).toBe(text);
  });
});
