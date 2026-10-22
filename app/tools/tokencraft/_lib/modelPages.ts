import { INITIAL_MODEL_REGISTRY } from "./priceService";
import type { ModelPricing } from "./modelTypes";
import { isUnpriced } from "./costs";

/**
 * URL slugs for the per-model pages. Catalog keys can contain dots
 * ("claude-sonnet-5.5"), which read as file extensions in a path, so dots
 * become hyphens; a collision gets a numeric suffix.
 */
export function buildSlugMap(registry: Record<string, ModelPricing>): Map<string, string> {
  const bySlug = new Map<string, string>();
  for (const key of Object.keys(registry)) {
    const base = key.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let slug = base;
    for (let n = 2; bySlug.has(slug); n++) slug = `${base}-${n}`;
    bySlug.set(slug, key);
  }
  return bySlug;
}

/** Only priced models get a page: a $0 catalog gap has nothing to say. */
const PAGE_REGISTRY = Object.fromEntries(
  Object.entries(INITIAL_MODEL_REGISTRY).filter(([, m]) => !isUnpriced(m))
);

export const MODEL_SLUGS = buildSlugMap(PAGE_REGISTRY);
export const SLUG_BY_KEY = new Map([...MODEL_SLUGS].map(([slug, key]) => [key, slug]));

export function modelForSlug(slug: string): { key: string; model: ModelPricing } | null {
  const key = MODEL_SLUGS.get(slug);
  return key ? { key, model: INITIAL_MODEL_REGISTRY[key] } : null;
}

/** Worked examples priced on every model page, chosen to match real jobs. */
export const WORKLOADS = [
  { label: "A chat reply", detail: "1,000-token prompt, 500-token answer", input: 1_000, output: 500 },
  { label: "A RAG answer", detail: "8,000 tokens of context, 600-token answer", input: 8_000, output: 600 },
  { label: "Summarising a long report", detail: "60,000 tokens in, 1,500 out", input: 60_000, output: 1_500 },
  { label: "A classification label", detail: "400 tokens in, 5 out", input: 400, output: 5 },
];
