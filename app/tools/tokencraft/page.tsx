"use client";

import React, { useEffect } from "react";
import { useTokenizer } from "./_hooks/useTokenizer";
import { useGlobalShortcuts } from "./_hooks/useGlobalShortcuts";
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
  // Mount the Web Worker tokenizer hook + global keyboard shortcuts
  useTokenizer();
  useGlobalShortcuts();

  const syncLivePrices = useTokenCraftStore((s) => s.syncLivePrices);

  useEffect(() => {
    // Restore persisted workspace (text, model, view prefs) after mount —
    // the tokenizer hook then re-derives token data from the restored text
    void useTokenCraftStore.persist.rehydrate();
    syncLivePrices();
  }, [syncLivePrices]);

  return (
    <div className="h-dvh bg-background text-zinc-100 flex flex-col relative overflow-hidden selection:bg-sky-500/20">
      {/* Skip link — first tab stop for keyboard users */}
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:px-3 focus:py-1.5 focus:rounded-lg focus:bg-zinc-100 focus:text-zinc-950 focus:text-xs focus:font-mono focus:shadow-elevated"
      >
        Skip to workspace
      </a>

      {/* Ambient glow — full bleed */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(56,189,248,0.06),transparent)]" />

      <main className="relative z-10 flex-1 min-h-0 w-full p-4 md:p-6 lg:p-8 xl:px-10 flex flex-col gap-6 overflow-y-auto">
        {/* Top Control Toolbar */}
        <TopToolbar />

        {/* Primary Split-Pane Workspace: Left (Editor) vs Right (Token Inspector) — absorbs all spare viewport height */}
        <section
          id="workspace"
          aria-label="Interactive Workspace"
          className="flex-1 min-h-[440px] grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] gap-6"
        >
          <RawEditorPane />
          <TokenInspectorPane />
        </section>

        {/* Secondary Analytics Row: Context Safety Gauge + Multi-Model Cost Matrix */}
        <section aria-label="Context and Cost Analytics" className="shrink-0 grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)] lg:h-[360px] lg:min-h-0 gap-6">
          <div className="lg:col-span-1 lg:min-h-0">
            <ContextSafetyGauge />
          </div>
          <div className="lg:col-span-2 lg:min-h-0">
            <MultiModelCostMatrix />
          </div>
        </section>

        {/* Studio-Grade Footer */}
        <footer className="shrink-0 flex flex-wrap items-center justify-between gap-4 py-4 px-1 border-t border-surface-border text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
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

