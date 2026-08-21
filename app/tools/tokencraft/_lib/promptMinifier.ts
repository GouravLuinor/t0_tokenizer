export interface MinifyOptions {
  stripComments: boolean;
  collapseWhitespace: boolean;
  minifyJson: boolean;
  compactTables: boolean;
  trimLineEndings: boolean;
}

export const DEFAULT_MINIFY_OPTIONS: MinifyOptions = {
  stripComments: true,
  collapseWhitespace: true,
  minifyJson: true,
  compactTables: true,
  trimLineEndings: true,
};

export interface MinifyResult {
  minifiedText: string;
  originalChars: number;
  minifiedChars: number;
  charSavings: number;
  charSavingsPercent: number;
  linesRemoved: number;
}

export function minifyPromptWithOptions(
  text: string,
  options: MinifyOptions = DEFAULT_MINIFY_OPTIONS
): MinifyResult {
  if (!text) {
    return {
      minifiedText: "",
      originalChars: 0,
      minifiedChars: 0,
      charSavings: 0,
      charSavingsPercent: 0,
      linesRemoved: 0,
    };
  }

  const originalChars = text.length;
  const originalLinesCount = text.split("\n").length;

  let cleaned = text;

  // 1. Remove HTML / Markdown comments if enabled: <!-- comment -->
  if (options.stripComments) {
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  }

  // 2. Process line by line
  const lines = cleaned.split("\n");
  const processedLines: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      processedLines.push(options.trimLineEndings ? line.trimEnd() : line);
      continue;
    }

    if (inCodeBlock) {
      // In code blocks, preserve indentation but optionally strip trailing whitespace
      processedLines.push(options.trimLineEndings ? line.trimEnd() : line);
    } else {
      // Check if markdown table line
      if (
        options.compactTables &&
        line.trim().startsWith("|") &&
        line.trim().endsWith("|")
      ) {
        // Compact markdown table cells: | cell 1   | cell 2   | => |cell 1|cell 2|
        const cells = line
          .split("|")
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        processedLines.push(`|${cells.join("|")}|`);
      } else {
        let lineContent = options.trimLineEndings ? line.trimEnd() : line;

        // Collapse multiple spaces inside plain text (except list indents)
        if (options.collapseWhitespace) {
          if (!lineContent.match(/^\s*[-*+0-9.]/)) {
            lineContent = lineContent.replace(/[ \t]{2,}/g, " ");
          }
        }
        processedLines.push(lineContent);
      }
    }
  }

  // 3. Collapse multiple consecutive empty lines
  if (options.collapseWhitespace) {
    cleaned = processedLines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } else {
    cleaned = processedLines.join("\n");
  }

  // 4. Safely minify standalone JSON if enabled
  if (
    options.minifyJson &&
    ((cleaned.startsWith("{") && cleaned.endsWith("}")) ||
      (cleaned.startsWith("[") && cleaned.endsWith("]")))
  ) {
    try {
      const parsed = JSON.parse(cleaned);
      cleaned = JSON.stringify(parsed);
    } catch {
      // Fallback if not strictly JSON
    }
  }

  const minifiedChars = cleaned.length;
  const charSavings = Math.max(0, originalChars - minifiedChars);
  const charSavingsPercent =
    originalChars > 0 ? (charSavings / originalChars) * 100 : 0;
  const minifiedLinesCount = cleaned.split("\n").length;
  const linesRemoved = Math.max(0, originalLinesCount - minifiedLinesCount);

  return {
    minifiedText: cleaned,
    originalChars,
    minifiedChars,
    charSavings,
    charSavingsPercent: Number(charSavingsPercent.toFixed(1)),
    linesRemoved,
  };
}

export function minifyPrompt(text: string): MinifyResult {
  return minifyPromptWithOptions(text, DEFAULT_MINIFY_OPTIONS);
}
