import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  minifyPromptWithOptions,
  DEFAULT_MINIFY_OPTIONS,
  type MinifyOptions,
  type MinifyResult,
} from "../_lib/promptMinifier";
import type { TokenChunk } from "../_lib/tokenizeTypes";
import { PROMPT_PRESETS, DEFAULT_PRESET_KEY } from "../_lib/presets";
import {
  INITIAL_MODEL_REGISTRY,
  fetchLiveModelPricing,
  type ModelPricing,
} from "../_lib/priceService";

export { type ModelPricing, INITIAL_MODEL_REGISTRY as MODEL_REGISTRY };
const MODEL_REGISTRY_SNAPSHOT = INITIAL_MODEL_REGISTRY;

export type VisualViewMode = "text" | "chips" | "ids" | "heatmap" | "analytics";

interface TokenCraftState {
  rawText: string;
  previousText: string | null;
  selectedModel: string;
  modelsRegistry: Record<string, ModelPricing>;
  isSyncingPrices: boolean;
  lastSyncedAt: string | null;
  /** Where the current rates came from: build snapshot, live fetch, or a cached live fetch */
  priceSource: "snapshot" | "live" | "cached";
  /**
   * The exact text the current token data describes. null until the engine
   * has answered once, so the UI can show "counting" instead of a fake zero.
   */
  tokenizedText: string | null;
  tokenChunks: TokenChunk[];
  tokenCount: number;
  characterCount: number;
  wordCount: number;
  byteCount: number;
  batchVolume: number;
  outputMultiplier: number; // 0, 0.5, 1, 2, 4
  isProcessing: boolean;
  executionTimeMs: number;
  viewMode: VisualViewMode;
  isWorkerDegraded: boolean;
  /** Tokens the minifier would save on the current text, once counted */
  minifySavings: { forText: string; before: number; after: number } | null;

  // Modals & Options
  diffModalOpen: boolean;
  commandPaletteOpen: boolean;
  minifyOptions: MinifyOptions;
  minifiedPreview: MinifyResult | null;

  // Actions
  setRawText: (text: string) => void;
  setSelectedModel: (model: string) => void;
  setBatchVolume: (volume: number) => void;
  setOutputMultiplier: (multiplier: number) => void;
  setViewMode: (mode: VisualViewMode) => void;
  setTokenData: (data: Partial<TokenCraftState>) => void;
  setMinifySavings: (savings: TokenCraftState["minifySavings"]) => void;
  setWorkerDegraded: (degraded: boolean) => void;
  setDiffModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setMinifyOptions: (options: Partial<MinifyOptions>) => void;
  generateMinifyPreview: () => void;
  applyMinification: () => void;
  revertMinification: () => void;
  loadPreset: (presetKey: string) => void;
  clearText: () => void;
  syncLivePrices: () => Promise<void>;
}

