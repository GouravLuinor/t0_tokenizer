import type { TokenizerEncoding } from "./tokenizeTypes";

export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  family: string;
  /** Which BPE vocabulary the engine actually uses for this model. */
  encoding: TokenizerEncoding;
  contextWindow: number;
  inputCostPer1M: number;
  /**
   * Per-1M price for a cache read. When the provider exposes no cache tier
   * this equals inputCostPer1M and noCache is set — never a fake $0.
   */
  cachedInputCostPer1M: number;
  outputCostPer1M: number;
  badgeText: string;
  /** True when the provider exposes no prompt-cache pricing tier. */
  noCache?: boolean;
  /** True when conditional/tiered pricing applies (e.g. long-context tiers). */
  tieredPricing?: boolean;
  /** Smallest prompt-token threshold at which a higher pricing tier applies. */
  tieredAboveTokens?: number;
}
