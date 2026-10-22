"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronDown, Download, Search } from "lucide-react";
import { useTokenCraftStore } from "../../_store/useTokenCraftStore";
import {
  blendedRate,
  callCost,
  formatCompact,
  formatMoney,
  formatRate,
  isExactCount,
  isUnpriced,
  rampPosition,
} from "../../_lib/costs";
import type { ModelPricing } from "../../_lib/modelTypes";
import {
  buildCsvReport,
  buildJsonReport,
  buildMarkdownReport,
  triggerBlobDownload,
} from "../../_lib/reportExport";
import { useAuth } from "../../_hooks/useAuth";
import { useAuthPromptStore } from "../../_store/useAuthPromptStore";
import { copyText } from "@/lib/clipboard";
import { formatNumber } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RatesStamp } from "../shell/RatesStamp";

type SortKey = "call" | "input" | "output" | "context" | "name";

const COLLAPSED_ROWS = 15;

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "name", label: "Model", className: "text-left" },
  { key: "input", label: "In / 1M", className: "hidden text-right md:table-cell" },
  { key: "output", label: "Out / 1M", className: "hidden text-right md:table-cell" },
  { key: "context", label: "Context", className: "hidden text-right sm:table-cell" },
  { key: "call", label: "This call", className: "text-right" },
];

function sortValue(m: ModelPricing, key: SortKey, inTok: number, outTok: number): number | string {
  switch (key) {
    case "input":
      return m.inputCostPer1M;
    case "output":
      return m.outputCostPer1M;
    case "context":
      return m.contextWindow;
    case "name":
      return m.name.toLowerCase();
    default:
      return isUnpriced(m) ? Number.POSITIVE_INFINITY : callCost(m, inTok, outTok).total;
  }
}

/**
 * The full board: every model priced for the prompt in the editor, on one
 * fixed log ramp so cheap and expensive read the same way on every row.
 */
