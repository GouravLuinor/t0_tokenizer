/** Canonical production origin — override with NEXT_PUBLIC_SITE_URL */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokens.norai.tech";
  return raw.replace(/\/$/, "");
}

export const TOOL = { name: "TokenCraft", host: "tokens.norai.tech" } as const;

/** The company behind the tool. `orgId` matches the @id norai.tech declares, so crawlers join the two sites. */
export const COMPANY = {
  name: "Nor AI Technologies",
  short: "Nor AI",
  url: "https://norai.tech",
  orgId: "https://norai.tech/#organization",
  logo: "https://tokens.norai.tech/nor-ai-mark.png",
  contactUrl: "https://norai.tech/contact",
  aboutUrl: "https://norai.tech/mission",
  toolsUrl: "https://norai.tech/products",
  blurb: "Custom AI, web and 3D software delivered into your own infrastructure. You keep the code.",
  place: "Ghazipur, Uttar Pradesh, India",
} as const;

/**
 * The Nor AI family thread: the same names and one-liners, in the same order,
 * on every tool. Each tool renders it in its own world and leaves itself out.
 */
export const FAMILY_TOOLS = [
  { name: "TokenCraft", blurb: "Token counter and LLM cost calculator", href: "https://tokens.norai.tech" },
  { name: "SchemaCraft", blurb: "JSON to Zod, Pydantic and TypeScript types", href: "https://schema.norai.tech" },
  { name: "RegexCraft", blurb: "Regex tester with plain-English explanations", href: "https://regex.norai.tech" },
  { name: "Grounded RAG", blurb: "Cited answers from your own documents, privately", href: "https://rag.norai.tech" },
  { name: "Judgewright", blurb: "Calibrate your LLM judge against human labels", href: "https://judge.norai.tech" },
  { name: "Anchorflow", blurb: "Pin and audit GitHub Actions workflows", href: "https://anchor.norai.tech" },
  { name: "Smart Rozgar", blurb: "Sarkari job alerts in Hindi and English", href: "https://rozgar.norai.tech" },
] as const;

/** JSON-LD nodes shared by every page: the company, and a reference tools use to name it as publisher. */
export const ORG_REF = { "@id": COMPANY.orgId } as const;
export const ORGANIZATION_JSONLD = {
  "@type": "Organization",
  "@id": COMPANY.orgId,
  name: COMPANY.name,
  alternateName: COMPANY.short,
  url: COMPANY.url,
  logo: COMPANY.logo,
  description: COMPANY.blurb,
} as const;
