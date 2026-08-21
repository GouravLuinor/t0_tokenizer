"use client";

import React, { useState } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  Minimize2,
  Check,
  Copy,
  Sliders,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { copyText } from "@/lib/clipboard";

export function PromptDiffDialog() {
  const diffModalOpen = useTokenCraftStore((s) => s.diffModalOpen);
  const setDiffModalOpen = useTokenCraftStore((s) => s.setDiffModalOpen);
  const minifiedPreview = useTokenCraftStore((s) => s.minifiedPreview);
  const minifyOptions = useTokenCraftStore((s) => s.minifyOptions);
  const setMinifyOptions = useTokenCraftStore((s) => s.setMinifyOptions);
  const applyMinification = useTokenCraftStore((s) => s.applyMinification);
  const rawText = useTokenCraftStore((s) => s.rawText);

  const [copied, setCopied] = useState(false);

  if (!minifiedPreview) return null;

  const handleCopyMinified = async () => {
    if (!minifiedPreview.minifiedText) return;
    const ok = await copyText(minifiedPreview.minifiedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={diffModalOpen} onOpenChange={setDiffModalOpen}>
      <DialogContent className="w-[95vw] max-w-[1500px] max-h-[90vh] flex flex-col p-6 bg-surface-default border border-surface-border shadow-elevated rounded-2xl overflow-hidden glass-edge">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-surface-elevated text-zinc-200 border border-surface-border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                <Minimize2 className="w-4 h-4 text-zinc-300" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold text-zinc-100">
                  Prompt Minification & AST Diff Inspector
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Review structural optimizations, eliminate non-essential token
                  overhead, and preview side-by-side AST cleaning.
                </DialogDescription>
              </div>
            </div>

            {/* Savings Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="emerald" className="text-xs px-2.5 py-1 font-mono tabular-nums">
                <TrendingDown className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Save ~<NumberTicker value={minifiedPreview.charSavingsPercent} />% tokens
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Granular Optimization Options Bar */}
        <div className="p-3 rounded-xl bg-surface-subtle/80 border border-surface-border my-2">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-zinc-400">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
            <span className="uppercase tracking-wider text-[10px] text-zinc-300 font-medium">
              Active Optimization Rules:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-300 transition-colors">
              <input
                type="checkbox"
                checked={minifyOptions.stripComments}
                onChange={(e) =>
                  setMinifyOptions({ stripComments: e.target.checked })
                }
                className="rounded bg-surface-default border-surface-border accent-emerald-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              />
              <span>Strip Comments</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-300 transition-colors">
              <input
                type="checkbox"
                checked={minifyOptions.collapseWhitespace}
                onChange={(e) =>
                  setMinifyOptions({ collapseWhitespace: e.target.checked })
                }
                className="rounded bg-surface-default border-surface-border accent-emerald-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              />
              <span>Collapse Whitespace</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-300 transition-colors">
              <input
                type="checkbox"
                checked={minifyOptions.compactTables}
                onChange={(e) =>
                  setMinifyOptions({ compactTables: e.target.checked })
                }
                className="rounded bg-surface-default border-surface-border accent-emerald-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              />
              <span>Compact Tables</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-surface-elevated text-zinc-300 transition-colors">
              <input
                type="checkbox"
                checked={minifyOptions.minifyJson}
                onChange={(e) =>
                  setMinifyOptions({ minifyJson: e.target.checked })
                }
                className="rounded bg-surface-default border-surface-border accent-emerald-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
              />
              <span>Minify JSON</span>
            </label>
          </div>
        </div>

        {/* Side-by-Side Diff Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[260px] max-h-[360px] overflow-hidden">
          {/* Left: Original */}
          <div className="flex flex-col rounded-xl border border-surface-border bg-surface-subtle/70 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border bg-surface-default text-xs font-mono text-zinc-400">
              <span className="tabular-nums">Original (<NumberTicker value={minifiedPreview.originalChars} /> chars)</span>
              <span className="text-[10px] text-zinc-400 tabular-nums">
                {rawText.split("\n").length} lines
              </span>
            </div>
            <pre className="flex-1 p-3 text-xs font-mono text-zinc-300 overflow-y-auto whitespace-pre-wrap selection:bg-zinc-800">
              {rawText}
            </pre>
          </div>

          {/* Right: Minified Preview */}
          <div className="flex flex-col rounded-xl border border-surface-border bg-surface-subtle/70 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-surface-border bg-surface-elevated text-xs font-mono text-zinc-200">
              <span className="flex items-center gap-1.5 font-semibold tabular-nums text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                Optimized (<NumberTicker value={minifiedPreview.minifiedChars} /> chars)
              </span>
              <span className="text-[10px] text-emerald-400 tabular-nums font-medium">
                -<NumberTicker value={minifiedPreview.charSavings} /> chars (-<NumberTicker value={minifiedPreview.charSavingsPercent} />%)
              </span>
            </div>
            <pre className="flex-1 p-3 text-xs font-mono text-zinc-200 overflow-y-auto whitespace-pre-wrap selection:bg-zinc-800">
              {minifiedPreview.minifiedText}
            </pre>
          </div>
        </div>

        {/* Dialog Actions Footer */}
        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            variant="ghost"
            onClick={() => setDiffModalOpen(false)}
            className="text-xs text-zinc-400 hover:text-zinc-200"
          >
            Cancel
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyMinified}
            className="text-xs gap-1.5 text-zinc-200 bg-surface-subtle border-surface-border hover:bg-surface-elevated font-mono"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{copied ? "Copied" : "Copy Minified"}</span>
          </Button>

          <Button
            variant="default"
            onClick={applyMinification}
            className="text-xs gap-1.5 font-semibold bg-zinc-100 text-zinc-950 hover:bg-white font-mono shadow-sm transition-transform active:scale-[0.97]"
          >
            <Check className="w-4 h-4 text-zinc-950" aria-hidden="true" />
            <span>Apply Optimization</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


