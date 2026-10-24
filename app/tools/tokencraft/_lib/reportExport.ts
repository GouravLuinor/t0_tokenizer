import type { ModelPricing } from "./modelTypes";
import { COMPANY, TOOL } from "@/lib/site";
import { formatCurrency, formatNumber } from "@/lib/utils";

export interface ReportParams {
  tokenCount: number;
  estimatedOutputTokens: number;
  batchVolume: number;
  outputMultiplier: number;
  models: Array<readonly [string, ModelPricing]>;
}

interface RunCosts {
  singleInput: number;
  singleCached: number;
  singleOutput: number;
  singleTotal: number;
  singleCachedTotal: number;
  batchTotal: number;
  batchCachedTotal: number;
  savings: number;
}

export function computeRunCosts(
  model: ModelPricing,
  tokenCount: number,
  estimatedOutputTokens: number,
  batchVolume: number
): RunCosts {
  const singleInput = (tokenCount * model.inputCostPer1M) / 1000000;
  const singleCached = (tokenCount * model.cachedInputCostPer1M) / 1000000;
  const singleOutput =
    (estimatedOutputTokens * model.outputCostPer1M) / 1000000;

  const singleTotal = singleInput + singleOutput;
  const singleCachedTotal = singleCached + singleOutput;
  const batchTotal = singleTotal * batchVolume;
  const batchCachedTotal = singleCachedTotal * batchVolume;

  return {
    singleInput,
    singleCached,
    singleOutput,
    singleTotal,
    singleCachedTotal,
    batchTotal,
    batchCachedTotal,
    savings: Math.max(0, batchTotal - batchCachedTotal),
  };
}

export function buildMarkdownReport({
  tokenCount,
  estimatedOutputTokens,
  batchVolume,
  outputMultiplier,
  models,
}: ReportParams): string {
  let md = `### Nor AI TokenCraft Cost & Multi-Model Analysis Report (2026)\n\n`;
  md += `Generated with ${TOOL.name} by ${COMPANY.short}: https://${TOOL.host}\n\n`;
  md += `* **Prompt Input Tokens:** ${formatNumber(tokenCount)}\n`;
  md += `* **Estimated Output Tokens (${outputMultiplier}x):** ${formatNumber(estimatedOutputTokens)}\n`;
  md += `* **Batch Executions:** ${formatNumber(batchVolume)}\n\n`;
  md += `| Model | Provider | Standard Input / 1M | Cached Input / 1M | Output / 1M | Single Run Total | Batch Total (${formatNumber(batchVolume)}) | Potential Savings |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  models.forEach(([, m]) => {
    const { singleTotal, batchTotal, savings } = computeRunCosts(
      m,
      tokenCount,
      estimatedOutputTokens,
      batchVolume
    );

    md += `| **${m.name}** | ${m.provider} | $${m.inputCostPer1M.toFixed(3)} | ${m.noCache ? "—" : `$${m.cachedInputCostPer1M.toFixed(3)}`} | $${m.outputCostPer1M.toFixed(3)} | ${formatCurrency(singleTotal, 5)} | ${formatCurrency(batchTotal, 2)} | ${savings > 0 ? `Save ${formatCurrency(savings, 2)}` : "$0.00"} |\n`;
  });

  return md;
}

function escapeCsvField(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function buildCsvReport({
  tokenCount,
  estimatedOutputTokens,
  batchVolume,
  models,
}: ReportParams): string {
  let csv = `Model,Provider,Family,Standard Input 1M,Cached Input 1M,Output 1M,Single Run Total USD,Batch Total (${batchVolume}) USD,Batch Cached USD,Potential Savings USD,No Cache Tier,Tiered Pricing\n`;

  models.forEach(([, m]) => {
    const {
      singleTotal,
      batchTotal,
      batchCachedTotal,
      savings,
    } = computeRunCosts(m, tokenCount, estimatedOutputTokens, batchVolume);

    csv += `${escapeCsvField(m.name)},${escapeCsvField(m.provider)},${escapeCsvField(m.family)},${m.inputCostPer1M},${m.cachedInputCostPer1M},${m.outputCostPer1M},${singleTotal.toFixed(6)},${batchTotal.toFixed(4)},${batchCachedTotal.toFixed(4)},${savings.toFixed(4)},${m.noCache ? "yes" : "no"},${m.tieredPricing ? "yes" : "no"}\n`;
  });

  return csv;
}

export interface JsonReport {
  source: string;
  timestamp: string;
  promptTokens: number;
  estimatedOutputTokens: number;
  batchVolume: number;
  models: Array<{
    modelId: string;
    name: string;
    provider: string;
    standardInputCost1M: number;
    cachedInputCost1M: number;
    noCacheTier: boolean;
    tieredPricing: boolean;
    tieredAboveTokens: number | null;
    outputCost1M: number;
    singleRunTotalUSD: number;
    singleRunCachedUSD: number;
    batchTotalUSD: number;
    batchCachedUSD: number;
  }>;
}

export function buildJsonReport({
  tokenCount,
  estimatedOutputTokens,
  batchVolume,
  models,
}: ReportParams): JsonReport {
  return {
    source: `${TOOL.name} by ${COMPANY.short}, https://${TOOL.host}`,
    timestamp: new Date().toISOString(),
    promptTokens: tokenCount,
    estimatedOutputTokens,
    batchVolume,
    models: models.map(([, m]) => {
      const {
        singleTotal,
        singleCachedTotal,
        batchTotal,
        batchCachedTotal,
      } = computeRunCosts(m, tokenCount, estimatedOutputTokens, batchVolume);

      return {
        modelId: m.id,
        name: m.name,
        provider: m.provider,
        standardInputCost1M: m.inputCostPer1M,
        cachedInputCost1M: m.cachedInputCostPer1M,
        noCacheTier: Boolean(m.noCache),
        tieredPricing: Boolean(m.tieredPricing),
        tieredAboveTokens: m.tieredAboveTokens ?? null,
        outputCost1M: m.outputCostPer1M,
        singleRunTotalUSD: singleTotal,
        singleRunCachedUSD: singleCachedTotal,
        batchTotalUSD: batchTotal,
        batchCachedUSD: batchCachedTotal,
      };
    }),
  };
}

export function triggerBlobDownload(
  content: string,
  mimeType: string,
  filename: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Release the blob reference — browsers keep object URLs alive until revoked
  URL.revokeObjectURL(url);
}
