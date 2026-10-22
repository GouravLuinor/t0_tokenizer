"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { VList } from "virtua";
import { Check, Copy, Search } from "lucide-react";
import type { TokenChunk } from "../../_lib/tokenizeTypes";
import { copyText } from "@/lib/clipboard";
import { formatNumber, stringToHex } from "@/lib/utils";

export type StreamMode = "chips" | "ids" | "heatmap";

/*
 * Monospace rendering makes chip widths computable exactly, so rows can be
 * packed without measuring the DOM and virtualized at a constant height.
 */
const CHIP_FONT_PX = 13;
const CHIP_PAD_X = 10;
const CHIP_GAP = 4;
const ROW_HEIGHT = 30;
const HOVER_DELAY_MS = 70;
const COPY_FLASH_MS = 900;

function measureMonoCharWidth(): number {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 7.9;
  const family = getComputedStyle(document.body).getPropertyValue("--font-geist-mono") || "monospace";
  ctx.font = `${CHIP_FONT_PX}px ${family}, ui-monospace, monospace`;
  // A small safety margin absorbs cross-platform metric drift
  return (ctx.measureText("M".repeat(50)).width / 50) * 1.06;
}

/** Single-line glyphs for invisible characters; real newlines would break rows */
export function displayTokenText(text: string): string {
  if (!text) return "◌";
  return text.replace(/ /g, "␣").replace(/\n/g, "↵").replace(/\t/g, "⇥");
}

function chipLabel(token: TokenChunk, mode: StreamMode): string {
  return mode === "ids" ? String(token.id) : displayTokenText(token.text);
}

function chipClass(token: TokenChunk, mode: StreamMode): string {
  if (mode === "ids") return "bg-sheet text-ink-2 shadow-[inset_0_0_0_1px_rgb(var(--rule))]";
  if (mode === "heatmap") {
    if (token.byteLength <= 1) return "chip-0";
    if (token.byteLength === 2) return "chip-2";
    if (token.byteLength === 3) return "chip-1";
    return "bg-danger/15 shadow-[inset_0_-2px_0_rgb(var(--danger))]";
  }
  return `chip-${token.index % 4}`;
}

export const HEATMAP_LEGEND = [
  { label: "1 byte", cls: "chip-0" },
  { label: "2 bytes", cls: "chip-2" },
  { label: "3 bytes", cls: "chip-1" },
  { label: "4+ bytes", cls: "bg-danger/15 shadow-[inset_0_-2px_0_rgb(var(--danger))]" },
];

const TokenRow = React.memo(function TokenRow({
  tokens,
  mode,
  copiedIndex,
  onCopy,
  onHover,
  onLeave,
}: {
  tokens: TokenChunk[];
  mode: StreamMode;
  copiedIndex: number | null;
  onCopy: (token: TokenChunk) => void;
  onHover: (token: TokenChunk, x: number, y: number) => void;
  onLeave: () => void;
}) {
  return (
    <div className="flex items-center gap-1" style={{ height: ROW_HEIGHT }}>
      {tokens.map((token) => (
        <button
          key={token.index}
          type="button"
          tabIndex={-1}
          onClick={() => onCopy(token)}
          onMouseEnter={(e) => onHover(token, e.clientX, e.clientY)}
          onMouseLeave={onLeave}
          aria-label={`Token ${displayTokenText(token.text)}, ID ${token.id}, position ${token.index + 1}`}
          className={`${chipClass(token, mode)} whitespace-nowrap rounded-[3px] px-[5px] py-[3px] font-mono text-[13px] leading-4 text-ink transition-transform duration-100 hover:-translate-y-px ${
            copiedIndex === token.index ? "ring-2 ring-gold" : ""
          }`}
        >
          {chipLabel(token, mode)}
        </button>
      ))}
    </div>
  );
});

