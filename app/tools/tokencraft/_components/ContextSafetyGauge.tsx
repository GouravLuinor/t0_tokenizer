"use client";

import React from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { getCurrentModel, encodingDisclosure } from "../_lib/modelRegistry";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Gauge, AlertTriangle, ShieldCheck, AlertCircle } from "lucide-react";
import { formatNumber } from "@/lib/utils";

export const ContextSafetyGauge = React.memo(function ContextSafetyGauge() {
  const tokenCount = useTokenCraftStore((s) => s.tokenCount);
  const selectedModel = useTokenCraftStore((s) => s.selectedModel);
  const modelsRegistry = useTokenCraftStore((s) => s.modelsRegistry);
  const currentModel = getCurrentModel(modelsRegistry, selectedModel);
  const maxTokens = currentModel.contextWindow;

  const usagePercent = Math.min(100, (tokenCount / maxTokens) * 100);
  const remainingTokens = Math.max(0, maxTokens - tokenCount);

  // Status computation
  let status: "safe" | "warning" | "danger" = "safe";
  let statusColor = "#10B981"; // Emerald
  let statusBadgeText = "Safe Range";
  let statusBadgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  if (usagePercent > 95) {
    status = "danger";
    statusColor = "#F43F5E"; // Rose
    statusBadgeText = "Critical Capacity";
    statusBadgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/20";
  } else if (usagePercent > 80) {
    status = "warning";
    statusColor = "#F59E0B"; // Amber
    statusBadgeText = "Warning (>80%)";
    statusBadgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }

  // Semi-circle SVG arc calculations
  const radius = 70;
  const strokeWidth = 8;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (usagePercent / 100) * circumference;

  return (
    <div
      role="region"
      aria-label="Context Window Safety Gauge"
      className="flex flex-col p-5 rounded-xl border border-surface-border bg-surface-default shadow-sm transition-all duration-200 hover:border-surface-borderHover lg:h-full lg:min-h-0 overflow-hidden"
    >
      {/* Accessible native meter fallback for assistive tech */}
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

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
            Context Window Safety
          </span>
        </div>
        <span
          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${statusBadgeBg}`}
        >
          {statusBadgeText}
        </span>
      </div>

      {/* Main Gauge Graphic & Center Value */}
      <div className="flex flex-col items-center justify-center my-2 relative">
        <svg
          width="200"
          height="110"
          viewBox="0 0 200 110"
          className="overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="70%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor={statusColor} />
            </linearGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 100 A 70 70 0 0 1 180 100"
            fill="none"
            stroke="#202B46"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Colored Arc */}
          <path
            d="M 20 100 A 70 70 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute top-12 flex flex-col items-center pointer-events-none">
          <span className="text-2xl font-bold font-mono tracking-tight text-zinc-100 tabular-nums">
            <NumberTicker value={usagePercent} decimalPlaces={1} suffix="%" />
          </span>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            Utilized
          </span>
        </div>
      </div>

      {/* Model Name Subtext - Clean, Restrained, No Overflow */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400 -mt-1 mb-1">
        <span className="text-zinc-500">Model:</span>
        <span className="text-zinc-300 font-medium truncate max-w-[220px]" title={currentModel.name}>
          {currentModel.name}
        </span>
        {encodingDisclosure(currentModel.family) && (
          <span
            className="text-[9px] px-1 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0"
            title="Counts use an o200k approximation of this model's native tokenizer"
          >
            {encodingDisclosure(currentModel.family)}
          </span>
        )}
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-surface-border font-mono text-xs">
        <div className="flex flex-col p-2.5 rounded-lg bg-surface-subtle/70 border border-surface-border">
          <span className="text-[10px] text-zinc-400 uppercase">
            Prompt Tokens
          </span>
          <span className="text-sm font-semibold text-emerald-400 tabular-nums">
            <NumberTicker value={tokenCount} />
          </span>
        </div>

        <div className="flex flex-col p-2.5 rounded-lg bg-surface-subtle/70 border border-surface-border">
          <span className="text-[10px] text-zinc-400 uppercase">
            Window Limit
          </span>
          <span className="text-sm font-semibold text-zinc-200 tabular-nums">
            {formatNumber(maxTokens)}
          </span>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="flex items-center gap-2 mt-3 pt-2 text-[11px] font-mono text-zinc-400">
        {status === "safe" ? (
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
        ) : status === "warning" ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
        ) : (
          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">
          {status === "safe"
            ? `${formatNumber(remainingTokens)} tokens remaining before limit.`
            : status === "warning"
            ? "Approaching context ceiling. Consider minifying prompt."
            : "Prompt exceeds safe margin! High risk of context truncation."}
        </span>
      </div>
    </div>
  );
});

