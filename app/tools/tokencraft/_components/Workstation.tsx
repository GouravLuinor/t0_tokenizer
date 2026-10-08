"use client";

import React, { useEffect } from "react";
import { useTokenizer } from "../_hooks/useTokenizer";
import { useGlobalShortcuts } from "../_hooks/useGlobalShortcuts";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { useVisitorSession } from "../_hooks/useVisitorSession";
import { RawEditorPane } from "./RawEditorPane";
import { TokenInspectorPane } from "./TokenInspectorPane";
import { WorkstationHeader } from "./WorkstationHeader";
import { PromptDiffDialog } from "./PromptDiffDialog";
import { CommandPalette } from "./CommandPalette";
import { SignInModal } from "./auth/SignInModal";

export function Workstation() {
  // Mount the Web Worker tokenizer hook + global keyboard shortcuts
  useTokenizer();
  useGlobalShortcuts();
  useVisitorSession();

  const syncLivePrices = useTokenCraftStore((s) => s.syncLivePrices);

  useEffect(() => {
    // Restore persisted workspace (text, model, view prefs) after mount —
    // the tokenizer hook then re-derives token data from the restored text
    void useTokenCraftStore.persist.rehydrate();
    syncLivePrices();
  }, [syncLivePrices]);

  return (
    <>
      {/* Ambient glow — decorative, scoped to the hero */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(56,189,248,0.06),transparent)]"
        aria-hidden="true"
      />

      {/* ONE cohesive card wrapping the full workstation */}
      <div
        id="workspace"
        className="relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117]"
      >
        {/* Header: mode tabs left, model + presets + minify right */}
        <WorkstationHeader />

        {/* Two-pane body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:min-h-[640px]">
          <div className="min-w-0 border-b border-zinc-800 lg:border-b-0 lg:border-r">
            <RawEditorPane />
          </div>
          <TokenInspectorPane />
        </div>
      </div>

      {/* Global Modals & Dialogs */}
      <PromptDiffDialog />
      <CommandPalette />
      <SignInModal />
    </>
  );
}
