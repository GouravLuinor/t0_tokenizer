"use client";

import React, { useState, useMemo } from "react";
import {
  useTokenCraftStore,
  type VisualViewMode,
} from "../_store/useTokenCraftStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShinyText } from "@/components/ui/shiny-text";
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
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export function TokenInspectorPane() {
  const {
    tokenChunks,
    tokenCount,
    characterCount,
    byteCount,
    executionTimeMs,
    isProcessing,
    viewMode,
    setViewMode,
  } = useTokenCraftStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIds, setCopiedIds] = useState(false);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(
    null
  );

  // Filter tokens based on search query
  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokenChunks;
    const query = searchQuery.toLowerCase();
    return tokenChunks.filter(
      (t) =>
        t.text.toLowerCase().includes(query) ||
        t.id.toString().includes(query) ||
        t.hex.toLowerCase().includes(query)
    );
  }, [tokenChunks, searchQuery]);

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

    const frequencyMap = new Map<number, { id: number; text: string; count: number }>();
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

  const handleCopyTokenIds = async () => {
    if (tokenChunks.length === 0) return;
    const ids = tokenChunks.map((t) => t.id);
    await navigator.clipboard.writeText(JSON.stringify(ids));
    setCopiedIds(true);
    setTimeout(() => setCopiedIds(false), 2000);
  };

  return (
    <TooltipProvider delayDuration={50}>
      <div className="flex flex-col h-[580px] rounded-xl border border-surface-border bg-surface-default overflow-hidden transition-all duration-200 hover:border-surface-borderHover">
        {/* Pane Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-surface-border bg-surface-subtle/70 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
              BPE Token Inspector
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-elevated text-emerald-400 border border-emerald-500/20 font-mono tabular-nums font-medium">
              <NumberTicker value={tokenCount} /> {tokenCount === 1 ? "Token" : "Tokens"}
            </span>
          </div>

          {/* View Mode Segmented Controls */}
          <div className="flex items-center p-0.5 rounded-lg bg-surface-elevated border border-surface-border text-xs font-mono">
            <button
              onClick={() => setViewMode("chips")}
              className={`px-2 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                viewMode === "chips"
                  ? "bg-surface-default text-zinc-100 border border-surface-borderHover font-medium shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="BPE Color Boundary Chips"
              aria-label="View BPE Color Boundary Chips"
            >
              <Layers className="w-3 h-3 text-emerald-400" aria-hidden="true" />
              <span className="hidden sm:inline">Chips</span>
            </button>

            <button
              onClick={() => setViewMode("ids")}
              className={`px-2 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                viewMode === "ids"
                  ? "bg-surface-default text-zinc-100 border border-surface-borderHover font-medium shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Token ID integer stream"
              aria-label="View Token ID Integer Stream"
            >
              <Hash className="w-3 h-3 text-cyan-400" aria-hidden="true" />
              <span className="hidden sm:inline">IDs</span>
            </button>

            <button
              onClick={() => setViewMode("heatmap")}
              className={`px-2 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                viewMode === "heatmap"
                  ? "bg-surface-default text-zinc-100 border border-surface-borderHover font-medium shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Byte Density Heatmap"
              aria-label="View Byte Density Heatmap"
            >
              <Flame className="w-3 h-3 text-amber-400" aria-hidden="true" />
              <span className="hidden sm:inline">Bytes</span>
            </button>

            <button
              onClick={() => setViewMode("analytics")}
              className={`px-2 py-1 rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                viewMode === "analytics"
                  ? "bg-surface-default text-zinc-100 border border-surface-borderHover font-medium shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Vocabulary Analytics"
              aria-label="View Vocabulary Analytics"
            >
              <BarChart3 className="w-3 h-3 text-violet-400" aria-hidden="true" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
          </div>
        </div>

        {/* Secondary Filter & Action Sub-Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-surface-subtle/40 border-b border-surface-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search token / ID / hex…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter tokens by text or ID"
              className="h-6 w-36 sm:w-48 pl-7 pr-2 rounded-md bg-surface-elevated border border-surface-border text-[11px] font-mono text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyTokenIds}
            disabled={tokenChunks.length === 0}
            className="h-6 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated"
            aria-label="Copy token IDs as JSON"
          >
            {copiedIds ? (
              <Check className="w-3 h-3 text-emerald-400 mr-1" aria-hidden="true" />
            ) : (
              <Copy className="w-3 h-3 mr-1" aria-hidden="true" />
            )}
            <span className="text-[11px]">
              {copiedIds ? "Copied IDs" : "Copy IDs"}
            </span>
          </Button>
        </div>

        {/* Token Visualizer Body */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
          {tokenChunks.length === 0 ? (
            /* Clean Empty State Card */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mb-3 text-zinc-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                <FileCode2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
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
            <div className="flex flex-col gap-4">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-subtle border border-surface-border flex flex-col">
                  <span className="text-[10px] uppercase text-zinc-400 font-mono">
                    Token Efficiency
                  </span>
                  <span className="text-lg font-bold text-zinc-100 tabular-nums">
                    <NumberTicker value={analytics.charsPerToken} decimalPlaces={2} />{" "}
                    <span className="text-xs font-normal text-zinc-400">chars/tok</span>
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
                    <span className="text-xs font-normal text-zinc-400">bytes</span>
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
                        <span className="text-[10px] text-zinc-400 tabular-nums">#{item.id}</span>
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
                      "{analytics.longestToken.text}" ({analytics.longestToken.text.length} chars)
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Token Stream: Chips / IDs / Heatmap */
            <div className="flex flex-wrap gap-1 content-start select-text">
              {filteredTokens.map((token) => {
                const colorIndex = token.index % 5;
                const isSelected = selectedTokenIndex === token.index;

                // Visual label for whitespace / newlines
                const displayText = token.text
                  .replace(/ /g, "␣")
                  .replace(/\n/g, "↵\n")
                  .replace(/\t/g, "⇥");

                // Determine styling based on viewMode
                let modeClasses = `bpe-token-${colorIndex}`;
                let modeLabel = displayText || "<empty>";

                if (viewMode === "ids") {
                  modeClasses =
                    "bg-surface-elevated border border-surface-border text-zinc-300 hover:border-zinc-400";
                  modeLabel = `#${token.id}`;
                } else if (viewMode === "heatmap") {
                  // Differentiate UTF-8 byte sizes with clean contrast
                  if (token.byteLength === 1) {
                    modeClasses =
                      "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300";
                  } else if (token.byteLength === 2) {
                    modeClasses =
                      "bg-cyan-500/10 border border-cyan-500/25 text-cyan-300";
                  } else if (token.byteLength === 3) {
                    modeClasses =
                      "bg-amber-500/10 border border-amber-500/25 text-amber-300";
                  } else {
                    modeClasses =
                      "bg-rose-500/15 border border-rose-500/30 text-rose-300";
                  }
                }

                return (
                  <Tooltip key={token.index}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setSelectedTokenIndex(token.index)}
                        className={`${modeClasses} inline-block px-1.5 py-0.5 rounded cursor-pointer transition-all duration-150 font-mono text-[12px] hover:scale-105 active:scale-95 ${
                          isSelected
                            ? "ring-2 ring-zinc-200 font-bold"
                            : ""
                        }`}
                      >
                        {modeLabel}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="p-3 bg-surface-default border-surface-borderHover shadow-elevated rounded-xl min-w-[210px] glass-edge"
                    >
                      <div className="flex flex-col gap-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-surface-border pb-1.5">
                          <span className="text-[10px] uppercase text-zinc-400">
                            Token ID
                          </span>
                          <span className="text-xs font-bold text-emerald-400 tabular-nums">
                            #{token.id}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400">
                            Raw Text:
                          </span>
                          <span className="text-[11px] font-semibold text-zinc-100 bg-surface-subtle px-1.5 py-0.5 rounded border border-surface-border">
                            {displayText || "<empty>"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400">
                            Position:
                          </span>
                          <span className="text-[11px] text-zinc-200 tabular-nums">
                            Index {token.index}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400">
                            Byte Length:
                          </span>
                          <span className="text-[11px] text-zinc-200 tabular-nums">
                            {token.byteLength} {token.byteLength === 1 ? "byte" : "bytes"}
                          </span>
                        </div>

                        <div className="flex flex-col gap-0.5 pt-1 border-t border-surface-border">
                          <span className="text-[10px] text-zinc-500 uppercase">
                            Hex Encoding:
                          </span>
                          <span className="text-[10px] text-zinc-300 bg-surface-subtle px-1.5 py-0.5 rounded border border-surface-border">
                            {token.hex || "0x00"}
                          </span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* Pane Footer: Performance Telemetry */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle/70 border-t border-surface-border text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <span className="text-zinc-500 text-[10px] uppercase tracking-wider">
              Latency:
            </span>
            <span className="text-zinc-200 font-semibold text-[11px] tabular-nums">
              {isProcessing ? (
                <ShinyText shineColor="emerald">Computing…</ShinyText>
              ) : (
                `${executionTimeMs} ms`
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <ShinyText shineColor="white" className="text-zinc-300 text-[10px]">
              BPE Engine Active
            </ShinyText>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

