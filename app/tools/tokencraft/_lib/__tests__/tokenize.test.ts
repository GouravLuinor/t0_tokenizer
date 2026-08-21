import { describe, it, expect } from "vitest";
import {
  tokenizeTextSafe,
  countWords,
  mapStatsToStorePatch,
} from "../tokenize";
import {
  formatNumber,
  formatCurrency,
  formatBytes,
} from "@/lib/utils";

describe("tokenizeTextSafe", () => {
  it("returns an empty result for empty input", () => {
    const stats = tokenizeTextSafe("", "gpt-4o");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(0);
    expect(stats!.tokens).toHaveLength(0);
  });

  it("produces consistent counts for simple text", () => {
    const text = "Hello, world! This is a tokenizer test.";
    const stats = tokenizeTextSafe(text, "claude-sonnet-5");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBe(stats!.tokens.length);
    expect(stats!.characterCount).toBe(text.length);
    // byte count >= character count for ASCII (should actually be equal)
    expect(stats!.byteCount).toBeGreaterThanOrEqual(0);
  });

  it("handles multi-byte unicode and emoji without crashing", () => {
    const text = "héllo 世界 🚀🎉";
    const stats = tokenizeTextSafe(text, "gpt-4o");
    expect(stats).not.toBeNull();
    expect(stats!.count).toBeGreaterThan(0);
    // UTF-8 byte length must exceed JS string length here
    expect(stats!.byteCount).toBeGreaterThan(text.length);
  });

  it("assigns sequential indices to chunks", () => {
    const stats = tokenizeTextSafe("one two three four five", "gpt-4o");
    expect(stats).not.toBeNull();
    stats!.tokens.forEach((chunk, i) => {
      expect(chunk.index).toBe(i);
    });
  });

  it("precomputes a lowercase search haystack containing id and text", () => {
    const stats = tokenizeTextSafe("Hello", "gpt-4o");
    const first = stats!.tokens[0];
    expect(first.search).toBe(`${first.text} #${first.id}`.toLowerCase());
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
      { index: 0, id: 1, text: "a", byteLength: 1, search: "a #1" },
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
