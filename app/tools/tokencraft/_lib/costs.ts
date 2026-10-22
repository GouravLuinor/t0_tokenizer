import type { ModelPricing } from "./modelTypes";

/**
 * Pure pricing arithmetic shared by the answer panel, the rate board and the
 * model pages. Rates are USD per 1M tokens, as stored in the catalog.
 */

export interface CallCost {
  /** Input tokens at the standard rate */
  input: number;
  /** Input tokens at the cached-prefix rate (equals `input` without a cache tier) */
  cachedInput: number;
  /** Estimated output tokens at the output rate */
  output: number;
  /** input + output */
  total: number;
  /** cachedInput + output */
  totalCached: number;
}

export function callCost(
  model: ModelPricing,
  inputTokens: number,
  outputTokens: number
): CallCost {
  const input = (inputTokens * model.inputCostPer1M) / 1_000_000;
  const cachedRate = model.noCache ? model.inputCostPer1M : model.cachedInputCostPer1M;
  const cachedInput = (inputTokens * cachedRate) / 1_000_000;
  const output = (outputTokens * model.outputCostPer1M) / 1_000_000;
  return {
    input,
    cachedInput,
    output,
    total: input + output,
    totalCached: cachedInput + output,
  };
}

/** Percent saved on input by the cached-prefix tier, or null when there is none. */
export function cacheSavingPercent(model: ModelPricing): number | null {
  if (model.noCache || model.inputCostPer1M <= 0) return null;
  const pct = (1 - model.cachedInputCostPer1M / model.inputCostPer1M) * 100;
  return pct > 0.5 ? Math.round(pct) : null;
}

/** Exact counts exist only for the encodings we actually run. */
export function isExactCount(model: ModelPricing): boolean {
  return model.family === "o200k_base" || model.family === "cl100k_base";
}

export type FitStatus = "fits" | "tight" | "over";

export interface ContextFit {
  input: number;
  output: number;
  capacity: number;
  remaining: number;
  /** Share of capacity, 0–1, clamped */
  inputShare: number;
  outputShare: number;
  status: FitStatus;
}

export function contextFit(
  model: ModelPricing,
  inputTokens: number,
  outputTokens: number
): ContextFit {
  const capacity = Math.max(1, model.contextWindow);
  const used = inputTokens + outputTokens;
  const inputShare = Math.min(1, inputTokens / capacity);
  const outputShare = Math.min(1 - inputShare, outputTokens / capacity);
  const status: FitStatus =
    used > capacity ? "over" : used > capacity * 0.8 ? "tight" : "fits";
  return {
    input: inputTokens,
    output: outputTokens,
    capacity,
    remaining: Math.max(0, capacity - used),
    inputShare,
    outputShare,
    status,
  };
}

/** True when the prompt crosses a model's higher long-context price tier. */
export function crossesPriceTier(model: ModelPricing, inputTokens: number): boolean {
  return Boolean(model.tieredAboveTokens && inputTokens > model.tieredAboveTokens);
}

/**
 * Position of a blended rate on one fixed logarithmic ramp, 0–1. The ramp
 * spans $0.003 to $100 per 1M tokens so every row on every board is drawn
 * against the same scale and cheap/expensive reads at a glance.
 */
const RAMP_MIN = Math.log10(0.003);
const RAMP_MAX = Math.log10(100);

export function rampPosition(ratePer1M: number): number {
  if (!(ratePer1M > 0)) return 0;
  const p = (Math.log10(ratePer1M) - RAMP_MIN) / (RAMP_MAX - RAMP_MIN);
  return Math.min(1, Math.max(0.02, p));
}

/** Input rate blended with output rate at the chosen output ratio. */
export function blendedRate(model: ModelPricing, outputRatio: number): number {
  return (model.inputCostPer1M + model.outputCostPer1M * outputRatio) / (1 + outputRatio);
}

export interface RankedModel {
  key: string;
  model: ModelPricing;
  cost: CallCost;
}

/** True when the catalog lists no price at all (free previews, non-text models). */
export function isUnpriced(model: ModelPricing): boolean {
  return model.inputCostPer1M <= 0 && model.outputCostPer1M <= 0;
}

/**
 * Priced models that can hold this call, cheapest total first. Unpriced
 * entries are left out: a $0 row is a catalog gap, not a recommendation.
 */
export function rankByCost(
  registry: Record<string, ModelPricing>,
  inputTokens: number,
  outputTokens: number
): RankedModel[] {
  return Object.entries(registry)
    .filter(([, m]) => !isUnpriced(m) && m.contextWindow >= inputTokens + outputTokens)
    .map(([key, model]) => ({ key, model, cost: callCost(model, inputTokens, outputTokens) }))
    .sort((a, b) => a.cost.total - b.cost.total || a.model.name.localeCompare(b.model.name));
}

/**
 * Money formatting tuned for tiny per-call figures: enough significant
 * digits to compare models, never scientific notation, never "$0.00" for a
 * non-zero amount.
 */
export function formatMoney(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "$0";
  const abs = Math.abs(value);
  if (abs >= 100) return `$${Math.round(value).toLocaleString("en-US")}`;
  if (abs >= 1) return `$${value.toFixed(2)}`;
  if (abs < 0.000001) return "<$0.000001";
  const digits = Math.min(6, Math.max(2, 1 - Math.floor(Math.log10(abs))));
  return `$${value.toFixed(digits)}`;
}

/** Rates per 1M: compact but exact to the catalog's precision. */
export function formatRate(ratePer1M: number): string {
  if (ratePer1M === 0) return "0";
  if (ratePer1M >= 1) return ratePer1M.toFixed(2);
  return ratePer1M.toPrecision(2);
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(n % 1_000_000 ? 2 : 0)}M`;
  if (n >= 1000) return `${+(n / 1000).toFixed(n % 1000 ? 1 : 0)}k`;
  return String(n);
}
