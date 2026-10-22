import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopBar } from "../../_components/shell/TopBar";
import { SiteFooter } from "../../_components/shell/SiteFooter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { INITIAL_MODEL_REGISTRY, MODEL_CATALOG_GENERATED_AT } from "../../_lib/priceService";
import {
  cacheSavingPercent,
  callCost,
  formatCompact,
  formatMoney,
  formatRate,
  isExactCount,
  rankByCost,
} from "../../_lib/costs";
import { MODEL_SLUGS, SLUG_BY_KEY, WORKLOADS, modelForSlug } from "../../_lib/modelPages";
import { siteUrl } from "@/lib/site";
import { formatNumber } from "@/lib/utils";

const HOME = "/tools/tokencraft";
const SNAPSHOT = new Date(MODEL_CATALOG_GENERATED_AT).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return [...MODEL_SLUGS.keys()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const found = modelForSlug((await params).slug);
  if (!found) return {};
  const { model } = found;
  const exact = isExactCount(model);
  const title = `${model.name} token counter & price calculator`;
  const description = `${exact ? "Exact" : "Estimated"} ${model.name} token counts and costs: $${formatRate(model.inputCostPer1M)} per 1M input tokens, $${formatRate(model.outputCostPer1M)} per 1M output, ${formatCompact(model.contextWindow)} context. Paste a prompt to price it in your browser.`;
  const url = `${HOME}/models/${(await params).slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "TokenCraft" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const found = modelForSlug((await params).slug);
  if (!found) notFound();
  const { key, model } = found;
  const exact = isExactCount(model);
  const saving = cacheSavingPercent(model);

  const reference = WORKLOADS[1];
  const ref = callCost(model, reference.input, reference.output).total;
  const cheaper = rankByCost(INITIAL_MODEL_REGISTRY, reference.input, reference.output)
    .filter((r) => r.key !== key && r.cost.total < ref && SLUG_BY_KEY.has(r.key))
    .slice(0, 5);
  const peers = Object.entries(INITIAL_MODEL_REGISTRY)
    .filter(([k, m]) => k !== key && m.provider === model.provider && SLUG_BY_KEY.has(k))
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${model.name} token counter & price calculator`,
    url: `${siteUrl()}${HOME}/models/${SLUG_BY_KEY.get(key)}`,
    isPartOf: { "@type": "WebApplication", name: "TokenCraft", url: `${siteUrl()}${HOME}` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "TokenCraft", item: `${siteUrl()}${HOME}` },
        { "@type": "ListItem", position: 2, name: model.name },
      ],
    },
  };

  const rates: [string, string][] = [
    ["Input", `$${formatRate(model.inputCostPer1M)}`],
    ["Output", `$${formatRate(model.outputCostPer1M)}`],
    ["Cached input", model.noCache ? "No cache tier" : `$${formatRate(model.cachedInputCostPer1M)}`],
    ["Context window", `${formatNumber(model.contextWindow)} tokens`],
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopBar linkBase={HOME} />

      <main id="main">
        <section className="bg-board text-board-ink">
          <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-8 md:px-8 lg:px-10 lg:pb-16">
            <nav aria-label="Breadcrumb" className="text-[13px] text-board-ink-2">
              <a href={HOME} className="hover:text-board-ink">TokenCraft</a>
              <span aria-hidden="true"> / </span>
              <a href={`${HOME}#rate-board`} className="hover:text-board-ink">Rate board</a>
            </nav>
            <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
              <div>
                <h1 className="font-display text-[40px] font-bold uppercase leading-[0.95] tracking-[0.02em] sm:text-[64px]">
                  {model.name} token counter &amp; price
                </h1>
                <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-board-ink-2">
                  {exact
                    ? `${model.name} uses OpenAI's ${model.family} encoding, which TokenCraft runs exactly, so counts match what you are billed.`
                    : `${model.provider} uses its own tokenizer for ${model.name}. TokenCraft estimates its counts with o200k_base and marks them ≈, so treat them as a planning figure and leave headroom.`}
                </p>
                <a
                  href={`${HOME}?model=${encodeURIComponent(key)}#workspace`}
                  className="mt-6 inline-flex h-11 items-center rounded-md bg-gold px-5 text-[15px] font-semibold text-[#1d1400] transition-colors hover:bg-[#f6b955] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-ink"
                >
                  Count a prompt for {model.name}
                </a>
              </div>
              <div className="rounded-lg border border-board-rule">
                <div className="flex items-baseline justify-between border-b border-board-rule px-5 py-3">
                  <h2 className="font-display text-[17px] font-semibold uppercase tracking-[0.06em]">Rate card</h2>
                  <span className="font-mono text-[11px] text-board-ink-2">USD per 1M tokens</span>
                </div>
                <dl>
                  {rates.map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between border-b border-board-rule/60 px-5 py-2.5 last:border-0">
                      <dt className="text-[14px] text-board-ink-2">{k}</dt>
                      <dd className="font-mono text-[16px] text-gold tnum">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="border-t border-board-rule px-5 py-2.5 text-[12px] text-board-ink-2">
                  {exact ? "Exact token counts" : "≈ Estimated token counts"} · list rates from OpenRouter, {SNAPSHOT}
                  {saving !== null && ` · cached input ${saving}% cheaper`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="examples" className="border-b border-rule">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8 lg:px-10 lg:py-16">
            <h2 id="examples" className="font-display text-[32px] font-bold uppercase leading-none tracking-[0.02em] text-ink sm:text-[40px]">
              What {model.name} costs for real jobs
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-[14px]">
                <thead>
                  <tr className="border-b border-rule-2 text-left text-[13px] text-ink-2">
                    <th scope="col" className="py-2.5 pr-4 font-medium">Job</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">Per call</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-medium">1,000 calls</th>
                    <th scope="col" className="py-2.5 pl-3 text-right font-medium">1M calls</th>
                  </tr>
                </thead>
                <tbody>
                  {WORKLOADS.map((w) => {
                    const fits = model.contextWindow >= w.input + w.output;
                    const c = callCost(model, w.input, w.output).total;
                    return (
                      <tr key={w.label} className="border-b border-rule">
                        <th scope="row" className="py-3 pr-4 text-left font-normal">
                          <span className="block font-medium text-ink">{w.label}</span>
                          <span className="block text-[13px] text-ink-3">{w.detail}</span>
                        </th>
                        {fits ? (
                          [c, c * 1000, c * 1_000_000].map((v, i) => (
                            <td key={i} className="px-3 py-3 text-right font-mono text-gold-ink tnum last:pr-0">
                              {formatMoney(v)}
                            </td>
                          ))
                        ) : (
                          <td colSpan={3} className="py-3 text-right text-[13px] text-danger">
                            Does not fit the {formatCompact(model.contextWindow)} window
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-ink-3">
              Input plus output at list rates, without caching or batch discounts.
              {model.tieredAboveTokens &&
                ` Prompts above ${formatCompact(model.tieredAboveTokens)} tokens are billed at a higher long-context rate that these figures do not include.`}
            </p>
          </div>
        </section>

        <section aria-labelledby="alternatives">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-12 md:px-8 lg:grid-cols-2 lg:px-10 lg:py-16">
            <div>
              <h2 id="alternatives" className="font-display text-[28px] font-bold uppercase leading-none tracking-[0.02em] text-ink">
                Cheaper for a RAG answer
              </h2>
              <p className="mt-2 text-[14px] text-ink-2">
                Same job: {formatNumber(reference.input)} tokens in, {formatNumber(reference.output)} out. {model.name} costs{" "}
                <span className="font-mono text-gold-ink">{formatMoney(ref)}</span>.
              </p>
              {cheaper.length ? (
                <ul className="mt-4 divide-y divide-rule border-y border-rule">
                  {cheaper.map((r) => (
                    <li key={r.key}>
                      <a href={`${HOME}/models/${SLUG_BY_KEY.get(r.key)}`} className="flex items-baseline justify-between gap-4 py-2.5 hover:text-board dark:hover:text-gold">
                        <span className="text-[14px] font-medium text-ink">
                          {r.model.name} <span className="font-normal text-ink-3">· {r.model.provider}</span>
                        </span>
                        <span className="font-mono text-[14px] text-gold-ink tnum">{formatMoney(r.cost.total)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[14px] text-ink-2">Nothing in the catalog is cheaper for this job.</p>
              )}
              {cheaper.length > 0 && (
                <p className="mt-3 text-[13px] text-ink-3">Cheaper is not the same equally capable. Try a few on your own task first.</p>
              )}
            </div>
            {peers.length > 0 && (
              <div>
                <h2 className="font-display text-[28px] font-bold uppercase leading-none tracking-[0.02em] text-ink">
                  More from {model.provider}
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {peers.map(([k, m]) => (
                    <li key={k}>
                      <a
                        href={`${HOME}/models/${SLUG_BY_KEY.get(k)}`}
                        className="inline-flex rounded-md border border-rule bg-sheet px-3 py-1.5 text-[14px] text-ink-2 transition-colors hover:border-rule-2 hover:text-ink"
                      >
                        {m.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter linkBase={HOME} />
    </TooltipProvider>
  );
}
