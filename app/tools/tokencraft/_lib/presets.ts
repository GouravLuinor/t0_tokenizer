export interface PromptPreset {
  label: string;
  description: string;
  content: string;
}

export const PROMPT_PRESETS: Record<string, PromptPreset> = {
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

export const DEFAULT_PRESET_KEY = "code-reviewer";
