# TokenCraft (t0_tokenizer) ⚡

> **Tier-0 Developer-Grade BPE Tokenizer, Prompt Optimizer & Multi-Model Cost Engine**  
> *100% Client-Side Local Compute • Zero Cloud Telemetry • Obsidian Dark Studio Aesthetic*

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20Compute-10b981?style=flat-square)](https://github.com/GouravLuinor/t0_tokenizer)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

---

## 🌟 Overview

**TokenCraft (`t0_tokenizer`)** is a production-ready, ultra-low-latency developer workspace designed for AI engineers, prompt architects, and LLM researchers. It provides instant Byte-Pair Encoding (BPE) tokenization, granular subword inspection, context window safety guarding, and real-time multi-model cost analysis with prompt caching economics.

Engineered with an obsidian-dark, staff-level developer aesthetic inspired by Linear and Raycast, TokenCraft offloads all heavy tokenization tasks to dedicated **Web Workers**, ensuring a buttery-smooth 60+ FPS user experience even with massive prompts and RAG contexts.

---

## ✨ Key Features

### 1. ⚡ 100% Client-Side Web Worker Tokenization
- Offloads heavy Byte Pair Encoding (BPE) computations away from the UI main thread into background **Web Workers**.
- Supports modern LLM token encodings including `o200k_base` (GPT-4o, o1, o3-mini), `cl100k_base` (GPT-4, GPT-3.5-Turbo), `p50k_base`, and `r50k_base`.
- Absolute zero latency UI with sub-millisecond responsiveness.

### 2. 🔍 Tri-Mode Token Inspector & Subword Visualizer
- **Chips View**: Distinct color-coded tokens with alternating palette hues to instantly discern word and subword boundary splits.
- **IDs View**: Direct raw token array representation for rapid programmatic debugging and API payload inspection.
- **Heatmap View**: Visual byte-density heatmap highlighting dense Unicode characters, emojis, multicharacter tokens, and code indentations.
- **Granular Token Popover**: Click or hover any token to reveal its Token ID, UTF-8 Hex sequence, byte length, character offset, and raw representation.
- **Real-Time Token Filtering**: Live search tokens by text substring, character pattern, or specific numeric Token ID.

### 3. 🛡️ Real-Time Context Safety Gauge
- Interactive SVG radial gauge displaying real-time context window consumption against target model limits (128k, 200k, 1M, 2M+ tokens).
- Dynamic color-coded thresholds:
  - 🟢 **Safe** (< 75% capacity)
  - 🟡 **Warning** (75% – 90% capacity)
  - 🔴 **Critical Overflow** (> 90% capacity)
- Displays remaining token headroom and payload percentage calculations.

### 4. 💸 Multi-Model Cost Matrix & Prompt Cache Simulator
- Real-time cost calculation engine across leading AI models:
  - **OpenAI**: GPT-4o, GPT-4o-mini, o1, o1-mini, o3-mini
  - **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus
  - **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0 Flash
  - **DeepSeek**: DeepSeek V3, DeepSeek R1
- **Prompt Caching Economics**: Accurately simulates prompt caching read discounts (up to 50%–90% savings on cached prefix tokens).
- **Batch Scaling Simulator**: Interactive slider to project API spend across 1 to 100,000 production inferences.
- **Output Multiplier**: Configurable expected response output tokens ratio (0.5x to 4x).
- **Export Capabilities**: 1-click export of pricing and token comparison matrices to **Markdown**, **JSON**, and **CSV**.

### 5. ✂️ Prompt Minifier & AST Diff Dialog
- Lossless and aggressive minification rules:
  - Strip redundant whitespace, trailing spaces, and multi-line breaks
  - Strip code comments (`//`, `/* */`, `#`, `<!-- -->`)
  - Minify JSON schema and data structures
  - Optional stopword filtering for high-density context compaction
- **Visual Diff Inspector**: Interactive side-by-side modal displaying the original vs. minified prompt with exact token and dollar savings.

### 6. ⌨️ Keyboard-First Command Palette
- Instant `⌘ K` / `Ctrl + K` global command palette.
- Switch models, toggle view modes, copy token IDs, trigger minification, load curated prompt presets, and export reports directly from the keyboard.

### 7. 🔒 Total Privacy Guarantee
- **Zero Cloud Storage**: Prompts, proprietary codebases, confidential RAG chunks, and system instructions are **never** transmitted to any server.
- Operates entirely inside the client's local browser sandbox.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 15.1 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) with Custom Tier-0 Obsidian Design System
- **State Management**: [Zustand 5](https://github.com/pmndrs/zustand)
- **Tokenization Engine**: Web Worker + [`gpt-tokenizer`](https://github.com/niieani/gpt-tokenizer)
- **Component Primitives**: [Radix UI](https://www.radix-ui.com/)
- **Icons & Visuals**: [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Production Server / Reverse Proxy**: [Docker](https://www.docker.com/), [Caddy](https://caddyserver.com/) (Auto TLS / HTTP/3)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.18.0` or higher (Node `v20+` or `v22+` recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Local Development

1. **Clone the repository**:
   ```bash
   git clone git@github.com:GouravLuinor/t0_tokenizer.git
   cd t0_tokenizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port indicated in terminal).

### Production Build

```bash
# Build the optimized production bundle
npm run build

# Run the production server
npm run start
```

---

## 🐳 Docker Deployment

A production-grade multi-stage `Dockerfile` and `docker-compose.yml` with Caddy reverse proxy are included:

```bash
# Start TokenCraft with Docker Compose
docker compose up -d --build

# View container logs
docker compose logs -f
```

To run using the automated zero-downtime deployment script:
```bash
./deploy.sh
```

---

## 📂 Project Structure

```
├── app/
│   ├── globals.css                       # Obsidian dark design tokens & custom utilities
│   ├── layout.tsx                        # Root layout with fonts, SEO & meta config
│   ├── page.tsx                          # Root landing / tool mount
│   ├── robots.ts / sitemap.ts            # Dynamic SEO indexing metadata
│   └── tools/
│       └── tokencraft/
│           ├── page.tsx                  # Main TokenCraft workspace page
│           ├── _components/
│           │   ├── CommandPalette.tsx    # Cmd+K Quick action palette
│           │   ├── ContextSafetyGauge.tsx# SVG arc gauge for model context utilization
│           │   ├── MultiModelCostMatrix.tsx # Live multi-model pricing & cache simulator
│           │   ├── PromptDiffDialog.tsx  # Side-by-side prompt minifier diff view
│           │   ├── RawEditorPane.tsx     # Code/prompt editor with line numbers & drag-drop
│           │   ├── TokenInspectorPane.tsx# Chips / IDs / Heatmap visualizer & search
│           │   └── TopToolbar.tsx        # Model selector, presets, minifier, actions
│           ├── _hooks/
│           │   └── useTokenizer.ts       # Web Worker communication & state bridge
│           ├── _lib/
│           │   ├── priceService.ts       # Model pricing catalog & cost calculations
│           │   └── promptMinifier.ts     # Minification heuristics & diff algorithms
│           ├── _store/
│           │   └── useTokenCraftStore.ts # Centralized Zustand workspace state
│           └── _workers/
│               └── tokenizer.worker.ts   # Dedicated BPE tokenization Web Worker
├── components/
│   └── ui/                               # Studio-grade primitive UI components
│       ├── animated-gradient-text.tsx
│       ├── border-beam.tsx
│       ├── button.tsx, card.tsx, dialog.tsx, etc.
│       └── spotlight-card.tsx
├── docs/                                 # Design specifications & system blueprints
├── public/                               # Static assets and favicons
├── Caddyfile                             # Caddy HTTP/3 & TLS configuration
├── Dockerfile                            # Multi-stage standalone Next.js container build
├── docker-compose.yml                    # Container composition orchestrator
├── tutorial.md                           # Comprehensive end-user tutorial & workflows
└── tailwind.config.ts                    # Extended theme, animations & surface colors
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>⌘ K</kbd> / <kbd>Ctrl + K</kbd> | Open Command Palette |
| <kbd>Esc</kbd> | Close Modals / Deselect Token |
| <kbd>⌘ Enter</kbd> | Trigger Prompt Minification |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with precision by <strong>Gourav Kumar Singh</strong> • Tier-0 Engineering</sub>
</div>
