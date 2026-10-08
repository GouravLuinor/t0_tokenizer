"use client";

import React, { useEffect } from "react";
import { useTokenizer } from "../_hooks/useTokenizer";
import { useGlobalShortcuts } from "../_hooks/useGlobalShortcuts";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { TopToolbar } from "./TopToolbar";
import { RawEditorPane } from "./RawEditorPane";
import { TokenInspectorPane } from "./TokenInspectorPane";
import { ContextBudgetBar } from "./ContextBudgetBar";
import { PromptDiffDialog } from "./PromptDiffDialog";
import { CommandPalette } from "./CommandPalette";
import { useVisitorSession } from "../_hooks/useVisitorSession";
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

      <div className="relative flex flex-col gap-8 md:gap-10">
        <TopToolbar />

        {/* Primary Split-Pane Workspace: Left (Editor) vs Right (Token Inspector) */}
        <section
          id="workspace"
          aria-label="Interactive Workspace"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <RawEditorPane />
          <TokenInspectorPane />
        </section>

        {/* Context Window Budget — the component owns its own labeled region */}
        <ContextBudgetBar />
      </div>

      {/* Global Modals & Dialogs */}
      <PromptDiffDialog />
      <CommandPalette />
      <SignInModal />
    </>
  );
}
