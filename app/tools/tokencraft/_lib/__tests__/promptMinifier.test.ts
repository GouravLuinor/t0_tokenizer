import { describe, it, expect } from "vitest";
import {
  minifyPromptWithOptions,
  DEFAULT_MINIFY_OPTIONS,
} from "../promptMinifier";

describe("minifyPromptWithOptions", () => {
  it("returns an empty result for empty input", () => {
    const result = minifyPromptWithOptions("");
    expect(result.minifiedText).toBe("");
    expect(result.charSavings).toBe(0);
    expect(result.originalChars).toBe(0);
  });

  it("strips HTML/Markdown comments when enabled", () => {
    const input = "Keep this<!-- secret note -->and this";
    const result = minifyPromptWithOptions(input, {
      ...DEFAULT_MINIFY_OPTIONS,
      collapseWhitespace: false,
      trimLineEndings: false,
      compactTables: false,
      minifyJson: false,
    });
    expect(result.minifiedText).toBe("Keep thisand this");
  });

  it("preserves comment-like content inside code blocks", () => {
    const input = "```html\n<!-- not a prompt comment -->\n<div/>\n```";
    const result = minifyPromptWithOptions(input, {
      ...DEFAULT_MINIFY_OPTIONS,
      collapseWhitespace: false,
    });
    expect(result.minifiedText).toContain("<!-- not a prompt comment -->");
  });

  it("collapses runs of spaces but preserves list indents", () => {
    const input = "Title:     spaced\n-   item one";
    const result = minifyPromptWithOptions(input, {
      ...DEFAULT_MINIFY_OPTIONS,
      stripComments: false,
      compactTables: false,
      minifyJson: false,
    });
    expect(result.minifiedText.split("\n")[0]).toBe("Title: spaced");
    // list indentation is left intact
    expect(result.minifiedText.split("\n")[1]).toBe("-   item one");
  });

  it("compacts markdown table cells", () => {
    const input = "| Name   | Value |\n| :--- | :--- |";
    const result = minifyPromptWithOptions(input, {
      ...DEFAULT_MINIFY_OPTIONS,
      collapseWhitespace: false,
      stripComments: false,
      minifyJson: false,
    });
    expect(result.minifiedText).toBe("|Name|Value|\n|:---|:---|");
  });

  it("minifies standalone JSON documents", () => {
    const input = '{\n  "a": 1,\n  "b": [2, 3]\n}';
    const result = minifyPromptWithOptions(input, {
      ...DEFAULT_MINIFY_OPTIONS,
      stripComments: false,
      collapseWhitespace: false,
      compactTables: false,
    });
    expect(result.minifiedText).toBe('{"a":1,"b":[2,3]}');
  });

  it("does not corrupt near-JSON text that fails to parse", () => {
    const input = "{not valid json stays intact}";
    const result = minifyPromptWithOptions(input, {
      ...DEFAULT_MINIFY_OPTIONS,
      stripComments: false,
      collapseWhitespace: false,
      compactTables: false,
    });
    expect(result.minifiedText).toBe(input);
  });

  it("never increases character count", () => {
    const inputs = [
      "hello world",
      "{ \"a\": [1,2,3] }",
      "| a | b |\n| :--- | :--- |",
      "line one\n\n\n\nline two",
    ];
    for (const text of inputs) {
      const result = minifyPromptWithOptions(text);
      expect(result.charSavings).toBeGreaterThanOrEqual(0);
      expect(result.minifiedText.length).toBeLessThanOrEqual(text.length);
    }
  });
});
