"use client";

import React, { useEffect } from "react";
import { useTokenizer } from "./_hooks/useTokenizer";
import { useTokenCraftStore } from "./_store/useTokenCraftStore";
import { TopToolbar } from "./_components/TopToolbar";
import { RawEditorPane } from "./_components/RawEditorPane";
import { TokenInspectorPane } from "./_components/TokenInspectorPane";
import { ContextSafetyGauge } from "./_components/ContextSafetyGauge";
import { MultiModelCostMatrix } from "./_components/MultiModelCostMatrix";
import { PromptDiffDialog } from "./_components/PromptDiffDialog";
import { CommandPalette } from "./_components/CommandPalette";
import { Keycap } from "@/components/ui/keycap";
import { ShinyText } from "@/components/ui/shiny-text";

export default function TokenCraftPage() {
  // Mount the Web Worker tokenizer hook
  useTokenizer();

  const { syncLivePrices } = useTokenCraftStore();

  useEffect(() => {
    syncLivePrices();
  }, [syncLivePrices]);

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col relative selection:bg-sky-500/20">
      {/* Subtle top radial gradient ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(56,189,248,0.06),transparent)]" />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        {/* Top Control Toolbar */}
        <TopToolbar />

        {/* Primary Split-Pane Workspace: Left (Editor) vs Right (Token Inspector) */}
        <section aria-label="Interactive Workspace" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RawEditorPane />
          <TokenInspectorPane />
        </section>

        {/* Secondary Analytics Row: Context Safety Gauge + Multi-Model Cost Matrix */}
        <section aria-label="Context and Cost Analytics" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ContextSafetyGauge />
          </div>
          <div className="lg:col-span-2">
            <MultiModelCostMatrix />
          </div>
        </section>

        {/* Studio-Grade Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-4 py-4 px-1 border-t border-surface-border text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" aria-hidden="true" />
            <span className="text-zinc-300 font-medium">TokenCraft Studio</span>
            <span className="text-zinc-500">•</span>
            <span className="text-zinc-400">BPE Tokenizer & Multi-Model Cost Engine</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <div className="flex items-center gap-1">
              <Keycap size="xs">⌘</Keycap>
              <Keycap size="xs">K</Keycap>
              <span className="ml-1 text-zinc-400">Commands</span>
            </div>
            <span aria-hidden="true" className="text-zinc-600">•</span>
            <ShinyText shineColor="cyan" className="text-[11px] text-sky-400 font-medium">
              100% Client-Side Local Compute
            </ShinyText>
            <span aria-hidden="true" className="text-zinc-600">•</span>
            <span className="text-zinc-400">Zero Cloud Storage</span>
          </div>
        </footer>
      </main>

      {/* Global Modals & Dialogs */}
      <PromptDiffDialog />
      <CommandPalette />
    </div>
  );
}

