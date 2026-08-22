"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { VList } from "virtua";
import {
  useTokenCraftStore,
  type VisualViewMode,
} from "../_store/useTokenCraftStore";
import type { TokenChunk } from "../_lib/tokenize";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShinyText } from "@/components/ui/shiny-text";
import { Skeleton } from "@/components/ui/skeleton";
import { copyText } from "@/lib/clipboard";
import { formatNumber, stringToHex } from "@/lib/utils";
import {
  Search,
  Copy,
  Check,
  Activity,
  Layers,
  FileCode2,
  BarChart3,
  Hash,
  Flame,
  AlertTriangle,
} from "lucide-react";

/* ---------------------------------------------------------------------------
 * Layout constants — monospace rendering makes chip widths computable exactly,
 * enabling deterministic line-packing and constant-height virtualized rows.
 * ------------------------------------------------------------------------- */
const CHIP_FONT_PX = 12;
const CHIP_PAD_X = 12; // px-1.5 → 6px per side
const CHIP_BORDER = 2;
const CHIP_GAP = 4; // gap-1
const ROW_HEIGHT = 26;
const HOVER_DELAY_MS = 70;
const COPY_FLASH_MS = 900;

function measureMonoCharWidth(): number {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 7.3;
  ctx.font = `${CHIP_FONT_PX}px "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace`;
  // 8% safety margin keeps packed rows slightly conservative against
  // cross-platform font metric drift
  return (ctx.measureText("M".repeat(50)).width / 50) * 1.08;
}

/** Single-line glyph substitutions — real newlines would break row heights */
function displayTokenText(text: string): string {
  return (
    text.replace(/ /g, "␣").replace(/\n/g, "↵").replace(/\t/g, "⇥") || "<empty>"
  );
}

function chipLabel(token: TokenChunk, viewMode: VisualViewMode): string {
  if (viewMode === "ids") return `#${token.id}`;
  return displayTokenText(token.text);
}

function chipClasses(token: TokenChunk, viewMode: VisualViewMode): string {
  if (viewMode === "ids") {
    return "bg-surface-elevated border border-surface-border text-zinc-300 hover:border-zinc-400";
  }
  if (viewMode === "heatmap") {
    if (token.byteLength <= 1)
      return "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300";
    if (token.byteLength === 2)
      return "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300";
    if (token.byteLength === 3)
      return "bg-amber-500/10 border border-amber-500/25 text-amber-300";
    return "bg-rose-500/15 border border-rose-500/30 text-rose-300";
  }
  return `bpe-token-${token.index % 5}`;
}

/* ---------------------------------------------------------------------------
 * Virtualized row — one flex line of chips at a fixed height
 * ------------------------------------------------------------------------- */
interface TokenRowProps {
  tokens: TokenChunk[];
  viewMode: VisualViewMode;
  selectedIndex: number | null;
  copiedIndex: number | null;
  onSelectToken: (index: number, raw: string) => void;
  onHoverToken: (token: TokenChunk, x: number, y: number) => void;
  onLeaveToken: () => void;
}

const TokenRow = React.memo(function TokenRow({
  tokens,
  viewMode,
  selectedIndex,
  copiedIndex,
  onSelectToken,
  onHoverToken,
  onLeaveToken,
}: TokenRowProps) {
  return (
    <div className="flex items-center gap-1" style={{ height: ROW_HEIGHT }}>
      {tokens.map((token) => (
        <button
          key={token.index}
          type="button"
          tabIndex={-1}
          onClick={() => onSelectToken(token.index, token.text)}
          onMouseEnter={(e) => onHoverToken(token, e.clientX, e.clientY)}
          onMouseLeave={onLeaveToken}
          aria-label={`Token ${displayTokenText(token.text)}, ID ${token.id}, position ${formatNumber(token.index)}`}
          className={`${chipClasses(
            token,
            viewMode
          )} inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all duration-150 ease-out-expo font-mono text-[12px] leading-4 whitespace-nowrap hover:scale-[1.04] active:scale-95 ${
            selectedIndex === token.index ? "ring-2 ring-zinc-200 font-bold" : ""
          } ${copiedIndex === token.index ? "ring-2 ring-sky-400 brightness-125" : ""}`}
        >
          {chipLabel(token, viewMode)}
        </button>
      ))}
    </div>
  );
});

