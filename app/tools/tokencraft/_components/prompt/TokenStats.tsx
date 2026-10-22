"use client";

import { useMemo } from "react";
import type { TokenChunk } from "../../_lib/tokenizeTypes";
import { formatNumber } from "@/lib/utils";
import { displayTokenText } from "./TokenStream";

/** Vocabulary statistics for the current prompt, read as a short report. */
export function TokenStats({
  tokens,
  characters,
  bytes,
}: {
  tokens: TokenChunk[];
  characters: number;
  bytes: number;
}) {
  const stats = useMemo(() => {
    const freq = new Map<number, { id: number; text: string; count: number }>();
    let longest: TokenChunk | null = null;
    for (const t of tokens) {
      const f = freq.get(t.id);
      if (f) f.count += 1;
      else freq.set(t.id, { id: t.id, text: t.text, count: 1 });
      if (!longest || t.text.length > longest.text.length) longest = t;
    }
    const top = [...freq.values()].sort((a, b) => b.count - a.count).slice(0, 8);
    return { unique: freq.size, top, longest };
  }, [tokens]);

  if (!tokens.length) {
    return <p className="flex-1 px-6 pt-10 text-center text-sm text-ink-3">Paste some text to see its statistics.</p>;
  }

  const n = tokens.length;
  const figures: [string, string, string][] = [
    ["Characters per token", (characters / n).toFixed(2), "Higher means the vocabulary compresses this text well."],
    ["Bytes per token", (bytes / n).toFixed(2), "UTF-8 bytes; non-Latin scripts and emoji raise it."],
    ["Distinct tokens", `${formatNumber(stats.unique)} · ${((stats.unique / n) * 100).toFixed(0)}%`, "Distinct IDs as a share of all tokens. Low means lots of repetition."],
  ];
  const maxCount = stats.top[0]?.count ?? 1;

  return (
    <div className="min-h-[320px] flex-1 overflow-y-auto px-5 py-5 sm:px-6 lg:min-h-0">
      <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-3">
        {figures.map(([label, value, note]) => (
          <div key={label}>
            <dt className="text-[13px] text-ink-2">{label}</dt>
            <dd className="mt-1 font-display text-[34px] font-semibold leading-none text-ink tnum">{value}</dd>
            <dd className="mt-1.5 text-xs leading-snug text-ink-3">{note}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mt-8 text-[13px] font-medium text-ink">Most repeated tokens</h3>
      <ol className="mt-3 space-y-1.5">
        {stats.top.map((t) => (
          <li key={t.id} className="grid grid-cols-[minmax(0,9rem)_1fr_3rem] items-center gap-3 text-[13px]">
            <span className="truncate font-mono text-ink">
              {displayTokenText(t.text)} <span className="text-ink-3">#{t.id}</span>
            </span>
            <span className="h-2 rounded-full bg-rule" aria-hidden="true">
              <span className="block h-2 rounded-full bg-board dark:bg-gold" style={{ width: `${(t.count / maxCount) * 100}%` }} />
            </span>
            <span className="text-right font-mono text-ink-2 tnum">{t.count}×</span>
          </li>
        ))}
      </ol>

      {stats.longest && (
        <p className="mt-6 text-[13px] text-ink-2">
          Longest token:{" "}
          <span className="rounded-[3px] bg-panel px-1.5 py-0.5 font-mono text-ink">{displayTokenText(stats.longest.text)}</span>{" "}
          <span className="text-ink-3">
            #{stats.longest.id}, {stats.longest.text.length} characters
          </span>
        </p>
      )}
    </div>
  );
}
