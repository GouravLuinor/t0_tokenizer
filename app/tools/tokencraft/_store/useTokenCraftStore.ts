import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  minifyPromptWithOptions,
  DEFAULT_MINIFY_OPTIONS,
  type MinifyOptions,
  type MinifyResult,
} from "../_lib/promptMinifier";
import type { TokenChunk } from "../_lib/tokenize";
import { PROMPT_PRESETS, DEFAULT_PRESET_KEY } from "../_lib/presets";
import {
  INITIAL_MODEL_REGISTRY,
  fetchLiveModelPricing,
  type ModelPricing,
} from "../_lib/priceService";

export { type ModelPricing, INITIAL_MODEL_REGISTRY as MODEL_REGISTRY };

export type VisualViewMode = "chips" | "ids" | "heatmap" | "analytics";

interface TokenCraftState {
  rawText: string;
  previousText: string | null;
  selectedModel: string;
  modelsRegistry: Record<string, ModelPricing>;
  isSyncingPrices: boolean;
  lastSyncedAt: string | null;
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
  tokenChunks: [],
  tokenCount: 0,
  characterCount: 0,
  wordCount: 0,
  byteCount: 0,
  batchVolume: 1000,
  outputMultiplier: 0.5,
  isProcessing: false,
  executionTimeMs: 0,
  viewMode: "chips",
  isWorkerDegraded: false,

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
      const { registry, timestamp } = await fetchLiveModelPricing();
      set({
        modelsRegistry: registry,
        lastSyncedAt: timestamp,
        isSyncingPrices: false,
      });
    } catch {
      set({ isSyncingPrices: false });
    }
  },
}),
    {
      name: "tokencraft-workspace",
      version: 1,
      storage: createJSONStorage(() => localStorage),
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
