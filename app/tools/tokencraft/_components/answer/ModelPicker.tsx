"use client";

import { useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useTokenCraftStore } from "../../_store/useTokenCraftStore";
import { getCurrentModel } from "../../_lib/modelRegistry";
import { formatCompact, formatRate, isExactCount } from "../../_lib/costs";

/** Searchable model list, grouped by provider in catalog order. */
export function ModelPicker() {
  const registry = useTokenCraftStore((s) => s.modelsRegistry);
  const selected = useTokenCraftStore((s) => s.selectedModel);
  const select = useTokenCraftStore((s) => s.setSelectedModel);
  const current = getCurrentModel(registry, selected);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(registry).filter(
      ([key, m]) => !q || `${m.name} ${m.provider} ${key}`.toLowerCase().includes(q)
    );
  }, [registry, query]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof matches>();
    for (const entry of matches) {
      const p = entry[1].provider;
      map.set(p, [...(map.get(p) ?? []), entry]);
    }
    return [...map.entries()];
  }, [matches]);

  const choose = (key: string) => {
    select(key);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.max(0, Math.min(matches.length - 1, active + (e.key === "ArrowDown" ? 1 : -1)));
      setActive(next);
      listRef.current?.querySelector(`[data-i="${next}"]`)?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && matches[active]) {
      e.preventDefault();
      choose(matches[active][0]);
    }
  };

  let flat = -1;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setQuery("");
          setActive(Math.max(0, Object.keys(registry).indexOf(selected)));
        }
      }}
    >
      <Popover.Trigger
        aria-label={`Model: ${current.name}. Change model`}
        className="group flex w-full items-center gap-3 rounded-md border border-rule bg-sheet px-3 py-2 text-left transition-colors hover:border-rule-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium text-ink">{current.name}</span>
          <span className="block truncate text-xs text-ink-3">
            {current.provider} · {formatCompact(current.contextWindow)} context · ${formatRate(current.inputCostPer1M)} / 1M in
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-ink" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[min(92vw,380px)] overflow-hidden rounded-lg border border-rule bg-sheet shadow-elevated"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (e.currentTarget as HTMLElement).querySelector("input")?.focus();
          }}
        >
          <label className="flex items-center gap-2 border-b border-rule px-3">
            <Search className="h-4 w-4 text-ink-3" aria-hidden="true" />
            <span className="sr-only">Search models</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder={`Search ${Object.keys(registry).length} models`}
              role="combobox"
              aria-expanded="true"
              aria-controls="model-list"
              aria-activedescendant={matches[active] ? `model-${matches[active][0]}` : undefined}
              className="h-11 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            />
          </label>
          <div ref={listRef} id="model-list" role="listbox" aria-label="Models" className="max-h-[min(60vh,420px)] overflow-y-auto p-1">
            {groups.length === 0 && <p className="px-3 py-6 text-center text-sm text-ink-3">No model matches “{query}”.</p>}
            {groups.map(([provider, entries]) => (
              <div key={provider} role="group" aria-label={provider}>
                <p className="px-2.5 pb-1 pt-2.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">
                  {provider}
                </p>
                {entries.map(([key, m]) => {
                  flat += 1;
                  const i = flat;
                  const isSel = key === selected;
                  return (
                    <div
                      key={key}
                      id={`model-${key}`}
                      data-i={i}
                      role="option"
                      aria-selected={isSel}
                      onClick={() => choose(key)}
                      onMouseMove={() => setActive(i)}
                      className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-sm ${i === active ? "bg-panel" : ""}`}
                    >
                      <Check className={`h-3.5 w-3.5 shrink-0 ${isSel ? "text-board dark:text-gold" : "invisible"}`} aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate text-ink">
                        {m.name}
                        {!isExactCount(m) && (
                          <span className="ml-1.5 text-ink-3" title="Count is an estimate for this model">
                            ≈
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-xs text-ink-3 tnum">{formatCompact(m.contextWindow)}</span>
                      <span className="w-16 text-right font-mono text-xs text-ink-2 tnum">${formatRate(m.inputCostPer1M)}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <p className="border-t border-rule px-3 py-2 text-xs text-ink-3">≈ these models use their own tokenizer. TokenCraft counts them with o200k_base, so the figure is an estimate.</p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
