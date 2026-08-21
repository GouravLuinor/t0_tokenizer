# TokenCraft User Guide & Tutorial

Welcome to **TokenCraft**, a Tier-0 developer-grade Prompt Engineering, Context Optimization, and Multi-Model Tokenization Engine. 

TokenCraft runs **100% client-side** directly in your browser using dedicated Web Workers. Your sensitive prompts, proprietary code, RAG context dumps, and system instructions are never transmitted to external servers.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Workspace Overview](#core-workspace-overview)
3. [Key Features & What You Can Do](#key-features--what-you-can-do)
   - [1. Raw Input Editor](#1-raw-input-editor)
   - [2. BPE Token Inspector & Multi-View Visualizer](#2-bpe-token-inspector--multi-view-visualizer)
   - [3. Context Window Safety Gauge](#3-context-window-safety-gauge)
   - [4. Multi-Model Cost & Cache Matrix](#4-multi-model-cost--cache-matrix)
   - [5. Prompt Minification & AST Diff Inspector](#5-prompt-minification--ast-diff-inspector)
   - [6. Preset Prompts Library](#6-preset-prompts-library)
   - [7. Command Palette & Keyboard Shortcuts](#7-command-palette--keyboard-shortcuts)
4. [Step-by-Step Tutorials & Workflows](#step-by-step-tutorials--workflows)
   - [Workflow A: Inspecting Subword Tokens & Byte Density](#workflow-a-inspecting-subword-tokens--byte-density)
   - [Workflow B: Minifying Prompts to Reduce Token Costs](#workflow-b-minifying-prompts-to-reduce-token-costs)
   - [Workflow C: Simulating Production API Spend & Prompt Caching](#workflow-c-simulating-production-api-spend--prompt-caching)
   - [Workflow D: Context Limit Guarding for Long-Context RAG](#workflow-d-context-limit-guarding-for-long-context-rag)
5. [Supported Model Registry & Pricing Reference](#supported-model-registry--pricing-reference)
6. [Architecture & Privacy Guarantees](#architecture--privacy-guarantees)

---

## Quick Start

1. Open the application in your browser (`/` or `/tools/tokencraft`).
2. **Type or paste** any prompt, code snippet, RAG chunk, or JSON payload into the **Raw Input Editor** (left pane).
3. Observe real-time token boundaries, subword encodings, context utilization, and multi-model cost calculations updated instantly in the **Token Inspector** (right pane) and analytics cards below.
4. Press `⌘ K` (Mac) or `Ctrl + K` (Windows/Linux) anytime to open the **Command Palette**.

---

## Core Workspace Overview

```
+-------------------------------------------------------------------------------+
|  TokenCraft [Tier-0]      [Cmd+K Commands]  [Model Selector]  [Presets] [Minify] |
+---------------------------------------+---------------------------------------+
|  RAW INPUT EDITOR                     |  BPE TOKEN INSPECTOR                  |
|  - Line numbering gutter              |  - View Modes: Chips | IDs | Heatmap  |
|  - File Drag & Drop / Upload          |  - Token Search & Filter              |
|  - Chars, Words, Byte size stats      |  - Hover Token Details (Hex, UTF-8)   |
|  - Copy / Clear actions               |  - Vocabulary Analytics & Top Tokens  |
+---------------------------------------+---------------------------------------+
|  CONTEXT SAFETY GAUGE                 |  MULTI-MODEL COST & CACHE MATRIX      |
|  - Real-time SVG capacity gauge       |  - Batch Multiplier Slider (1k - 100k)|
|  - Safe / Warning / Critical alerts   |  - Output Tokens Simulator (0x - 4x)  |
|  - Remaining token headroom           |  - Export: Markdown, JSON, CSV        |
+---------------------------------------+---------------------------------------+
```

---

## Key Features & What You Can Do

### 1. Raw Input Editor

The left editor pane gives you a focused coding environment for preparing prompts:

* **Line Numbering Gutter**: Easily track multi-line system prompts, numbered guidelines, and few-shot examples.
* **File Upload & Drag-and-Drop**: Drag any file directly onto the editor or click **Upload** to load `.txt`, `.md`, `.json`, `.ts`, `.tsx`, `.js`, `.py`, `.html`, or `.css` files.
* **Live Text Telemetry**: Instant counters for:
  * **Characters** (`characterCount`)
  * **Words** (`wordCount`)
  * **UTF-8 Byte Size** (`formatBytes`)
* **Quick Clipboard Actions**: One-click **Copy** and **Clear** with confirmation feedback.

---

### 2. BPE Token Inspector & Multi-View Visualizer

The right pane breaks down your input text into Byte-Pair Encoding (BPE) tokens with four distinct visualization modes:

#### View Modes

1. **Chips Mode (Default)**:
   * Color-codes adjacent tokens using a 5-color cyclic boundary scheme to visualize where the tokenizer splits words, punctuation, and whitespace.
   * Special character rendering: Spaces are rendered as `␣`, newlines as `↵`, and tabs as `⇥`.
2. **IDs Mode**:
   * Displays the raw sequential integer token IDs (e.g. `#13225`, `#16455`) as passed directly to the LLM embedding layer.
3. **Bytes Heatmap Mode**:
   * Visualizes the UTF-8 byte density of each token:
     * **1 Byte (Emerald)**: Standard ASCII characters.
     * **2 Bytes (Cyan)**: Accents, Greek, Cyrillic, Latin extensions.
     * **3 Bytes (Amber)**: Common CJK ideographs, technical symbols.
     * **4+ Bytes (Rose)**: Emojis, surrogate pairs, rare multilingual characters.
4. **Analytics Dashboard Mode**:
   * **Token Efficiency**: Calculates characters per token (higher = more efficient compression).
   * **Unique Vocabulary**: Shows unique token count and unique token ratio (`%`).
   * **Average Bytes / Token**: Tracks overall byte footprint.
   * **Top Frequent Tokens**: Ranked list of the most repeated tokens and their exact frequencies.
   * **Longest Token**: Highlights the largest single token captured in your prompt.

#### Interactive Features

* **Hover Token Inspection Tooltip**: Hovering over any token chip reveals:
  * **Token ID**: Exact integer identifier in the model's vocabulary.
  * **Raw Text**: Decoded subword representation.
  * **Position**: Sequential index in the stream.
  * **Byte Length**: Number of UTF-8 bytes.
  * **Hex Encoding**: Formatted hexadecimal representation (e.g. `0x48 0x65 0x6C 0x6C 0x6F`).
* **Instant Token Search & Filtering**: Type into the search box to filter tokens by subword text, token ID number, or hex bytes.
* **Export Token IDs Array**: Click **Copy IDs** to copy the full `[1234, 5678, ...]` JSON array for debugging API payloads or offline token processing.
* **Compute Latency Monitor**: Displays the Web Worker execution time in milliseconds (e.g. `1.24 ms`) with off-main-thread compute badges.

---

### 3. Context Window Safety Gauge

Located below the editor, the **Context Safety Gauge** guards your LLM pipeline against silent context truncation and token overflow:

* **Visual Semi-Circle Speedometer**: Real-time SVG gauge visualizing percentage utilization against the selected model's context window.
* **3-Tier Safety Thresholds**:
  * **Safe Range ($\le 80\%$)**: Emerald indicator showing remaining token capacity.
  * **Warning Threshold ($> 80\%$)**: Amber indicator cautioning that you are nearing the context ceiling.
  * **Critical Capacity ($> 95\%$)**: Rose indicator warning of high risk of context truncation or degraded retrieval recall.
* **Dynamic Model Switching**: When you switch models (e.g., from `GPT-4o` with 128k to `Claude 3.5 Sonnet` with 200k or `Gemini 1.5 Pro` with 2M), the gauge dynamically recalculates the exact ceiling and remaining tokens.

---

### 4. Multi-Model Cost & Cache Matrix

Compare API costs across leading model providers in real-time before initiating expensive batch runs:

* **Live Multi-Model Comparison**: Evaluates your exact prompt token count against:
  * **GPT-4o** (`$2.50` / 1M standard, `$1.25` / 1M cached, `$10.00` / 1M output)
  * **GPT-4o mini** (`$0.15` / 1M standard, `$0.075` / 1M cached, `$0.60` / 1M output)
  * **Claude 3.5 Sonnet** (`$3.00` / 1M standard, `$0.30` / 1M cached, `$15.00` / 1M output)
  * **Gemini 1.5 Pro** (`$3.50` / 1M standard, `$0.875` / 1M cached, `$10.50` / 1M output)
  * **DeepSeek V3** (`$0.14` / 1M standard, `$0.014` / 1M cached, `$0.28` / 1M output)
* **Prompt Caching ROI Analysis**: Shows the discounted cached prompt price and calculates the exact dollar amount saved with prompt prefix caching.
* **Interactive Batch Scale Multiplier**:
  * Slider from **1,000 to 100,000** batch executions.
  * Quick-select presets: `1k`, `5k`, `10k`, `25k`, `50k`, `100k`.
* **Output Completion Simulator**:
  * Simulates downstream generation costs based on completion ratios:
    * `0x` (Input Only)
    * `0.5x` (Brief Responses)
    * `1.0x` (Balanced 1:1 Input/Output)
    * `2.0x` (Detailed Explanations)
    * `4.0x` (Deep Reasoning / Code Generation)
* **Exporting Reports**:
  * **Copy Markdown Table**: Ready-to-paste table for GitHub PRs, Notion, or Slack.
  * **Download JSON Report**: Complete structured telemetry with per-model pricing metrics.
  * **Download CSV Spreadsheet**: Formatted CSV file for Excel, Google Sheets, or financial modeling.

---

### 5. Prompt Minification & AST Diff Inspector

Cut down prompt bloat without sacrificing instructional accuracy:

* **Automated Cleaners**:
  * **Strip Comments**: Removes HTML/Markdown comments (`<!-- ... -->`).
  * **Collapse Whitespace**: Cleans up multi-space runs and collapses consecutive empty lines.
  * **Compact Markdown Tables**: Trims padding inside table cells (`| a | b |` $\rightarrow$ `|a|b|`).
  * **Minify JSON Payloads**: Compresses standalone JSON documents into compact single-line objects.
  * **Trim Line Endings**: Eliminates trailing spaces and line artifacts.
* **Interactive Diff Modal**:
  * Side-by-side visual comparison between original and optimized prompt.
  * Exact character and percentage savings readout (e.g. `Save ~18.4% tokens`).
  * Toggle rules on the fly to see how each optimization impacts the output.
  * **Copy Minified** or click **Apply Optimization** to write back to the editor.
* **Undo / Revert Safety**: Made a mistake? Click **Undo Minify** in the toolbar or press `Cmd+K` $\rightarrow$ "Revert Last Minification" to instantly restore your original text.

---

### 6. Preset Prompts Library

Test the engine with pre-loaded high-context templates available from the top toolbar:

1. **Code Reviewer**: Senior Staff Engineer code audit prompt with multi-point criteria.
2. **System Prompt**: Autonomous agent tool-use contract with strict operational rules.
3. **RAG Context Dump**: Dense vector retrieval chunk with markdown tables and metadata.
4. **Nested JSON Payload**: Complex API schema for benchmarking JSON minification.

---

### 7. Command Palette & Keyboard Shortcuts

Press `⌘ K` (macOS) or `Ctrl + K` (Windows/Linux) to launch the unified Command Palette:

| Shortcut / Action | Description |
| :--- | :--- |
| `⌘ K` / `Ctrl + K` | Toggle Command Palette |
| `↑` / `↓` | Navigate command list |
| `↵ Enter` | Execute selected command |
| `Escape` | Dismiss modal |
| **Switch Model to...** | Fast-switch tokenizer model (GPT-4o, Claude, Gemini, DeepSeek, etc.) |
| **Load Preset: ...** | Load Code Reviewer, System Prompt, RAG Context, or JSON presets |
| **View Mode: ...** | Switch between Chips, IDs, Bytes Heatmap, and Analytics |
| **Minify Prompt & Inspect Diff** | Open the side-by-side optimization diff inspector |
| **Revert Last Minification** | Undo minification and restore pre-optimized text |
| **Copy Token IDs Array** | Export the current token stream to the clipboard |
| **Clear Editor** | Erase editor content and reset counters |

---

## Step-by-Step Tutorials & Workflows

### Workflow A: Inspecting Subword Tokens & Byte Density

**Goal:** Understand how the BPE tokenizer splits custom abbreviations, code syntax, and emojis.

1. Paste your text into the **Raw Input Editor** (e.g., `const status = "🚀 Deploying v3.0";`).
2. In the right pane, select the **Chips** view mode.
3. Hover over the word `Deploying` $\rightarrow$ notice if it splits into `Deploy` + `ing` or remains a single token.
4. Switch to **Bytes Heatmap** view mode $\rightarrow$ observe how the `🚀` rocket emoji highlights in **Rose (4+ bytes)** while standard ASCII letters highlight in **Emerald (1 byte)**.
5. Switch to **Analytics** mode $\rightarrow$ review the **Token Efficiency** (characters/token) and the **Top Frequent Tokens**.

---

### Workflow B: Minifying Prompts to Reduce Token Costs

**Goal:** Clean up a verbose system prompt with excessive whitespace and markdown comments.

1. Load the **RAG Context Dump** or paste your own document.
2. Click the **Minify Prompt** button in the top toolbar (or press `⌘ K` $\rightarrow$ "Minify Prompt").
3. In the **Diff Inspector Modal**, check the savings badge (e.g. `Save ~22.5% tokens`).
4. Toggle individual optimization rules (e.g., uncheck *Minify JSON* or check *Compact Tables*) to tune the compression.
5. Click **Apply Optimization** to update the raw text in your workspace.
6. Verify the updated token count and cost matrix. If needed, click **Undo Minify** in the toolbar to revert.

---

### Workflow C: Simulating Production API Spend & Prompt Caching

**Goal:** Estimate monthly LLM costs for a customer support agent processing 25,000 queries per month.

1. Paste your system prompt and context into the editor (e.g. 1,400 tokens).
2. Scroll to the **Multi-Model Cost & Cache Matrix**.
3. Adjust the **Batch Scale Multiplier** slider to `25,000` runs.
4. Set the **Output Tokens Simulator** to `1.0x (Balanced)` (assuming equal response length).
5. Compare the pricing table:
   * Check **GPT-4o** vs. **GPT-4o mini** vs. **Claude 3.5 Sonnet** vs. **DeepSeek V3**.
   * Note the **Potential Savings** column when utilizing prompt caching on static system prompts.
6. Click **Export Report** $\rightarrow$ **Download CSV Spreadsheet** or **Copy Markdown Table** to share with your team.

---

### Workflow D: Context Limit Guarding for Long-Context RAG

**Goal:** Ensure a combined prompt + RAG vector payload stays within safe operational margins.

1. Drop a large document or RAG retrieval dump into the editor.
2. Select your target deployment model from the top dropdown (e.g., `GPT-4o` with 128k limit).
3. Observe the **Context Safety Gauge**:
   * If the gauge shows **Safe Range (Green)**: Your prompt has sufficient headroom for model responses.
   * If the gauge shows **Warning (Amber)** or **Critical Capacity (Red)**: Switch to a larger context window (e.g., `Gemini 1.5 Pro` 2M or `Claude 3.5 Sonnet` 200k) or use **Prompt Minification** to trim token overhead.

---

## Supported Model Registry & Pricing Reference

| Model Name | Tokenizer Family | Context Limit | Standard Input / 1M | Cached Input / 1M | Output / 1M |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GPT-4o (Omni)** | `o200k_base` | 128,000 tokens | $2.50 | $1.25 (-50%) | $10.00 |
| **GPT-4o mini** | `o200k_base` | 128,000 tokens | $0.15 | $0.075 (-50%) | $0.60 |
| **Claude 3.5 Sonnet** | `Claude BPE` | 200,000 tokens | $3.00 | $0.30 (-90%) | $15.00 |
| **Gemini 1.5 Pro** | `Gemini 2M` | 2,000,000 tokens | $3.50 | $0.875 (-75%) | $10.50 |
| **DeepSeek V3** | `DeepSeek BPE` | 128,000 tokens | $0.14 | $0.014 (-90%) | $0.28 |

---

## Architecture & Privacy Guarantees

* **Zero Server Roundtrips**: All tokenization, string parsing, AST optimizations, and cost analytics execute in-memory on the client.
* **Off-Main-Thread Web Worker**: Tokenization operations run inside a dedicated background worker (`tokenizer.worker.ts`), ensuring 60 FPS UI responsiveness even when processing massive multi-megabyte text payloads.
* **WCAG 2.1 AAA Accessibility**: High-contrast obsidian dark theme, ARIA labels on all interactive controls, and full keyboard navigability.
