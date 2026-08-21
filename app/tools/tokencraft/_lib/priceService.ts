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
  };
}

export interface ModelPricing {
  id: string;
  name: string;
  provider: string;
  family: string;
  contextWindow: number;
  inputCostPer1M: number;
  cachedInputCostPer1M: number;
  outputCostPer1M: number;
  badgeText: string;
}

// Curated active models for August 2026
export const INITIAL_MODEL_REGISTRY: Record<string, ModelPricing> = {
  "claude-sonnet-5": {
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    provider: "Anthropic",
    family: "Claude BPE",
    contextWindow: 1000000,
    inputCostPer1M: 2.0,
    cachedInputCostPer1M: 0.2,
    outputCostPer1M: 10.0,
    badgeText: "1.0M",
  },
  "claude-opus-5": {
    id: "anthropic/claude-opus-5",
    name: "Claude Opus 5",
    provider: "Anthropic",
    family: "Claude BPE",
    contextWindow: 1000000,
    inputCostPer1M: 5.0,
    cachedInputCostPer1M: 0.5,
    outputCostPer1M: 25.0,
    badgeText: "1.0M",
  },
  "gpt-5.6-sol": {
    id: "openai/gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    provider: "OpenAI",
    family: "o200k_base",
    contextWindow: 1050000,
    inputCostPer1M: 2.5,
    cachedInputCostPer1M: 0.25,
    outputCostPer1M: 15.0,
    badgeText: "1.1M",
  },
  "gpt-5.6-terra": {
    id: "openai/gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    provider: "OpenAI",
    family: "o200k_base",
    contextWindow: 1050000,
    inputCostPer1M: 2.0,
    cachedInputCostPer1M: 0.2,
    outputCostPer1M: 12.0,
    badgeText: "1.1M",
  },
  "gpt-5.6-luna": {
    id: "openai/gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    provider: "OpenAI",
    family: "o200k_base",
    contextWindow: 1050000,
    inputCostPer1M: 0.2,
    cachedInputCostPer1M: 0.02,
    outputCostPer1M: 1.2,
    badgeText: "1.1M",
  },
  "gemini-3.7-flash": {
    id: "google/gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    provider: "Google",
    family: "Gemini",
    contextWindow: 1048576,
    inputCostPer1M: 0.375,
    cachedInputCostPer1M: 0.0375,
    outputCostPer1M: 1.875,
    badgeText: "1.0M",
  },
  "gemini-3.5-flash-lite": {
    id: "google/gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    provider: "Google",
    family: "Gemini",
    contextWindow: 1048576,
    inputCostPer1M: 0.3,
    cachedInputCostPer1M: 0.03,
    outputCostPer1M: 2.5,
    badgeText: "1.0M",
  },
  "deepseek-v4-pro": {
    id: "deepseek/deepseek-v4-pro-0813",
    name: "DeepSeek V4 Pro",
    provider: "DeepSeek",
    family: "DeepSeek",
    contextWindow: 1048576,
    inputCostPer1M: 1.188,
    cachedInputCostPer1M: 0.04,
    outputCostPer1M: 3.564,
    badgeText: "1.0M",
  },
  "deepseek-v4-flash": {
    id: "deepseek/deepseek-v4-flash-0731",
    name: "DeepSeek V4 Flash",
    provider: "DeepSeek",
    family: "DeepSeek",
    contextWindow: 1310720,
    inputCostPer1M: 0.14,
    cachedInputCostPer1M: 0.028,
    outputCostPer1M: 0.28,
    badgeText: "1.3M",
  },
  "grok-4.6": {
    id: "x-ai/grok-4.6",
    name: "Grok 4.6",
    provider: "xAI",
    family: "Grok",
    contextWindow: 500000,
    inputCostPer1M: 2.0,
    cachedInputCostPer1M: 0.5,
    outputCostPer1M: 6.0,
    badgeText: "500k",
  },
  "qwen3.8-max": {
    id: "qwen/qwen3.8-max",
    name: "Qwen3.8 Max",
    provider: "Alibaba",
    family: "Qwen",
    contextWindow: 1000000,
    inputCostPer1M: 2.0,
    cachedInputCostPer1M: 0.25,
    outputCostPer1M: 6.0,
    badgeText: "1.0M",
  },
  "qwen3.7-flash": {
    id: "qwen/qwen3.7-flash",
    name: "Qwen3.7 Flash",
    provider: "Alibaba",
    family: "Qwen",
    contextWindow: 1000000,
    inputCostPer1M: 0.03,
    cachedInputCostPer1M: 0.006,
    outputCostPer1M: 0.13,
    badgeText: "1.0M",
  },
};

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const STORAGE_KEY = "tokencraft_live_model_pricing";
const STORAGE_TIMESTAMP_KEY = "tokencraft_live_pricing_timestamp";

/**
 * Fetches real-time model pricing from OpenRouter's free public endpoint.
 * Falls back gracefully to INITIAL_MODEL_REGISTRY on network error.
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
        const inputCost = parseFloat(live.pricing.prompt || "0") * 1000000;
        const cacheCost = parseFloat(live.pricing.input_cache_read || "0") * 1000000;
        const outputCost = parseFloat(live.pricing.completion || "0") * 1000000;

        updatedRegistry[key] = {
          ...model,
          contextWindow: live.context_length || model.contextWindow,
          inputCostPer1M: Number(inputCost.toFixed(4)),
          cachedInputCostPer1M: Number(cacheCost.toFixed(4)),
          outputCostPer1M: Number(outputCost.toFixed(4)),
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
    console.warn("Could not fetch live OpenRouter prices, using cached or initial registry:", err);

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
      timestamp: "Default Rates",
      fromCache: true,
    };
  }
}