export const useTokenCraftStore = create<TokenCraftState>()(
  persist<TokenCraftState, [], [], PersistedWorkspace>(
    (set, get) => ({
  rawText: PROMPT_PRESETS[DEFAULT_PRESET_KEY].content,
  previousText: null,
  selectedModel: "claude-sonnet-5",
  modelsRegistry: INITIAL_MODEL_REGISTRY,
  isSyncingPrices: false,
  lastSyncedAt: null,
  priceSource: "snapshot",
  tokenizedText: null,
  tokenChunks: [],
  tokenCount: 0,
  characterCount: 0,
  wordCount: 0,
  byteCount: 0,
  batchVolume: 1000,
  outputMultiplier: 0.5,
  isProcessing: false,
  executionTimeMs: 0,
  viewMode: "text",
  isWorkerDegraded: false,
  minifySavings: null,

  diffModalOpen: false,
  commandPaletteOpen: false,
  minifyOptions: DEFAULT_MINIFY_OPTIONS,
  minifiedPreview: null,

  setRawText: (rawText) => set({ rawText }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setBatchVolume: (batchVolume) => set({ batchVolume }),
  setOutputMultiplier: (outputMultiplier) => set({ outputMultiplier }),
  setViewMode: (viewMode) => set({ viewMode }),
  setTokenData: (data) => set(data),
  setMinifySavings: (minifySavings) => set({ minifySavings }),
  setWorkerDegraded: (isWorkerDegraded) => set({ isWorkerDegraded }),
  setDiffModalOpen: (diffModalOpen) => set({ diffModalOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),

  setMinifyOptions: (newOptions) => {
    const updated = { ...get().minifyOptions, ...newOptions };
    set({ minifyOptions: updated });
    // Refresh preview if open
    const currentText = get().rawText;
    if (currentText) {
      set({ minifiedPreview: minifyPromptWithOptions(currentText, updated) });
    }
  },

  generateMinifyPreview: () => {
    const currentText = get().rawText;
    if (!currentText) return;
    const preview = minifyPromptWithOptions(currentText, get().minifyOptions);
    set({ minifiedPreview: preview, diffModalOpen: true });
  },

  applyMinification: () => {
    const preview = get().minifiedPreview;
    if (preview && preview.minifiedText) {
      set({
        previousText: get().rawText,
        rawText: preview.minifiedText,
        diffModalOpen: false,
        minifiedPreview: null,
      });
    }
  },

  revertMinification: () => {
    const prev = get().previousText;
    if (prev !== null) {
      set({ rawText: prev, previousText: null });
    }
  },

  loadPreset: (presetKey: string) => {
    const preset = PROMPT_PRESETS[presetKey];
    if (preset) {
      set({ rawText: preset.content, previousText: null });
    }
  },

  clearText: () => {
    set({
      rawText: "",
      previousText: null,
      tokenizedText: "",
      tokenChunks: [],
      tokenCount: 0,
      characterCount: 0,
      wordCount: 0,
      byteCount: 0,
      executionTimeMs: 0,
    });
  },

  syncLivePrices: async () => {
    set({ isSyncingPrices: true });
    try {
      const { registry, timestamp, fromCache } = await fetchLiveModelPricing();
      const isSnapshot = registry === MODEL_REGISTRY_SNAPSHOT;
      set({
        modelsRegistry: registry,
        lastSyncedAt: isSnapshot ? null : timestamp,
        priceSource: isSnapshot ? "snapshot" : fromCache ? "cached" : "live",
        isSyncingPrices: false,
      });
    } catch {
      set({ isSyncingPrices: false });
    }
  },
}),
    {
      name: "tokencraft-workspace",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      // The model catalog is regenerated from OpenRouter (scripts/sync-models.mjs);
      // a persisted key may no longer exist after a catalog swap (e.g. the dead
      // qwen3.8-max id). Reset to the default instead of rendering a stale model.
      migrate: (persistedState, fromVersion) => {
        const state = (persistedState ?? {}) as Partial<PersistedWorkspace>;
        // v3 made the in-place text view the default; older saves land there once
        if (fromVersion < 3) state.viewMode = "text";
        const selectedModel =
          state.selectedModel && state.selectedModel in INITIAL_MODEL_REGISTRY
            ? state.selectedModel
            : "claude-sonnet-5";
        return { ...(state as PersistedWorkspace), selectedModel };
      },
      // Persist the user's work and preferences only — never derived
      // tokenization state (recomputed by the worker on rehydrate)
      partialize: (s) => ({
        rawText: s.rawText,
        selectedModel: s.selectedModel,
        viewMode: s.viewMode,
        batchVolume: s.batchVolume,
        outputMultiplier: s.outputMultiplier,
      }),
      // SSR-safe: hydration is triggered manually after mount
      skipHydration: true,
    }
  )
);

interface PersistedWorkspace {
  rawText: string;
  selectedModel: string;
  viewMode: VisualViewMode;
  batchVolume: number;
  outputMultiplier: number;
}
