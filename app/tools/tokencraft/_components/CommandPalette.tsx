"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useTokenCraftStore, type VisualViewMode } from "../_store/useTokenCraftStore";
import { PROMPT_PRESETS } from "../_lib/presets";
import { isExactCount } from "../_lib/costs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keycap } from "@/components/ui/keycap";
import { copyText } from "@/lib/clipboard";

interface CommandItem {
  id: string;
  group: "Actions" | "Show the prompt as" | "Samples" | "Models";
  title: string;
  hint?: string;
  shortcut?: string[];
  run: () => void | Promise<void>;
}

const VIEWS: { mode: VisualViewMode; label: string; hint: string }[] = [
  { mode: "text", label: "Text", hint: "Edit with token boundaries underlined" },
  { mode: "chips", label: "Tokens", hint: "One chip per token" },
  { mode: "ids", label: "IDs", hint: "The numbers the model sees" },
  { mode: "heatmap", label: "Bytes", hint: "Tokens shaded by UTF-8 size" },
  { mode: "analytics", label: "Stats", hint: "Compression and repeated tokens" },
];

/** ⌘K: every action, view, sample and model, searchable from the keyboard. */
export function CommandPalette() {
  const open = useTokenCraftStore((s) => s.commandPaletteOpen);
  const setOpen = useTokenCraftStore((s) => s.setCommandPaletteOpen);
  const registry = useTokenCraftStore((s) => s.modelsRegistry);
  const selectModel = useTokenCraftStore((s) => s.setSelectedModel);
  const loadPreset = useTokenCraftStore((s) => s.loadPreset);
  const minify = useTokenCraftStore((s) => s.generateMinifyPreview);
  const revert = useTokenCraftStore((s) => s.revertMinification);
  const canRevert = useTokenCraftStore((s) => s.previousText !== null);
  const clearText = useTokenCraftStore((s) => s.clearText);
  const setViewMode = useTokenCraftStore((s) => s.setViewMode);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // A fresh query on every open; a stale filter made Enter silently no-op
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const commands = useMemo<CommandItem[]>(() => {
    const close = () => setOpen(false);
    const list: CommandItem[] = [
      { id: "minify", group: "Actions", title: "Minify the prompt", hint: "Review the diff first", shortcut: ["⌘", "M"], run: () => (close(), minify()) },
      ...(canRevert
        ? [{ id: "revert", group: "Actions" as const, title: "Undo minify", shortcut: ["⌘", "Z"], run: () => (revert(), close()) }]
        : []),
      {
        id: "copy-ids",
        group: "Actions",
        title: "Copy token IDs as JSON",
        run: async () => {
          await copyText(JSON.stringify(useTokenCraftStore.getState().tokenChunks.map((t) => t.id)));
          close();
        },
      },
      { id: "rates", group: "Actions", title: "Go to the rate board", run: () => (close(), document.getElementById("rate-board")?.scrollIntoView()) },
      { id: "clear", group: "Actions", title: "Clear the prompt", shortcut: ["⌘", "⌫"], run: () => (clearText(), close()) },
      ...VIEWS.map((v) => ({
        id: `view-${v.mode}`,
        group: "Show the prompt as" as const,
        title: v.label,
        hint: v.hint,
        run: () => (setViewMode(v.mode), close()),
      })),
      ...Object.entries(PROMPT_PRESETS).map(([key, p]) => ({
        id: `preset-${key}`,
        group: "Samples" as const,
        title: p.label,
        hint: p.description,
        run: () => (loadPreset(key), close()),
      })),
      ...Object.entries(registry).map(([key, m]) => ({
        id: `model-${key}`,
        group: "Models" as const,
        title: m.name,
        hint: `${m.provider} · ${m.badgeText} context${isExactCount(m) ? "" : " · ≈ estimate"}`,
        run: () => (selectModel(key), close()),
      })),
    ];
    return list;
  }, [registry, canRevert, setOpen, minify, revert, clearText, setViewMode, loadPreset, selectModel]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.title} ${c.hint ?? ""} ${c.group}`.toLowerCase().includes(q));
  }, [commands, query]);

  const move = (delta: number) => {
    if (!matches.length) return;
    const next = (active + delta + matches.length) % matches.length;
    setActive(next);
    listRef.current?.querySelector(`[data-i="${next}"]`)?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      void matches[active]?.run();
    }
  };

  let lastGroup = "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        exitAnimation={false}
        className="max-w-xl gap-0 overflow-hidden rounded-xl border border-rule bg-sheet p-0 shadow-elevated"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Commands</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b border-rule px-4 py-3">
          <Search className="h-4 w-4 text-ink-3" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            autoFocus
            placeholder="Search actions, views, samples and models"
            aria-label="Search commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-list"
            aria-activedescendant={matches[active] ? `cmd-${matches[active].id}` : undefined}
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-3"
          />
          <Keycap size="xs">Esc</Keycap>
        </div>

        <div ref={listRef} id="command-list" role="listbox" aria-label="Commands" className="max-h-[360px] overflow-y-auto py-1.5">
          {matches.length === 0 && <p className="px-4 py-8 text-center text-[13px] text-ink-3">Nothing matches “{query}”.</p>}
          {matches.map((c, i) => {
            const heading = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            const on = i === active;
            return (
              <React.Fragment key={c.id}>
                {heading && <p className="px-4 pb-1 pt-3 text-[12px] font-medium text-ink-3" role="presentation">{heading}</p>}
                <div
                  id={`cmd-${c.id}`}
                  data-i={i}
                  role="option"
                  aria-selected={on}
                  onClick={() => void c.run()}
                  onMouseMove={() => !on && setActive(i)}
                  className={`mx-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 ${on ? "bg-panel" : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] text-ink">{c.title}</span>
                    {c.hint && <span className="block truncate text-[12px] text-ink-3">{c.hint}</span>}
                  </span>
                  {c.shortcut && (
                    <span className="flex shrink-0 gap-1">
                      {c.shortcut.map((k) => (
                        <Keycap key={k} size="xs">
                          {k}
                        </Keycap>
                      ))}
                    </span>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
