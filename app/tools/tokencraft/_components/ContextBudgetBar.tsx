"use client";

import React from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { getCurrentModel, encodingDisclosure } from "../_lib/modelRegistry";
import { NumberTicker } from "@/components/ui/number-ticker";
import { formatNumber } from "@/lib/utils";

type BudgetStatus = "safe" | "warning" | "danger";

const STATUS_STYLES: Record<
  BudgetStatus,
  { bar: string; text: string; label: string }
> = {
  safe: {
    bar: "bg-emerald-400/80",
    text: "text-emerald-300/90",
    label: "Safe range",
  },
  warning: {
    bar: "bg-amber-400/80",
    text: "text-amber-300/90",
    label: "Approaching limit",
  },
  danger: {
    bar: "bg-rose-400/80",
    text: "text-rose-300/90",
    label: "Critical capacity",
  },
};

export const ContextBudgetBar = React.memo(function ContextBudgetBar() {
  const tokenCount = useTokenCraftStore((s) => s.tokenCount);
  const selectedModel = useTokenCraftStore((s) => s.selectedModel);
  const modelsRegistry = useTokenCraftStore((s) => s.modelsRegistry);
  const currentModel = getCurrentModel(modelsRegistry, selectedModel);
  const maxTokens = currentModel.contextWindow;

  const usagePercent = Math.min(100, (tokenCount / maxTokens) * 100);
  const remainingTokens = Math.max(0, maxTokens - tokenCount);
  const disclosure = encodingDisclosure(currentModel.family);

  const status: BudgetStatus =
    usagePercent > 95 ? "danger" : usagePercent > 80 ? "warning" : "safe";
  const styles = STATUS_STYLES[status];

  const statusMessage =
    status === "danger"
      ? "Prompt exceeds the safe margin. High risk of context truncation."
      : status === "warning"
        ? "Approaching the context ceiling. Consider minifying your prompt."
        : `${formatNumber(remainingTokens)} tokens remaining before this model's limit.`;

  return (
    <div
      role="region"
      aria-label="Context Window Safety Gauge"
      className="rounded-xl border border-white/10 bg-surface-default px-4 py-3.5 sm:px-5"
    >
      <meter
        min={0}
        max={maxTokens}
        value={tokenCount}
        high={maxTokens * 0.8}
        optimum={maxTokens * 0.2}
        className="sr-only"
      >
        {usagePercent.toFixed(1)}% of context window used
      </meter>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            Context window
          </span>
          <span
            className="truncate font-mono text-xs text-zinc-300"
            title={currentModel.name}
          >
            {currentModel.name}
          </span>
          {disclosure && (
            <span
              className="shrink-0 rounded border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-400"
              title="Counts use an o200k approximation of this model's native tokenizer"
            >
              {disclosure}
            </span>
          )}
        </div>

        <p className="font-mono text-xs tabular-nums text-zinc-400">
          <span className="text-zinc-100">
            <NumberTicker value={tokenCount} />
          </span>
          {" / "}
          {formatNumber(maxTokens)} tokens
          <span className="mx-1.5 text-zinc-600" aria-hidden="true">
            •
          </span>
          <span className={styles.text}>
            <NumberTicker
              value={usagePercent}
              decimalPlaces={usagePercent < 0.1 ? 2 : 1}
              suffix="%"
            />
          </span>
        </p>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${styles.bar}`}
          style={{
            width: `${usagePercent}%`,
            minWidth: tokenCount > 0 ? "3px" : undefined,
          }}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className={`font-mono text-[11px] ${styles.text}`}>{statusMessage}</p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          {styles.label}
        </p>
      </div>
    </div>
  );
});
