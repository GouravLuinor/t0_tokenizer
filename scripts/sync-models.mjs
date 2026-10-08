#!/usr/bin/env node
/**
 * Regenerates app/tools/tokencraft/_lib/modelCatalog.generated.ts from the
 * public OpenRouter models API (no API key required).
 *
 * Curation: pinned flagships + most-popular + newest + per-lab recency,
 * limited to the leading labs (OpenAI, Anthropic, Google, DeepSeek, Meta,
 * Mistral, xAI, Qwen). Variant IDs (`:batch`, `:free`, `~` aliases) and
 * router meta-models are excluded.
 *
 * Data fixes applied while generating:
 *  - `input_cache_read` missing/zero => cached price falls back to the
 *    prompt price with `noCache: true` (never a fake $0 / -100% saving).
 *  - `pricing.overrides` tiers => `tieredPricing: true` plus the smallest
 *    `min_prompt_tokens` threshold, so the UI can warn instead of silently
 *    under-quoting long-context runs.
 *
 * Usage: node scripts/sync-models.mjs
 * Exit codes: 0 success · 1 fetch/validation/curation failure.
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API_URL = "https://openrouter.ai/api/v1/models";
const OUT_PATH = fileURLToPath(
  new URL("../app/tools/tokencraft/_lib/modelCatalog.generated.ts", import.meta.url)
);

const LAB_AUTHORS = [
  "openai",
  "anthropic",
  "google",
  "deepseek",
  "meta-llama",
  "mistralai",
  "x-ai",
  "qwen",
];

const PROVIDER_NAMES = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  deepseek: "DeepSeek",
  "meta-llama": "Meta",
  mistralai: "Mistral",
  "x-ai": "xAI",
  qwen: "Alibaba",
};

const FAMILY_BY_TOKENIZER = {
  Claude: "Claude BPE",
  Gemini: "Gemini",
  Gemma: "Gemma",
  DeepSeek: "DeepSeek",
  Qwen: "Qwen",
  Qwen3: "Qwen",
  Llama2: "Llama",
  Llama3: "Llama",
  Llama4: "Llama",
  Mistral: "Mistral",
  Grok: "Grok",
  Other: "Other BPE",
};

/**
 * Always-present models (flagships + one legacy pair so the cl100k_base
 * engine path stays genuinely reachable). Missing ids are warned, not fatal.
 */
const PINNED_IDS = [
  "anthropic/claude-sonnet-5.5",
  "anthropic/claude-haiku-5.5",
  "anthropic/claude-opus-5",
  "anthropic/claude-sonnet-5",
  "openai/gpt-6.1-sol-pro",
  "openai/gpt-6.1-sol",
  "openai/gpt-6-luna",
  "openai/gpt-5.6-sol",
  "openai/gpt-5.6-terra",
  "openai/gpt-5.6-luna",
  "google/gemini-3.8-flash",
  "google/gemini-3.7-flash",
  "google/gemini-3.5-flash-lite",
  "meta-llama/llama-4-maverick",
  "deepseek/deepseek-v4.1-flash",
  "deepseek/deepseek-v4-pro-0813",
  "deepseek/deepseek-v4-flash-0731",
  "x-ai/grok-4.6",
  "qwen/qwen3.8-max-0902",
  "qwen/qwen3.7-flash",
  "mistralai/mistral-large-4-0",
  "openai/gpt-4",
  "openai/gpt-3.5-turbo",
];

const MAX_CATALOG = 100;
const PER_LAB_RECENT = 6;

const LEGACY_OPENAI = /^(gpt-3\.5|gpt-4(-|$))/;

function per1M(value, { nullable = false } = {}) {
  const parsed = parseFloat(value ?? "");
  if (!Number.isFinite(parsed) || parsed <= 0) return nullable ? null : 0;
  return Number((parsed * 1000000).toFixed(4));
}

function encodingFor(author, slug) {
  if (author === "openai" && LEGACY_OPENAI.test(slug)) return "cl100k_base";
  return "o200k_base";
}