/* Shared hover card — one instance replaces thousands of Radix tooltips */
function TokenHoverDetail({ token }: { token: TokenChunk }) {
  return (
    <div className="flex flex-col gap-1.5 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-surface-border pb-1.5">
        <span className="text-[10px] uppercase text-zinc-400">Token ID</span>
        <span className="text-xs font-bold text-emerald-400 tabular-nums">
          #{token.id}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] text-zinc-400 shrink-0">Raw Text:</span>
        <span className="text-[11px] font-semibold text-zinc-100 bg-surface-subtle px-1.5 py-0.5 rounded border border-surface-border truncate max-w-[150px]">
          {displayTokenText(token.text)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">Position:</span>
        <span className="text-[11px] text-zinc-200 tabular-nums">
          Index {formatNumber(token.index)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-400">Byte Length:</span>
        <span className="text-[11px] text-zinc-200 tabular-nums">
          {token.byteLength} {token.byteLength === 1 ? "byte" : "bytes"}
        </span>
      </div>

      <div className="flex flex-col gap-0.5 pt-1 border-t border-surface-border">
        <span className="text-[10px] text-zinc-400 uppercase">
          Hex Encoding:
        </span>
        <span className="text-[10px] text-zinc-300 bg-surface-subtle px-1.5 py-0.5 rounded border border-surface-border break-all">
          {stringToHex(token.text) || "0x00"}
        </span>
      </div>
    </div>
  );
}

function hoverCardPosition(x: number, y: number): React.CSSProperties {
  const CARD_W = 244;
  const CARD_H = 208;
  const MARGIN = 8;
  let left = x + 14;
  let top = y - CARD_H - 8;
  if (left + CARD_W + MARGIN > window.innerWidth)
    left = window.innerWidth - CARD_W - MARGIN;
  if (left < MARGIN) left = MARGIN;
  if (top < MARGIN) top = y + 18;
  if (top + CARD_H + MARGIN > window.innerHeight)
    top = Math.max(MARGIN, window.innerHeight - CARD_H - MARGIN);
  return { left, top };
}

const HEATMAP_LEGEND = [
  { label: "1B", classes: "bg-emerald-500/25 border-emerald-500/40" },
  { label: "2B", classes: "bg-cyan-500/25 border-cyan-500/40" },
  { label: "3B", classes: "bg-amber-500/25 border-amber-500/40" },
  { label: "4B+", classes: "bg-rose-500/30 border-rose-500/45" },
];

const VIEW_MODES: { mode: VisualViewMode; label: string; full: string }[] = [
  { mode: "chips", label: "Chips", full: "BPE Color Boundary Chips" },
  { mode: "ids", label: "IDs", full: "Token ID Integer Stream" },
  { mode: "heatmap", label: "Bytes", full: "Byte Density Heatmap" },
  { mode: "analytics", label: "Analytics", full: "Vocabulary Analytics" },
];

const VIEW_MODE_ICONS: Record<VisualViewMode, React.ElementType> = {
  chips: Layers,
  ids: Hash,
  heatmap: Flame,
  analytics: BarChart3,
};

export function TokenInspectorPane() {
  const tokenChunks = useTokenCraftStore((s) => s.tokenChunks);
  const tokenCount = useTokenCraftStore((s) => s.tokenCount);
  const characterCount = useTokenCraftStore((s) => s.characterCount);
  const byteCount = useTokenCraftStore((s) => s.byteCount);
  const executionTimeMs = useTokenCraftStore((s) => s.executionTimeMs);
  const isProcessing = useTokenCraftStore((s) => s.isProcessing);
  const isWorkerDegraded = useTokenCraftStore((s) => s.isWorkerDegraded);
  const viewMode = useTokenCraftStore((s) => s.viewMode);
  const setViewMode = useTokenCraftStore((s) => s.setViewMode);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // debounced
  const [copiedIds, setCopiedIds] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null
  );
  const [copiedTokenIndex, setCopiedTokenIndex] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{
    token: TokenChunk;
    x: number;
    y: number;
  } | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const streamRef = useRef<HTMLDivElement>(null);
  const charWidthRef = useRef(7.3);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasStream =
    tokenChunks.length > 0 && viewMode !== "analytics";

  // Measure exact monospace advance once per environment
  useEffect(() => {
    charWidthRef.current = measureMonoCharWidth();
  }, []);

  // Debounce the filter input so huge streams aren't re-scanned per keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 120);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Track stream viewport width for deterministic line packing
  useEffect(() => {
    if (!hasStream) return;
    const el = streamRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(Math.floor(width));
    });
    observer.observe(el);
    setContainerWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [hasStream]);

  // New tokenization invalidates selection/copy/hover state
  useEffect(() => {
    setSelectedTokenIndex(null);
    setCopiedTokenIndex(null);
    setHoverInfo(null);
  }, [tokenChunks]);

  useEffect(
    () => () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      if (copyFlashTimerRef.current) clearTimeout(copyFlashTimerRef.current);
    },
    []
  );

  // Filter tokens (uses precomputed lowercase haystack from the worker)
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokenChunks;
    const query = searchQuery.toLowerCase();
    return tokenChunks.filter((t) => t.search.includes(query));
  }, [tokenChunks, searchQuery]);

  /* Greedy monospace-exact line packing — O(n), no DOM measurement */
  const rows = useMemo(() => {
    if (!hasStream || !containerWidth) return [];
    const charW = charWidthRef.current;
    const packed: TokenChunk[][] = [];
    let current: TokenChunk[] = [];
    let used = 0;

    for (const token of filteredTokens) {
      const w =
        chipLabel(token, viewMode).length * charW + CHIP_PAD_X + CHIP_BORDER;
      if (current.length > 0 && used + w > containerWidth) {
        packed.push(current);
        current = [];
        used = 0;
      }
      current.push(token);
      used += w + CHIP_GAP;
    }
    if (current.length > 0) packed.push(current);
    return packed;
  }, [filteredTokens, viewMode, containerWidth, hasStream]);

  const handleSelectToken = useCallback(
    async (index: number, raw: string) => {
      setSelectedTokenIndex(index);
      const ok = await copyText(raw);
      if (ok) {
        setCopiedTokenIndex(index);
        if (copyFlashTimerRef.current)
          clearTimeout(copyFlashTimerRef.current);
        copyFlashTimerRef.current = setTimeout(
          () => setCopiedTokenIndex(null),
          COPY_FLASH_MS
        );
      }
    },
    []
  );

  const handleHoverToken = useCallback(
    (token: TokenChunk, x: number, y: number) => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(
        () => setHoverInfo({ token, x, y }),
        HOVER_DELAY_MS
      );
    },
    []
  );

  const handleLeaveToken = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    setHoverInfo(null);
  }, []);

  const handleCopyTokenIds = async () => {
    if (tokenChunks.length === 0) return;
    const ids = tokenChunks.map((t) => t.id);
    const ok = await copyText(JSON.stringify(ids));
    if (ok) {
      setCopiedIds(true);
      setTimeout(() => setCopiedIds(false), 2000);
    }
  };

  // Analytics derivations
  const analytics = useMemo(() => {
    if (tokenChunks.length === 0) {
      return {
        charsPerToken: 0,
        uniqueTokensCount: 0,
        uniquePercent: 0,
        topTokens: [],
        longestToken: null,
      };
    }

    const charsPerToken =
      characterCount > 0 ? (characterCount / tokenChunks.length).toFixed(2) : "0";

    const frequencyMap = new Map<
      number,
      { id: number; text: string; count: number }
    >();
    let longest = tokenChunks[0];

    tokenChunks.forEach((t) => {
      const existing = frequencyMap.get(t.id);
      if (existing) {
        existing.count += 1;
      } else {
        frequencyMap.set(t.id, { id: t.id, text: t.text, count: 1 });
      }

      if (t.text.length > (longest?.text.length || 0)) {
        longest = t;
      }
    });

    const uniqueTokensCount = frequencyMap.size;
    const uniquePercent = ((uniqueTokensCount / tokenChunks.length) * 100).toFixed(1);

    const topTokens = Array.from(frequencyMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      charsPerToken: Number(charsPerToken),
      uniqueTokensCount,
      uniquePercent: Number(uniquePercent),
      topTokens,
      longestToken: longest,
    };
  }, [tokenChunks, characterCount]);

  return (
    <div className="flex flex-col min-h-[520px] lg:min-h-0 lg:h-full rounded-xl border border-surface-border bg-surface-default overflow-hidden transition-all duration-200 hover:border-surface-borderHover">
      {/* Pane Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-surface-border bg-surface-subtle/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
            BPE Token Inspector
          </span>
          <span
            aria-live="polite"
            aria-atomic="true"
            className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-sky-400 border border-sky-500/20 font-mono tabular-nums font-medium"
          >
            <NumberTicker value={tokenCount} />{" "}
            {tokenCount === 1 ? "Token" : "Tokens"}
          </span>
        </div>

        {/* View Mode Segmented Controls */}
        <div
          role="group"
          aria-label="Token visualization mode"
          className="flex items-center p-0.5 rounded-lg bg-surface-elevated border border-surface-border text-xs font-mono"
        >
          {VIEW_MODES.map(({ mode, label, full }) => {
            const Icon = VIEW_MODE_ICONS[mode];
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                aria-pressed={active}
                title={`${full} view`}
                className={`px-2 py-1 rounded-md transition-all duration-150 ease-out-expo flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 ${
                  active
                    ? "bg-surface-default text-zinc-100 border border-surface-borderHover font-medium shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 border border-transparent active:bg-surface-default/60"
                }`}
              >
                <Icon
                  className={`w-3 h-3 ${
                    mode === "chips"
                      ? "text-sky-400"
                      : mode === "ids"
                      ? "text-cyan-400"
                      : mode === "heatmap"
                      ? "text-amber-400"
                      : "text-violet-400"
                  }`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Filter & Action Sub-Bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 bg-surface-subtle/40 border-b border-surface-border">
        <div className="relative">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search token / ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Filter tokens by text or ID"
            className="h-6 w-36 sm:w-48 pl-7 pr-2 rounded-md bg-surface-elevated border border-surface-border text-[11px] font-mono text-zinc-200 placeholder:text-zinc-500 outline-none transition-[border-color,box-shadow] duration-150 focus:border-sky-400/60 focus:shadow-[0_0_0_3px_rgba(56,189,248,0.15)]"
          />
        </div>

        {/* Heatmap Legend */}
        {viewMode === "heatmap" && tokenChunks.length > 0 && (
          <div
            className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-zinc-400"
            aria-label="Heatmap legend: bytes per token"
          >
            {HEATMAP_LEGEND.map(({ label, classes }) => (
              <span key={label} className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-sm border ${classes}`}
                  aria-hidden="true"
                />
                {label}
              </span>
            ))}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyTokenIds}
          disabled={tokenChunks.length === 0}
          className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated ml-auto"
          aria-label="Copy token IDs as JSON"
        >
          {copiedIds ? (
            <Check className="w-3 h-3 text-sky-400 mr-1" aria-hidden="true" />
          ) : (
            <Copy className="w-3 h-3 mr-1" aria-hidden="true" />
          )}
          <span className="text-[11px]">
            {copiedIds ? "Copied IDs" : "Copy IDs"}
          </span>
        </Button>
      </div>

      {/* Worker-degraded banner — shown only when tokenization fell back to main thread */}
      {isWorkerDegraded && (
        <div
          role="status"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-[11px] font-mono text-amber-300"
        >
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Main-thread mode active</span>
        </div>
      )}

      {/* Completion announcer — single polite channel (role="status" implies
          aria-live:polite) for tokenization results */}
      <span className="sr-only" role="status">
        {!isProcessing && tokenCount > 0
          ? `Tokenized ${formatNumber(tokenCount)} tokens`
          : ""}
      </span>

      {/* Token Visualizer Body */}
      <div className="flex-1 min-h-0 p-4 font-mono text-xs">
        {tokenChunks.length === 0 && isProcessing ? (
          /* First-compute skeleton — fills the same flex body, so swapping in
             the stream never shifts layout */
          <div
            className="h-full min-h-[220px] flex flex-col justify-center gap-3 px-2"
            role="status"
            aria-label="Computing tokens"
          >
            <Skeleton className="h-4 w-[85%]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        ) : tokenChunks.length === 0 ? (
          /* Clean Empty State Card */
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mb-3 text-zinc-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <FileCode2 className="w-5 h-5 text-sky-400" aria-hidden="true" />
            </div>
            <h2 className="text-sm font-semibold text-zinc-200 mb-1">
              No Tokens Generated
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm">
              Type or paste text in the raw editor to inspect individual BPE
              token boundaries, hex encodings, and byte weights in real-time.
            </p>
          </div>
        ) : viewMode === "analytics" ? (
          /* Analytics Dashboard View */
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-400 font-mono">
                    Token Efficiency
                  </span>
                  <span className="text-lg font-bold text-zinc-100 tabular-nums">
                    <NumberTicker
                      value={analytics.charsPerToken}
                      decimalPlaces={2}
                    />{" "}
                    <span className="text-xs font-normal text-zinc-400">
                      chars/tok
                    </span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-400 font-mono">
                    Unique Vocabulary
                  </span>
                  <span className="text-lg font-bold text-zinc-100 tabular-nums">
                    <NumberTicker value={analytics.uniqueTokensCount} />{" "}
                    <span className="text-xs font-normal text-zinc-400">
                      ({analytics.uniquePercent}%)
                    </span>
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase text-zinc-400 font-mono">
                    Average Bytes/Token
                  </span>
                  <span className="text-lg font-bold text-zinc-100 tabular-nums">
                    <NumberTicker
                      value={Number((byteCount / tokenChunks.length).toFixed(2))}
                      decimalPlaces={2}
                    />{" "}
                    <span className="text-xs font-normal text-zinc-400">
                      bytes
                    </span>
                  </span>
                </div>
              </div>

              {/* Top Repeated Subwords */}
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-300 font-medium">
                    Top Frequent Tokens
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Occurrences
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {analytics.topTokens.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-surface-default border border-surface-border text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 tabular-nums">
                          #{item.id}
                        </span>
                        <span className="font-semibold text-zinc-200 bg-surface-elevated px-1.5 py-0.5 rounded border border-surface-border">
                          {item.text.replace(/ /g, "␣").replace(/\n/g, "↵")}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-emerald-400 font-mono tabular-nums">
                        {item.count}x
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Longest Token */}
              {analytics.longestToken && (
                <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-between text-xs">
                  <span className="text-[10px] uppercase text-zinc-400 font-mono">
                    Longest Token:
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-zinc-300 font-semibold tabular-nums">
                      #{analytics.longestToken.id}
                    </span>
                    <span className="bg-surface-elevated px-2 py-0.5 rounded text-zinc-200 border border-surface-border">
                      &quot;{analytics.longestToken.text}&quot; (
                      {analytics.longestToken.text.length} chars)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Virtualized Token Stream */
          <div ref={streamRef} className="h-full">
            {containerWidth > 0 && rows.length > 0 ? (
              <VList
                style={{ height: "100%" }}
                itemSize={ROW_HEIGHT}
                bufferSize={8}
              >
                {rows.map((rowTokens) => (
                  <TokenRow
                    key={rowTokens[0].index}
                    tokens={rowTokens}
                    viewMode={viewMode}
                    selectedIndex={selectedTokenIndex}
                    copiedIndex={copiedTokenIndex}
                    onSelectToken={handleSelectToken}
                    onHoverToken={handleHoverToken}
                    onLeaveToken={handleLeaveToken}
                  />
                ))}
              </VList>
            ) : filteredTokens.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-xs font-mono text-zinc-400">
                  No tokens match &quot;{searchInput}&quot;.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Pane Footer: Performance Telemetry */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle/70 border-t border-surface-border text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span className="text-zinc-400 text-[10px] uppercase tracking-wider">
            Latency:
          </span>
          <span className="text-zinc-200 font-semibold text-[11px] tabular-nums">
            {isProcessing ? (
              <ShinyText shineColor="cyan">Computing…</ShinyText>
            ) : (
              `${executionTimeMs} ms`
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isProcessing
                ? "bg-amber-400 animate-pulse motion-reduce:animate-none"
                : "bg-sky-400 animate-pulse motion-reduce:animate-none"
            }`}
            aria-hidden="true"
          />
          <ShinyText shineColor="white" className="text-zinc-300 text-[10px]">
            {isProcessing ? "Worker Busy" : "BPE Engine Active"}
          </ShinyText>
        </div>
      </div>

      {/* Single shared hover card (portal) */}
      {hoverInfo &&
        createPortal(
          <div
            role="tooltip"
            className="fixed z-[70] pointer-events-none p-3 bg-surface-default border border-surface-borderHover shadow-elevated rounded-xl min-w-[210px] glass-edge"
            style={hoverCardPosition(hoverInfo.x, hoverInfo.y)}
          >
            <TokenHoverDetail token={hoverInfo.token} />
          </div>,
          document.body
        )}
    </div>
  );
}
