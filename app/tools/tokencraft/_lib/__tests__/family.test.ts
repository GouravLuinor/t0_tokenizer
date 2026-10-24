import { describe, it, expect } from "vitest";
import { COMPANY, FAMILY_TOOLS, ORGANIZATION_JSONLD, TOOL } from "@/lib/site";
import { buildJsonReport, buildMarkdownReport, buildCsvReport } from "../reportExport";

describe("Nor AI family data", () => {
  it("keeps the shared company identity", () => {
    expect(COMPANY.name).toBe("Nor AI Technologies");
    expect(ORGANIZATION_JSONLD["@id"]).toBe("https://norai.tech/#organization");
  });

  it("lists TokenCraft and uses canonical domains, never the old ones", () => {
    expect(FAMILY_TOOLS.map((t) => t.href)).toEqual([
      "https://tokens.norai.tech",
      "https://schema.norai.tech",
      "https://regex.norai.tech",
      "https://rag.norai.tech",
      "https://judge.norai.tech",
      "https://anchor.norai.tech",
      "https://rozgar.norai.tech",
    ]);
    expect(FAMILY_TOOLS.find((t) => t.name === TOOL.name)?.href).toBe(`https://${TOOL.host}`);
  });
});

describe("exports credit the tool", () => {
  const params = { tokenCount: 10, estimatedOutputTokens: 5, batchVolume: 1, outputMultiplier: 1, models: [] };
  it("names Nor AI in Markdown and JSON, and leaves CSV pure data", () => {
    expect(buildMarkdownReport(params)).toContain("TokenCraft by Nor AI: https://tokens.norai.tech");
    expect(buildJsonReport(params).source).toBe("TokenCraft by Nor AI, https://tokens.norai.tech");
    expect(buildCsvReport(params).split("\n")[0]).toMatch(/^Model,Provider/);
  });
});