function familyFor(author, encoding, tokenizerGroup) {
  if (author === "openai") return encoding;
  return FAMILY_BY_TOKENIZER[tokenizerGroup] ?? "Other BPE";
}

function displayName(raw) {
  return raw.replace(/^[^:]+:\s*/, "").trim();
}

function badgeFor(contextWindow) {
  if (!contextWindow) return "N/A";
  if (contextWindow >= 1000000) return `${(contextWindow / 1000000).toFixed(1)}M`;
  if (contextWindow >= 1000) return `${Math.round(contextWindow / 1000)}k`;
  return String(contextWindow);
}

function isVariant(id) {
  return id.includes(":") || id.startsWith("~");
}

function isEligible(model, now) {
  if (!model || typeof model.id !== "string") return false;
  if (isVariant(model.id)) return false;
  const author = model.id.split("/")[0];
  if (!LAB_AUTHORS.includes(author)) return false;
  if (model.architecture?.tokenizer === "Router") return false;
  if (model.expiration_date && new Date(model.expiration_date) < now) return false;
  return true;
}

function toEntry(model) {
  const author = model.id.split("/")[0];
  const slug = model.id.split("/")[1];
  const encoding = encodingFor(author, slug);
  const contextWindow =
    model.context_length ?? model.top_provider?.context_length ?? 0;

  const inputCostPer1M = per1M(model.pricing?.prompt);
  const cached = per1M(model.pricing?.input_cache_read, { nullable: true });
  const hasCache = cached !== null;

  const overrides = Array.isArray(model.pricing?.overrides)
    ? model.pricing.overrides
    : [];
  const thresholds = overrides
    .map((o) => o.min_prompt_tokens)
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);

  return {
    id: model.id,
    name: displayName(model.name),
    provider: PROVIDER_NAMES[author] ?? author,
    family: familyFor(author, encoding, model.architecture?.tokenizer),
    encoding,
    contextWindow,
    inputCostPer1M,
    cachedInputCostPer1M: hasCache ? cached : inputCostPer1M,
    outputCostPer1M: per1M(model.pricing?.completion),
    badgeText: badgeFor(contextWindow),
    ...(hasCache ? {} : { noCache: true }),
    ...(overrides.length
      ? {
          tieredPricing: true,
          ...(thresholds.length ? { tieredAboveTokens: thresholds[0] } : {}),
        }
      : {}),
  };
}

