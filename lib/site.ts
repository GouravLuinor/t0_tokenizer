/** Canonical production origin — override with NEXT_PUBLIC_SITE_URL */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tokens.norai.tech";
  return raw.replace(/\/$/, "");
}
