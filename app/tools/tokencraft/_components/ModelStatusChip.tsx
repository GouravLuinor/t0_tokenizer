"use client";

import React from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { getCurrentModel, encodingDisclosure } from "../_lib/modelRegistry";
import { Cpu } from "lucide-react";

export const ModelStatusChip = React.memo(function ModelStatusChip() {
  const selectedModel = useTokenCraftStore((s) => s.selectedModel);
  const modelsRegistry = useTokenCraftStore((s) => s.modelsRegistry);
  const currentModel = getCurrentModel(modelsRegistry, selectedModel);
  const disclosure = encodingDisclosure(currentModel.family);

  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-lg border border-surface-border bg-surface-subtle/60 px-3 py-1.5"
      aria-label={`Active tokenizer model: ${currentModel.name}`}
    >
      <Cpu className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden="true" />
      <span className="max-w-[10rem] truncate font-mono text-xs text-zinc-200 sm:max-w-[16rem]">
        {currentModel.name}
      </span>
      <span className="shrink-0 rounded border border-surface-border bg-surface-elevated px-1.5 py-0.5 font-mono text-[10px] text-zinc-300">
        {currentModel.badgeText}
      </span>
      {disclosure && (
        <span
          className="hidden shrink-0 rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-400 lg:inline"
          title="Counts use an o200k approximation of this model's native tokenizer"
        >
          {disclosure}
        </span>
      )}
    </div>
  );
});
