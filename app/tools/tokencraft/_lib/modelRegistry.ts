import type { ModelPricing } from "./priceService";

export const FALLBACK_MODEL: ModelPricing = {
  id: "anthropic/claude-sonnet-5",
  name: "Claude Sonnet 5",
  provider: "Anthropic",
  family: "Claude BPE",
  encoding: "o200k_base",
  contextWindow: 1000000,
  inputCostPer1M: 2.0,
  cachedInputCostPer1M: 0.2,
  outputCostPer1M: 10.0,
  badgeText: "1.0M",
};

/** Resolves the active model or the first registry entry, never null. */
export function getCurrentModel(
  registry: Record<string, ModelPricing>,
  selectedId: string
): ModelPricing {
  return (
    registry[selectedId] ?? Object.values(registry)[0] ?? FALLBACK_MODEL
  );
}

/**
 * The engine tokenizes with cl100k/o200k BPE vocabularies regardless of the
 * selected provider. When the chosen model's native tokenizer differs from
 * what we compute, we disclose it instead of silently mislabeling counts.
 */
export function encodingDisclosure(family: string): string | null {
  if (family === "o200k_base" || family === "cl100k_base") return null;
  return "o200k ≈";
}
