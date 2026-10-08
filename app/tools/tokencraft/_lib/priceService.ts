import {
  CATALOG_GENERATED_AT,
  GENERATED_MODEL_CATALOG,
} from "./modelCatalog.generated";
import type { ModelPricing } from "./modelTypes";

export type { ModelPricing } from "./modelTypes";

export interface OpenRouterModelItem {
  id: string;
  name: string;
  context_length: number;
  architecture?: {
    tokenizer?: string;
    modality?: string;
  };
  pricing?: {
    prompt?: string;
    completion?: string;
    input_cache_read?: string;
    overrides?: Array<{ min_prompt_tokens?: number }>;
  };
}

/**
 * Curated snapshot generated from OpenRouter by scripts/sync-models.mjs.
 * The runtime live sync overwrites prices on top of this; the snapshot
 * guarantees a complete, current catalog when the network is unavailable.
 */
export const INITIAL_MODEL_REGISTRY: Record<string, ModelPricing> =
  GENERATED_MODEL_CATALOG;

/** ISO timestamp of the build-time snapshot above. */
export const MODEL_CATALOG_GENERATED_AT = CATALOG_GENERATED_AT;

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const STORAGE_KEY = "tokencraft_live_model_pricing_v2";
const STORAGE_TIMESTAMP_KEY = "tokencraft_live_pricing_timestamp_v2";

function round4(value: number): number {
  return Number(value.toFixed(4));
}

/** parseFloat with a finite fallback — never emits NaN into the UI. */
function parsePrice(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? round4(parsed * 1000000) : fallback;
}

/**
 * Fetches real-time model pricing from OpenRouter's free public endpoint.
 * Falls back gracefully to the generated snapshot on network error.
 */
export async function fetchLiveModelPricing(): Promise<{
  registry: Record<string, ModelPricing>;
  timestamp: string;
  fromCache: boolean;
}> {
  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const liveData: OpenRouterModelItem[] = json.data || [];

    // Create lookup by OpenRouter ID
    const liveMap = new Map<string, OpenRouterModelItem>();
    liveData.forEach((m) => liveMap.set(m.id, m));

    // Update prices for our registry
    const updatedRegistry: Record<string, ModelPricing> = { ...INITIAL_MODEL_REGISTRY };

    Object.entries(updatedRegistry).forEach(([key, model]) => {
      const live = liveMap.get(model.id);
      if (live && live.pricing) {
        const inputCost = parsePrice(live.pricing.prompt, model.inputCostPer1M);
        const outputCost = parsePrice(live.pricing.completion, model.outputCostPer1M);

        // A missing or zero input_cache_read means "no cache tier" — falling
        // back to a $0 cached price would advertise a fake -100% saving.
        const parsedCache = parseFloat(live.pricing.input_cache_read ?? "");
        const hasCache = Number.isFinite(parsedCache) && parsedCache > 0;

        const overrides = Array.isArray(live.pricing.overrides)
          ? live.pricing.overrides
          : [];
        const tierThresholds = overrides
          .map((o) => o.min_prompt_tokens)
          .filter((n): n is number => typeof n === "number" && n > 0)
          .sort((a, b) => a - b);

        updatedRegistry[key] = {
          ...model,
          contextWindow: live.context_length || model.contextWindow,
          inputCostPer1M: inputCost,
          cachedInputCostPer1M: hasCache
            ? round4(parsedCache * 1000000)
            : inputCost,
          outputCostPer1M: outputCost,
          noCache: !hasCache,
          tieredPricing: overrides.length > 0 || Boolean(model.tieredPricing),
          tieredAboveTokens: tierThresholds[0] ?? model.tieredAboveTokens,
        };
      }
    });

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Save to localStorage if in browser
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRegistry));
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, now);
      } catch {
        // Ignore storage errors
      }
    }

    return {
      registry: updatedRegistry,
      timestamp: now,
      fromCache: false,
    };
  } catch (err) {
    console.warn("Could not fetch live OpenRouter prices, using cached or generated registry:", err);

    // Try reading cached prices from localStorage
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        const cachedTime = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
        if (cached) {
          return {
            registry: JSON.parse(cached),
            timestamp: cachedTime || "Cached",
            fromCache: true,
          };
        }
      } catch {
        // Fall through
      }
    }

    return {
      registry: INITIAL_MODEL_REGISTRY,
      timestamp: "Snapshot Rates",
      fromCache: true,
    };
  }
}
