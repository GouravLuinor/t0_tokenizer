import { describe, it, expect } from "vitest";
import {
  buildCsvReport,
  buildJsonReport,
  buildMarkdownReport,
  computeRunCosts,
  type ReportParams,
} from "../reportExport";
import type { ModelPricing } from "../modelTypes";

const baseModel: ModelPricing = {
  id: "anthropic/claude-sonnet-5",
  name: "Claude Sonnet 5",
  provider: "Anthropic",
  family: "Claude BPE",
  encoding: "o200k_base",
  contextWindow: 1000000,
  inputCostPer1M: 2,
  cachedInputCostPer1M: 0.2,
  outputCostPer1M: 10,
  badgeText: "1.0M",
};

const noCacheModel: ModelPricing = {
  ...baseModel,
  id: "x-ai/grok-no-cache",
  name: 'Grok "Quoted", Inc',
  provider: "xAI",
  family: "Grok",
  encoding: "o200k_base",
  contextWindow: 131072,
  cachedInputCostPer1M: 3,
  outputCostPer1M: 15,
  badgeText: "131K",
  noCache: true,
};

const tieredModel: ModelPricing = {
  ...baseModel,
  id: "openai/gpt-6.1-sol",
  name: "GPT-6.1 Sol",
  provider: "OpenAI",
  family: "o200k_base",
  inputCostPer1M: 2,
  cachedInputCostPer1M: 0.1,
  tieredPricing: true,
  tieredAboveTokens: 272000,
};

const params: ReportParams = {
  tokenCount: 1000,
  estimatedOutputTokens: 500,
  batchVolume: 1000,
  outputMultiplier: 0.5,
  models: [
    ["claude-sonnet-5", baseModel],
    ["grok-no-cache", noCacheModel],
    ["gpt-6.1-sol", tieredModel],
  ],
};

describe("computeRunCosts", () => {
  it("derives per-run and batched totals from token counts", () => {
    const c = computeRunCosts(baseModel, 1000, 500, 1000);

    expect(c.singleInput).toBeCloseTo(0.002, 10);
    expect(c.singleOutput).toBeCloseTo(0.005, 10);
    expect(c.singleTotal).toBeCloseTo(0.007, 10);
    expect(c.batchTotal).toBeCloseTo(7, 10);
  });

  it("reports savings only when the cache tier is genuinely cheaper", () => {
    const cached = computeRunCosts(baseModel, 1000, 500, 1000);
    const noCache = computeRunCosts(noCacheModel, 1000, 500, 1000);

    expect(cached.savings).toBeGreaterThan(0);
    // cachedInputCostPer1M (3) exceeds inputCostPer1M (2): no savings to claim
    expect(noCache.savings).toBe(0);
  });

  it("never yields negative savings", () => {
    const c = computeRunCosts(
      { ...baseModel, cachedInputCostPer1M: 99 },
      1000,
      500,
      1000
    );
    expect(c.savings).toBe(0);
  });

  it("handles a zero-token prompt without NaN", () => {
    const c = computeRunCosts(baseModel, 0, 0, 1000);
    expect(Number.isFinite(c.batchTotal)).toBe(true);
    expect(c.batchTotal).toBe(0);
    expect(c.savings).toBe(0);
  });
});

describe("buildMarkdownReport", () => {
  const md = buildMarkdownReport(params);

  it("includes the prompt, output and batch summary", () => {
    expect(md).toContain("**Prompt Input Tokens:** 1,000");
    expect(md).toContain("**Estimated Output Tokens (0.5x):** 500");
    expect(md).toContain("**Batch Executions:** 1,000");
  });

  it("emits one table row per model", () => {
    const rows = md.split("\n").filter((l) => l.startsWith("| **"));
    expect(rows).toHaveLength(3);
  });

  it("shows an em dash, never a price, for models without a cache tier", () => {
    const row = md
      .split("\n")
      .find((l) => l.startsWith("| **Grok"));
    expect(row).toBeDefined();
    // cached cell must be the em dash, and must not leak the sentinel price
    const cachedCell = row!.split("|")[4].trim();
    expect(cachedCell).toBe("—");
    expect(row).not.toContain("$3.000");
  });

  it("reports real savings for cacheable models", () => {
    const row = md.split("\n").find((l) => l.startsWith("| **Claude"));
    expect(row).toContain("Save $");
  });
});

describe("buildCsvReport", () => {
  const csv = buildCsvReport(params);

  it("emits a header plus one row per model", () => {
    const lines = csv.trim().split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain("Potential Savings USD");
  });

  it("quotes every text field and doubles embedded quotes", () => {
    expect(csv).toContain('"Grok ""Quoted"", Inc"');
    expect(csv).toContain('"Anthropic"');
  });

  it("flags the cache tier and tiered pricing as explicit yes/no", () => {
    const row = csv.split("\n").find((l) => l.includes("Grok"));
    expect(row).toMatch(/,yes,no$/);
    const tieredRow = csv.split("\n").find((l) => l.includes("GPT-6.1 Sol"));
    expect(tieredRow).toMatch(/,no,yes$/);
  });
});

describe("buildJsonReport", () => {
  it("carries the honesty flags through to the export", () => {
    const report = buildJsonReport(params);

    const grok = report.models.find((m) => m.modelId === "x-ai/grok-no-cache");
    expect(grok?.noCacheTier).toBe(true);

    const sol = report.models.find((m) => m.modelId === "openai/gpt-6.1-sol");
    expect(sol?.tieredPricing).toBe(true);
    expect(sol?.tieredAboveTokens).toBe(272000);
  });

  it("serializes an absent tier threshold as null, never undefined", () => {
    const report = buildJsonReport(params);
    const claude = report.models.find(
      (m) => m.modelId === "anthropic/claude-sonnet-5"
    );
    expect(claude?.tieredAboveTokens).toBeNull();
    expect(JSON.parse(JSON.stringify(report))).toBeTruthy();
  });

  it("emits a parseable ISO timestamp", () => {
    const report = buildJsonReport(params);
    expect(report.timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
  });

  it("produces zero-cost rows for an empty prompt", () => {
    const report = buildJsonReport({
      ...params,
      tokenCount: 0,
      estimatedOutputTokens: 0,
    });
    report.models.forEach((m) => {
      expect(m.singleRunTotalUSD).toBe(0);
      expect(m.batchTotalUSD).toBe(0);
    });
  });
});