function HoverDetail({ token }: { token: TokenChunk }) {
  const rows: [string, string][] = [
    ["Token ID", `#${token.id}`],
    ["Position", `${formatNumber(token.index + 1)}`],
    ["Bytes", String(token.byteLength)],
    ["UTF-8", stringToHex(token.text) || "partial character"],
  ];
  return (
    <div className="font-mono text-xs">
      <div className="mb-2 rounded-[3px] bg-panel px-2 py-1 text-[13px] text-ink">
        {displayTokenText(token.text)}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-ink-3">{k}</dt>
            <dd className="break-all text-ink">{v}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

function hoverPosition(x: number, y: number): React.CSSProperties {
  const W = 240;
  const H = 150;
  const M = 8;
  let left = x + 14;
  let top = y - H - 10;
  if (left + W + M > window.innerWidth) left = window.innerWidth - W - M;
  if (left < M) left = M;
  if (top < M) top = y + 18;
  return { left, top, width: W };
}

export function TokenStream({ tokens, mode }: { tokens: TokenChunk[]; mode: StreamMode }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedIds, setCopiedIds] = useState(false);
  const [hover, setHover] = useState<{ token: TokenChunk; x: number; y: number } | null>(null);
  const [width, setWidth] = useState(0);
  const streamRef = useRef<HTMLDivElement>(null);
  const charW = useRef(7.9);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    charW.current = measureMonoCharWidth();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(Math.floor(entries[0]?.contentRect.width ?? 0)));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => setHover(null), [tokens]);
  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    []
  );

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return q ? tokens.filter((t) => t.search.includes(q)) : tokens;
  }, [tokens, debounced]);

  const rows = useMemo(() => {
    if (!width) return [];
    const packed: TokenChunk[][] = [];
    let current: TokenChunk[] = [];
    let used = 0;
    for (const t of filtered) {
      const w = chipLabel(t, mode).length * charW.current + CHIP_PAD_X;
      if (current.length && used + w > width) {
        packed.push(current);
        current = [];
        used = 0;
      }
      current.push(t);
      used += w + CHIP_GAP;
    }
    if (current.length) packed.push(current);
    return packed;
  }, [filtered, mode, width]);

  const onCopy = useCallback(async (token: TokenChunk) => {
    if (await copyText(token.text)) {
      setCopiedIndex(token.index);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setCopiedIndex(null), COPY_FLASH_MS);
    }
  }, []);

  const onHover = useCallback((token: TokenChunk, x: number, y: number) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setHover({ token, x, y }), HOVER_DELAY_MS);
  }, []);

  const onLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHover(null);
  }, []);

  const copyIds = async () => {
    if (await copyText(JSON.stringify(tokens.map((t) => t.id)))) {
      setCopiedIds(true);
      setTimeout(() => setCopiedIds(false), 1600);
    }
  };

  return (
    <div className="flex min-h-[320px] flex-1 flex-col lg:min-h-0">
      <div className="flex flex-wrap items-center gap-3 border-b border-rule px-5 py-2.5 sm:px-6">
        <label className="relative">
          <span className="sr-only">Filter tokens by text or ID</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a token or ID"
            className="h-8 w-44 rounded-md border border-rule bg-sheet pl-8 pr-2 font-mono text-[13px] text-ink outline-none placeholder:text-ink-3 focus:border-board dark:focus:border-gold sm:w-56"
          />
        </label>
        {mode === "heatmap" && (
          <ul aria-label="Heatmap legend: bytes per token" className="flex flex-wrap items-center gap-3 text-xs text-ink-2">
            {HEATMAP_LEGEND.map((l) => (
              <li key={l.label} className="flex items-center gap-1.5">
                <span className={`h-3 w-4 rounded-[2px] ${l.cls}`} aria-hidden="true" />
                {l.label}
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={copyIds}
          disabled={!tokens.length}
          className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-ink-2 transition-colors hover:bg-panel hover:text-ink disabled:opacity-50"
        >
          {copiedIds ? <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copiedIds ? "Copied IDs" : "Copy IDs as JSON"}
        </button>
      </div>

      <div ref={streamRef} className="relative min-h-[260px] flex-1 px-5 py-3 sm:px-6">
        {rows.length > 0 ? (
          <div className="absolute inset-x-5 inset-y-3 sm:inset-x-6">
          <VList style={{ height: "100%" }} itemSize={ROW_HEIGHT} bufferSize={8}>
            {rows.map((r) => (
              <TokenRow
                key={r[0].index}
                tokens={r}
                mode={mode}
                copiedIndex={copiedIndex}
                onCopy={onCopy}
                onHover={onHover}
                onLeave={onLeave}
              />
            ))}
          </VList>
          </div>
        ) : (
          <p className="pt-10 text-center text-sm text-ink-3">
            {tokens.length ? `No tokens match “${query}”.` : "Paste some text to see its tokens."}
          </p>
        )}
      </div>

      {hover &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[70] rounded-md border border-rule bg-sheet p-3 shadow-elevated"
            style={hoverPosition(hover.x, hover.y)}
          >
            <HoverDetail token={hover.token} />
          </div>,
          document.body
        )}
    </div>
  );
}