async function fetchModels(query) {
  const response = await fetch(`${API_URL}${query}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "t0-tokenizer-sync-models/1.0",
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`OpenRouter "${query}" -> ${response.status} ${response.statusText}`);
  }
  const json = await response.json();
  if (!Array.isArray(json.data)) {
    throw new Error(`OpenRouter "${query}" returned an unexpected payload shape`);
  }
  return json.data;
}

function tsObjectLiteral(entry) {
  const parts = Object.entries(entry).map(([key, value]) => {
    const safeKey = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
      ? key
      : JSON.stringify(key);
    return `${safeKey}: ${JSON.stringify(value)}`;
  });
  return `{ ${parts.join(", ")} }`;
}

async function main() {
  const now = new Date();
  console.log(`[sync-models] Fetching OpenRouter catalog (${now.toISOString()})…`);

  const [popular, newest, labs] = await Promise.all([
    fetchModels(`?sort=most-popular&limit=60&output_modalities=text`),
    fetchModels(`?sort=newest&limit=30&output_modalities=text`),
    fetchModels(
      `?model_authors=${LAB_AUTHORS.join(",")}&output_modalities=text&limit=1000`
    ),
  ]);
  console.log(
    `[sync-models] popular=${popular.length} newest=${newest.length} lab-pool=${labs.length}`
  );

  const byId = new Map();
  for (const m of [...labs, ...popular, ...newest]) byId.set(m.id, m);

  const selected = new Map(); // id -> { model, reason }
  const add = (model, reason) => {
    if (!model || selected.has(model.id)) return false;
    if (!isEligible(model, now)) return false;
    if (selected.size >= MAX_CATALOG && reason !== "pinned") return false;
    selected.set(model.id, { model, reason });
    return true;
  };

  const missingPins = [];
  for (const id of PINNED_IDS) {
    const model = byId.get(id);
    if (model) add(model, "pinned");
    else missingPins.push(id);
  }
  if (missingPins.length) {
    console.warn(
      `[sync-models] WARN missing pinned ids (retired upstream?): ${missingPins.join(", ")}`
    );
  }

  let popularAdded = 0;
  for (const m of popular) if (add(m, "popular")) popularAdded++;

  let newestAdded = 0;
  for (const m of newest) if (add(m, "newest")) newestAdded++;

  // Per-lab recency floor: guarantees every leading lab contributes its
  // latest models even when a release has not charted yet.
  let labAdded = 0;
  for (const author of LAB_AUTHORS) {
    const recent = labs
      .filter((m) => m.id.startsWith(`${author}/`))
      .sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    let taken = 0;
    for (const m of recent) {
      if (taken >= PER_LAB_RECENT) break;
      if (selected.has(m.id)) continue;
      if (add(m, "lab-recent")) {
        taken++;
        labAdded++;
      }
    }
  }

  if (selected.size < 20) {
    throw new Error(
      `[sync-models] Curation produced only ${selected.size} models — refusing to write a degraded catalog.`
    );
  }

  // Deterministic registry keys with cross-lab collision handling.
  const takenKeys = new Set();
  const entries = [];
  for (const [id, { model }] of selected) {
    const author = id.split("/")[0];
    let key = id.split("/")[1].replace(/[:~]/g, "");
    if (takenKeys.has(key)) key = `${author.replace(/-/g, "")}-${key}`;
    takenKeys.add(key);
    entries.push([key, toEntry(model)]);
  }

  const header = `/**
 * AUTO-GENERATED FILE — DO NOT EDIT BY HAND.
 * Regenerate with: node scripts/sync-models.mjs
 *
 * Source: OpenRouter public models API (${API_URL})
 * Generated at: ${now.toISOString()}
 * Curation: pinned flagships + most-popular + newest + per-lab recency,
 * limited to leading labs (${LAB_AUTHORS.join(", ")}).
 * ${entries.length} models · pricing per 1M tokens (USD).
 */

import type { ModelPricing } from "./modelTypes";

export const CATALOG_GENERATED_AT = ${JSON.stringify(now.toISOString())};
export const CATALOG_SOURCE = ${JSON.stringify(API_URL)};
export const CATALOG_MODEL_COUNT = ${entries.length};

export const GENERATED_MODEL_CATALOG: Record<string, ModelPricing> = {
`;

  const body = entries
    .map(([key, entry]) => `  ${JSON.stringify(key)}: ${tsObjectLiteral(entry)},`)
    .join("\n");

  await writeFile(OUT_PATH, `${header}${body}\n};\n`, "utf8");

  const noCacheCount = entries.filter(([, e]) => e.noCache).length;
  const tieredCount = entries.filter(([, e]) => e.tieredPricing).length;
  const legacyCount = entries.filter(([, e]) => e.encoding === "cl100k_base").length;
  const byReason = {};
  for (const { reason } of selected.values()) byReason[reason] = (byReason[reason] ?? 0) + 1;

  console.log(`[sync-models] Wrote ${entries.length} models -> ${OUT_PATH}`);
  console.log(
    `[sync-models] reasons=${JSON.stringify(byReason)} popularAdded=${popularAdded} newestAdded=${newestAdded} labAdded=${labAdded}`
  );
  console.log(
    `[sync-models] noCache=${noCacheCount} tieredPricing=${tieredCount} cl100k_legacy=${legacyCount}`
  );
  if (tieredCount > 0) {
    console.warn(
      `[sync-models] WARN tiered pricing applies to ${tieredCount} models — matrix shows a TIERS badge; snapshot uses base-tier rates.`
    );
  }
}

main().catch((err) => {
  console.error(`[sync-models] FAILED: ${err.message}`);
  process.exitCode = 1;
});
