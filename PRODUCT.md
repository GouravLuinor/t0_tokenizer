# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and AI engineers who are about to send a prompt, system prompt, RAG chunk or JSON payload to an LLM API and need three answers fast: how many tokens is this, does it fit the model's context window, and what will it cost at my volume. Secondary: founders and PMs estimating monthly API spend before committing to a model. They arrive from search ("token counter", "gpt tokenizer", "claude token cost", "llm cost calculator") with text already on their clipboard.

## Product Purpose

TokenCraft counts tokens with OpenAI's real BPE encodings (o200k_base, cl100k_base), shows exactly where each token boundary falls, checks context-window headroom, and prices the prompt across ~95 current models using a committed OpenRouter snapshot refreshed live in the browser. It also offers a prompt minifier with a diff preview that shows tokens and money saved. Success: the visitor gets a trustworthy count and a cost decision in under ten seconds, and comes back the next time they write a prompt.

## Positioning

Counting runs entirely in the visitor's tab (Web Worker, no upload), with honest labels about precision: OpenAI-family counts are exact; every other provider's count is an o200k-based estimate and is marked as such. Pricing is not a hand-maintained table: it is regenerated weekly from OpenRouter by CI and refreshed live on load, including cached-input rates and tiered-pricing thresholds. Free, no ads, no account needed for the core job.

## Operating Context

Visitors paste from an editor, a chat transcript or a code file. Typical inputs are 200 to 50,000 tokens. Sessions are short and repeated. Many use dark-themed IDEs; a meaningful share arrive on mobile from links.

## Capabilities and Constraints

- Encodings: o200k_base and cl100k_base via gpt-tokenizer in a Web Worker, with a lazy main-thread fallback. BPE tables must never land in the initial bundle (≤200 kB initial JS budget).
- Views: token chips, token IDs, byte-density heatmap, analytics; token search; per-token detail (ID, UTF-8 hex, bytes).
- Context-window bar per selected model; chat-messages mode; presets; ⌘K command palette.
- Cost: per-model input / cached-input / output rates, batch volume and output multiplier; full matrix across the catalog.
- Prompt minifier with options and a before/after diff; revert.
- Optional sign-in (Google, GitHub; shared Nor AI Supabase project) gates report exports only.
- Persisted workspace in localStorage. CSP allows only OpenRouter and Supabase as outbound hosts.
- Non-OpenAI token counts are estimates. Do not claim an accuracy band (the old "±2–4%" FAQ line is unverified; newer Claude/Gemini tokenizers can run noticeably higher).

## Brand Commitments

- Name: TokenCraft, at tokens.norai.tech. Part of the Nor AI tier-0 family: each tool has its own visual world, joined by a thin shared Nor AI thread (small mark, shared footer, cross-links to sibling tools and norai.tech).
- Core functionality free forever; never block the tool with a sign-in prompt.
- Must ship light and dark themes.

## Evidence on Hand

- Real model catalog: `app/tools/tokencraft/_lib/modelCatalog.generated.ts` (95 models, generated 2026-10-08 from OpenRouter).
- Real presets in `_lib/presets.ts`.
- No testimonials, user counts, press or benchmarks exist. Do not fabricate them.

## Product Principles

1. The answer is the hero: count, fit and cost are visible the moment text is present.
2. Say how sure we are: exact vs. estimate is always visible next to the number.
3. Money is the unit people decide in; tokens are the unit they debug in. Show both, lead with what the visitor is deciding.
4. Never block the work: no unprompted modals, no fake zeros while loading.

## Accessibility & Inclusion

WCAG 2.2 AA minimum; full keyboard operation; colour is never the only carrier of token boundaries or status.
