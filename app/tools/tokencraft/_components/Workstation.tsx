"use client";

import { useEffect } from "react";
import { useTokenizer } from "../_hooks/useTokenizer";
import { useGlobalShortcuts } from "../_hooks/useGlobalShortcuts";
import { useMinifySavings } from "../_hooks/useMinifySavings";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { PromptPane } from "./prompt/PromptPane";
import { AnswerPanel } from "./answer/AnswerPanel";
import { MobileTally } from "./answer/MobileTally";
import { PromptDiffDialog } from "./PromptDiffDialog";
import { CommandPalette } from "./CommandPalette";
import { SignInModal } from "./auth/SignInModal";

/** The first viewport: the prompt on the left, the answer on the right. */
export function Workstation() {
  useTokenizer();
  useGlobalShortcuts();
  useMinifySavings();

  const syncLivePrices = useTokenCraftStore((s) => s.syncLivePrices);

  useEffect(() => {
    // Restore the saved workspace after mount; the tokenizer then re-derives
    // token data from the restored text
    void Promise.resolve(useTokenCraftStore.persist.rehydrate()).then(() => {
      // Model pages link here with ?model=<key>; it wins over the saved pick
      const wanted = new URLSearchParams(window.location.search).get("model");
      const state = useTokenCraftStore.getState();
      if (wanted && state.modelsRegistry[wanted]) state.setSelectedModel(wanted);
    });
    void syncLivePrices();
  }, [syncLivePrices]);

  return (
    <>
      <div
        id="workspace"
        className="grid scroll-mt-16 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(360px,1fr)] xl:gap-8"
      >
        <div id="prompt-pane" className="flex min-h-[520px] min-w-0 flex-col lg:min-h-[640px]">
          <PromptPane />
        </div>
        <AnswerPanel />
      </div>

      <MobileTally />
      <PromptDiffDialog />
      <CommandPalette />
      <SignInModal />
    </>
  );
}
