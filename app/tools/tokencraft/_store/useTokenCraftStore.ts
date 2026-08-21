import { create } from "zustand";
import {
  minifyPromptWithOptions,
  DEFAULT_MINIFY_OPTIONS,
  type MinifyOptions,
  type MinifyResult,
} from "../_lib/promptMinifier";
import type { TokenChunk } from "../_workers/tokenizer.worker";
import {
  INITIAL_MODEL_REGISTRY,
  fetchLiveModelPricing,
  type ModelPricing,
} from "../_lib/priceService";

export { type ModelPricing, INITIAL_MODEL_REGISTRY as MODEL_REGISTRY };

export const PROMPT_PRESETS: Record<
  string,
  { label: string; description: string; content: string }
> = {
  "code-reviewer": {
    label: "Code Reviewer",
    description: "Multi-layered Senior Staff Engineer code audit prompt",
    content: `You are an elite Staff Frontend Engineer at NorAI with 15+ years of experience in high-performance web systems.

Review the following TypeScript and React codebase for:
1. Spacing and modular scale inconsistencies against an 8px spatial grid.
2. Main-thread execution bottlenecks (computations > 16ms causing frame drops).
3. Missing interaction states (Hover, Active, Focus, Loading, Empty).
4. Contrast ratio violations against dark surfaces under WCAG 2.1 AAA.

Please provide concise, surgical code diffs with explanatory annotations.`,
  },
  "system-prompt": {
    label: "System Prompt",
    description: "Autonomous Agent tool-use and constraint contract",
    content: `You are Antigravity, an autonomous agentic pair programmer.
Your goal is to execute complex engineering requests with zero unnecessary roundtrips.

Operational Principles:
- Never guess file structures; use list_dir and grep_search.
- Write modular, highly reusable components with complete TypeScript typing.
- Always provide accessible ARIA attributes and keyboard navigation.
- Prioritize zero-latency client-side computation using Web Workers when handling high-volume datasets.`,
  },
  "rag-context": {
    label: "RAG Context Dump",
    description: "Dense vector retrieval chunk with tabular metadata",
    content: `### Retrieved Document Chunk #8492
Source: /docs/architecture/norai-blueprint-v3.md
Score: 0.9412
Date: 2026-08-18

| Module | Purpose | Status | Target FPS |
| :--- | :--- | :--- | :--- |
| Worker Threading | Offloads BPE tokenization | Active | 60 FPS |
| Context Gauge | SVG real-time visual safety | Active | 60 FPS |
| Cost Matrix | Reactive multi-model pricing | Active | 60 FPS |
| AST Minifier | Regex & whitespace reduction | Active | 60 FPS |

Ensure all derived computations complete in < 2ms to prevent user input latency.`,
  },
  "json-payload": {
    label: "Nested JSON Payload",
    description: "Complex API JSON schema for testing minification",
    content: `{
  "system": "TokenCraft Engine",
  "version": "3.0.0",
  "config": {
    "theme": "obsidian",
    "features": {
      "worker": true,
      "caching": true,
      "minification": true
    },
    "tokens": [
      { "id": 13225, "text": "Hello", "bytes": 5 },
      { "id": 16455, "text": " NorAI", "bytes": 6 }
    ]
  }
}`,
  },
};

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

export const useTokenCraftStore = create<TokenCraftState>((set, get) => ({
  rawText: PROMPT_PRESETS["code-reviewer"].content,
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

  diffModalOpen: false,
  commandPaletteOpen: false,
  minifyOptions: DEFAULT_MINIFY_OPTIONS,
  minifiedPreview: null,

  setRawText: (rawText) => set({ rawText }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setBatchVolume: (batchVolume) => set({ batchVolume }),
  setOutputMultiplier: (outputMultiplier) => set({ outputMultiplier }),
  setViewMode: (viewMode) => set({ viewMode }),
  setTokenData: (data) => set((state) => ({ ...state, ...data })),
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
}));