export function RateBoard() {
  const registry = useTokenCraftStore((s) => s.modelsRegistry);
  const selected = useTokenCraftStore((s) => s.selectedModel);
  const select = useTokenCraftStore((s) => s.setSelectedModel);
  const tokenizedText = useTokenCraftStore((s) => s.tokenizedText);
  const tokenCount = useTokenCraftStore((s) => s.tokenCount);
  const outputRatio = useTokenCraftStore((s) => s.outputMultiplier);
  const calls = useTokenCraftStore((s) => s.batchVolume);
  const { isAuthenticated } = useAuth();
  const openAuthPrompt = useAuthPromptStore((s) => s.open);

  const [provider, setProvider] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "call", dir: 1 });
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const counting = tokenizedText === null;
  const inTok = counting ? 0 : tokenCount;
  const outTok = Math.round(inTok * outputRatio);

  const entries = useMemo(() => Object.entries(registry), [registry]);
  const providers = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [, m] of entries) counts.set(m.provider, (counts.get(m.provider) ?? 0) + 1);
    return [["All", entries.length] as const, ...[...counts.entries()].sort((a, b) => b[1] - a[1])];
  }, [entries]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries
      .filter(([, m]) => provider === "All" || m.provider === provider)
      .filter(([key, m]) => !q || `${m.name} ${m.provider} ${key}`.toLowerCase().includes(q))
      .sort(([, a], [, b]) => {
        const va = sortValue(a, sort.key, inTok, outTok);
        const vb = sortValue(b, sort.key, inTok, outTok);
        return (va < vb ? -1 : va > vb ? 1 : 0) * sort.dir;
      });
  }, [entries, provider, query, sort, inTok, outTok]);

  const visible = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "context" ? -1 : 1 }));

  const report = () => ({
    tokenCount: inTok,
    estimatedOutputTokens: outTok,
    batchVolume: calls,
    outputMultiplier: outputRatio,
    models: rows,
  });
  const gated = (fn: () => void | Promise<void>) => () => {
    if (!isAuthenticated) return openAuthPrompt("export");
    void fn();
  };

  return (
    <section
      id="rate-board"
      aria-labelledby="rate-board-title"
      className="scroll-mt-16 bg-board text-board-ink"
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 py-14 md:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <h2
              id="rate-board-title"
              className="font-display text-[40px] font-bold uppercase leading-[0.95] tracking-[0.02em] sm:text-[56px]"
            >
              The rate board
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-board-ink-2">
              Every model, priced for the prompt in your editor: {formatNumber(inTok)} tokens in,{" "}
              {formatNumber(outTok)} out. Bars sit on one fixed log scale from $0.003 to $100 per million, so a
              short bar is cheap on every row. Click a model to make it your pick.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="sm:hidden">
              <RatesStamp />
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-md border border-board-rule px-3 text-[13px] text-board-ink transition-colors hover:bg-board-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                {copied ? <Check className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
                {copied ? "Copied" : "Export"}
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={gated(async () => {
                    await copyText(buildMarkdownReport(report()));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1800);
                  })}
                >
                  Copy as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={gated(() =>
                    triggerBlobDownload(buildCsvReport(report()), "text/csv", `tokencraft-rates-${Date.now()}.csv`)
                  )}
                >
                  Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={gated(() =>
                    triggerBlobDownload(
                      JSON.stringify(buildJsonReport(report()), null, 2),
                      "application/json",
                      `tokencraft-rates-${Date.now()}.json`
                    )
                  )}
                >
                  Download JSON
                </DropdownMenuItem>
                {!isAuthenticated && (
                  <p className="px-2 pb-1.5 pt-1 text-[11px] leading-snug text-ink-3">
                    Exports need a free account so we can keep them fair-use.
                  </p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
          <div role="radiogroup" aria-label="Filter by provider" className="board-scroll -mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
            {providers.map(([name, count]) => {
              const on = provider === name;
              return (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setProvider(name);
                    setExpanded(false);
                  }}
                  className={`shrink-0 rounded-md px-2.5 py-1 text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    on ? "bg-gold text-[#1d1400]" : "text-board-ink-2 hover:bg-board-2 hover:text-board-ink"
                  }`}
                >
                  {name} <span className="font-mono text-[11px] opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
          <label className="relative md:ml-auto">
            <span className="sr-only">Search models</span>
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-board-ink-2" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models"
              className="h-9 w-full rounded-md border border-board-rule bg-board-2 pl-8 pr-3 text-[13px] text-board-ink outline-none placeholder:text-board-ink-2 focus:border-gold md:w-60"
            />
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-board-rule">
          <table className="w-full table-fixed border-collapse text-[13px]">
            <caption className="sr-only">
              Model prices per million tokens and the cost of the current call, sorted by {sort.key}
            </caption>
            <colgroup>
              <col />
              <col className="hidden w-24 md:table-column" />
              <col className="hidden w-24 md:table-column" />
              <col className="hidden w-24 sm:table-column" />
              <col className="w-[9.5rem] sm:w-56" />
            </colgroup>
            <thead>
              <tr className="border-b border-board-rule bg-board-2 text-[12px] text-board-ink-2">
                {COLUMNS.map((c) => {
                  const on = sort.key === c.key;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
                      className={`px-3 py-2 font-medium first:pl-4 last:pr-4 ${c.className}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(c.key)}
                        className={`inline-flex items-center gap-1 rounded-sm hover:text-board-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${on ? "text-board-ink" : ""}`}
                      >
                        {c.label}
                        {on &&
                          (sort.dir === 1 ? (
                            <ArrowUp className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden="true" />
                          ))}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visible.map(([key, m]) => {
                const on = key === selected;
                const c = callCost(m, inTok, outTok);
                const fits = m.contextWindow >= inTok + outTok;
                return (
                  <tr
                    key={key}
                    onClick={() => select(key)}
                    className={`cursor-pointer border-b border-board-rule/60 transition-colors last:border-0 hover:bg-board-2 ${on ? "bg-board-2" : ""}`}
                  >
                    <td className="py-2 pl-4 pr-3">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={(e) => {
                          e.stopPropagation();
                          select(key);
                        }}
                        className="block w-full min-w-0 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        <span className="flex items-center gap-1.5 truncate font-medium">
                          {on && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />}
                          <span className="truncate">{m.name}</span>
                          {!isExactCount(m) && (
                            <span className="text-board-ink-2" title="Count estimated with o200k_base">≈</span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] text-board-ink-2">{m.provider}</span>
                      </button>
                    </td>
                    <td className="hidden px-3 py-2 text-right font-mono text-board-ink tnum md:table-cell">
                      ${formatRate(m.inputCostPer1M)}
                    </td>
                    <td className="hidden px-3 py-2 text-right font-mono text-board-ink tnum md:table-cell">
                      ${formatRate(m.outputCostPer1M)}
                    </td>
                    <td className={`hidden px-3 py-2 text-right font-mono tnum sm:table-cell ${fits ? "text-board-ink-2" : "text-[#ff9a90]"}`}>
                      {formatCompact(m.contextWindow)}
                    </td>
                    <td className="py-2 pl-3 pr-4">
                      <span className="flex items-center justify-end gap-3">
                        <span className="hidden h-1.5 flex-1 rounded-full bg-board-rule sm:block" aria-hidden="true">
                          <span
                            className="block h-1.5 rounded-full bg-gold"
                            style={{ width: `${(rampPosition(blendedRate(m, outputRatio)) * 100).toFixed(1)}%` }}
                          />
                        </span>
                        <span className="w-20 text-right font-mono text-gold tnum">
                          {counting ? "—" : isUnpriced(m) ? "No price" : fits ? formatMoney(c.total) : "Too long"}
                        </span>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!visible.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-board-ink-2">
                    No models match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[12px] text-board-ink-2">
          <p>
            ≈ marks models with their own tokenizer; their counts are o200k_base estimates. Prices are list rates in USD
            and exclude batch discounts.
          </p>
          {rows.length > COLLAPSED_ROWS && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="rounded-md border border-board-rule px-3 py-1.5 text-[13px] text-board-ink transition-colors hover:bg-board-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              {expanded ? "Show the top 15" : `Show all ${rows.length} models`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
