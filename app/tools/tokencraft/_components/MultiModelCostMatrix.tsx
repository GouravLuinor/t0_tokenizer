"use client";

import React, { useState } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign,
  TrendingDown,
  Calculator,
  Download,
  Check,
  FileSpreadsheet,
  FileJson,
  FileText,
  CornerDownRight,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function MultiModelCostMatrix() {
  const {
    tokenCount,
    batchVolume,
    setBatchVolume,
    outputMultiplier,
    setOutputMultiplier,
    selectedModel,
    setSelectedModel,
    modelsRegistry,
    isSyncingPrices,
    lastSyncedAt,
    syncLivePrices,
  } = useTokenCraftStore();

  const [copiedReport, setCopiedReport] = useState(false);
  const [providerFilter, setProviderFilter] = useState<string>("All");

  const volumeSteps = [1000, 5000, 10000, 25000, 50000, 100000];
  const outputRatioSteps = [
    { label: "Input Only (0x)", value: 0 },
    { label: "Brief (0.5x)", value: 0.5 },
    { label: "Balanced (1.0x)", value: 1.0 },
    { label: "Detailed (2.0x)", value: 2.0 },
    { label: "Deep (4.0x)", value: 4.0 },
  ];

  const estimatedOutputTokens = Math.round(tokenCount * outputMultiplier);

  const allModels = Object.entries(modelsRegistry);
  const providers = ["All", ...Array.from(new Set(allModels.map(([, m]) => m.provider)))];

  const filteredModels =
    providerFilter === "All"
      ? allModels
      : allModels.filter(([, m]) => m.provider === providerFilter);

  // Export handlers
  const handleCopyMarkdown = async () => {
    let md = `### NorAI TokenCraft Cost & Multi-Model Analysis Report (2026)\n\n`;
    md += `* **Prompt Input Tokens:** ${formatNumber(tokenCount)}\n`;
    md += `* **Estimated Output Tokens (${outputMultiplier}x):** ${formatNumber(estimatedOutputTokens)}\n`;
    md += `* **Batch Executions:** ${formatNumber(batchVolume)}\n\n`;
    md += `| Model | Provider | Standard Input / 1M | Cached Input / 1M | Output / 1M | Single Run Total | Batch Total (${formatNumber(batchVolume)}) | Potential Savings |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    filteredModels.forEach(([, m]) => {
      const singleInput = (tokenCount * m.inputCostPer1M) / 1000000;
      const singleCached = (tokenCount * m.cachedInputCostPer1M) / 1000000;
      const singleOutput = (estimatedOutputTokens * m.outputCostPer1M) / 1000000;

      const singleTotal = singleInput + singleOutput;
      const singleCachedTotal = singleCached + singleOutput;
      const batchTotal = singleTotal * batchVolume;
      const batchCachedTotal = singleCachedTotal * batchVolume;
      const savings = Math.max(0, batchTotal - batchCachedTotal);

      md += `| **${m.name}** | ${m.provider} | $${m.inputCostPer1M.toFixed(3)} | $${m.cachedInputCostPer1M.toFixed(3)} | $${m.outputCostPer1M.toFixed(3)} | ${formatCurrency(singleTotal, 5)} | ${formatCurrency(batchTotal, 2)} | ${savings > 0 ? `Save ${formatCurrency(savings, 2)}` : "$0.00"} |\n`;
    });

    await navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadJSON = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      promptTokens: tokenCount,
      estimatedOutputTokens,
      batchVolume,
      models: filteredModels.map(([, m]) => {
        const singleInput = (tokenCount * m.inputCostPer1M) / 1000000;
        const singleCached = (tokenCount * m.cachedInputCostPer1M) / 1000000;
        const singleOutput = (estimatedOutputTokens * m.outputCostPer1M) / 1000000;
        return {
          modelId: m.id,
          name: m.name,
          provider: m.provider,
          standardInputCost1M: m.inputCostPer1M,
          cachedInputCost1M: m.cachedInputCostPer1M,
          outputCost1M: m.outputCostPer1M,
          singleRunTotalUSD: singleInput + singleOutput,
          singleRunCachedUSD: singleCached + singleOutput,
          batchTotalUSD: (singleInput + singleOutput) * batchVolume,
          batchCachedUSD: (singleCached + singleOutput) * batchVolume,
        };
      }),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokencraft-cost-report-${Date.now()}.json`;
    a.click();
  };

  const handleDownloadCSV = () => {
    let csv = `Model,Provider,Family,Standard Input 1M,Cached Input 1M,Output 1M,Single Run Total USD,Batch Total (${batchVolume}) USD,Batch Cached USD,Potential Savings USD\n`;
    filteredModels.forEach(([, m]) => {
      const singleInput = (tokenCount * m.inputCostPer1M) / 1000000;
      const singleCached = (tokenCount * m.cachedInputCostPer1M) / 1000000;
      const singleOutput = (estimatedOutputTokens * m.outputCostPer1M) / 1000000;
      const singleTotal = singleInput + singleOutput;
      const batchTotal = singleTotal * batchVolume;
      const batchCached = (singleCached + singleOutput) * batchVolume;
      const savings = Math.max(0, batchTotal - batchCached);

      csv += `"${m.name}","${m.provider}","${m.family}",${m.inputCostPer1M},${m.cachedInputCostPer1M},${m.outputCostPer1M},${singleTotal.toFixed(6)},${batchTotal.toFixed(4)},${batchCached.toFixed(4)},${savings.toFixed(4)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tokencraft-pricing-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div
      role="region"
      aria-label="Multi-Model Cost Projection and Pricing Matrix"
      className="flex flex-col p-5 rounded-xl border border-surface-border bg-surface-default shadow-sm transition-all duration-200 hover:border-surface-borderHover"
    >
      {/* Matrix Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
            Multi-Model Cost & Cache Matrix
          </span>
        </div>

        {/* Action Buttons: Live Rates Sync & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Sync Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncLivePrices()}
            disabled={isSyncingPrices}
            className="h-7 px-2.5 text-xs text-zinc-300 hover:text-white bg-surface-subtle border-surface-border hover:bg-surface-elevated"
            title="Fetch real-time model pricing from OpenRouter public API"
            aria-label="Sync real-time model rates"
          >
            <RefreshCw
              className={`w-3 h-3 mr-1.5 text-sky-400 ${isSyncingPrices ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span className="font-mono text-[11px]">
              {isSyncingPrices
                ? "Syncing…"
                : lastSyncedAt
                ? `Live (${lastSyncedAt})`
                : "Sync Live Rates"}
            </span>
          </Button>

          {/* Export Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs text-zinc-300 hover:text-white bg-surface-subtle border-surface-border hover:bg-surface-elevated"
                aria-label="Open export report menu"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-zinc-400" aria-hidden="true" />
                <span className="font-mono">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-surface-default border-surface-border shadow-elevated">
              <DropdownMenuLabel className="text-xs font-mono text-zinc-400">
                Export Projections
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-surface-border" />
              <DropdownMenuItem
                onClick={handleCopyMarkdown}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-surface-elevated focus:bg-surface-elevated font-mono"
              >
                {copiedReport ? (
                  <Check className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                )}
                <span>Copy Markdown Table</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownloadJSON}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-surface-elevated focus:bg-surface-elevated font-mono"
              >
                <FileJson className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Download JSON Report</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 text-xs cursor-pointer hover:bg-surface-elevated focus:bg-surface-elevated font-mono"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Download CSV Spreadsheet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-elevated border border-surface-border text-sky-400 tabular-nums font-medium">
            <NumberTicker value={batchVolume} /> calls
          </span>
        </div>
      </div>

      {/* Simulator Controls: Batch Multiplier + Output Ratio Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Batch Scale Multiplier Slider */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-subtle/70 border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Calculator className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              Batch Scale Multiplier
            </span>
            <span className="text-sky-400 font-medium tabular-nums">
              <NumberTicker value={batchVolume} /> runs
            </span>
          </div>
          <Slider
            value={[batchVolume]}
            min={1000}
            max={100000}
            step={1000}
            onValueChange={(val) => setBatchVolume(val[0])}
            aria-label="Adjust batch execution multiplier"
            className="my-1.5"
          />
          <div className="flex justify-between text-[10px] font-mono text-zinc-400">
            {volumeSteps.map((step) => (
              <button
                key={step}
                onClick={() => setBatchVolume(step)}
                aria-label={`Set batch volume to ${step}`}
                className={`hover:text-zinc-200 transition-colors tabular-nums ${
                  batchVolume === step ? "text-sky-400 font-bold" : ""
                }`}
              >
                {step >= 1000 ? `${step / 1000}k` : step}
              </button>
            ))}
          </div>
        </div>

        {/* Output Completion Ratio Simulator */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-subtle/70 border border-surface-border">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <CornerDownRight className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              Completion Output Simulator
            </span>
            <span className="text-cyan-400 font-medium tabular-nums">
              +<NumberTicker value={estimatedOutputTokens} /> tokens ({outputMultiplier}x)
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 my-1">
            {outputRatioSteps.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOutputMultiplier(opt.value)}
                aria-label={`Set output token ratio to ${opt.label}`}
                className={`py-1 rounded text-[10px] font-mono transition-all text-center tabular-nums ${
                  outputMultiplier === opt.value
                    ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                    : "bg-surface-elevated text-zinc-400 hover:text-zinc-200 border border-surface-border"
                }`}
              >
                {opt.value === 0 ? "0x" : `${opt.value}x`}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Simulated generation cost</span>
            <span className="tabular-nums text-zinc-300">Total: {formatNumber(tokenCount + estimatedOutputTokens)} tok</span>
          </div>
        </div>
      </div>

      {/* Provider Filter Tabs */}
      <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1 text-xs font-mono">
        <span className="text-zinc-500 text-[10px] uppercase tracking-wider mr-1">Filter:</span>
        {providers.map((p) => (
          <button
            key={p}
            onClick={() => setProviderFilter(p)}
            className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
              providerFilter === p
                ? "bg-zinc-200 text-zinc-950 font-semibold"
                : "bg-surface-subtle text-zinc-400 hover:text-zinc-200 border border-surface-border"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Pricing Comparison Table (Rule §7: hairline rows, mono nums, left accent border) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-surface-border text-zinc-500 text-[10px] uppercase tracking-wider">
              <th scope="col" className="py-2.5 px-3">Model</th>
              <th scope="col" className="py-2.5 px-3">Standard Input</th>
              <th scope="col" className="py-2.5 px-3">Cached Prompt</th>
              <th scope="col" className="py-2.5 px-3">Single Run</th>
              <th scope="col" className="py-2.5 px-3 text-right">
                Batch Total ({formatNumber(batchVolume)})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {filteredModels.map(([key, model]) => {
              const isSelected = selectedModel === key;

              // Cost Calculations
              const standardInputPerToken = model.inputCostPer1M / 1000000;
              const cachedInputPerToken = model.cachedInputCostPer1M / 1000000;
              const outputPerToken = model.outputCostPer1M / 1000000;

              const singleRunInputStandard = tokenCount * standardInputPerToken;
              const singleRunInputCached = tokenCount * cachedInputPerToken;
              const singleRunOutput = estimatedOutputTokens * outputPerToken;

              const singleRunTotalStandard = singleRunInputStandard + singleRunOutput;
              const singleRunTotalCached = singleRunInputCached + singleRunOutput;

              const batchStandard = singleRunTotalStandard * batchVolume;
              const batchCached = singleRunTotalCached * batchVolume;
              const batchSavings = Math.max(0, batchStandard - batchCached);
              const savingsPercent =
                model.inputCostPer1M > 0
                  ? (
                      ((model.inputCostPer1M - model.cachedInputCostPer1M) /
                        model.inputCostPer1M) *
                      100
                    ).toFixed(0)
                  : 0;

              return (
                <tr
                  key={key}
                  onClick={() => setSelectedModel(key)}
                  className={`relative transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-surface-elevated/80 border-l-2 border-l-sky-400"
                      : "hover:bg-surface-elevated/40"
                  }`}
                >
                  {/* Model Name & Provider */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-semibold ${
                          isSelected ? "text-zinc-100 font-bold" : "text-zinc-300"
                        }`}
                      >
                        {model.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {model.provider} • {model.family}
                    </span>
                  </td>

                  {/* Standard Cost */}
                  <td className="py-3 px-3 text-zinc-300 tabular-nums">
                    <div>${model.inputCostPer1M.toFixed(3)} / 1M</div>
                    {estimatedOutputTokens > 0 && (
                      <div className="text-[10px] text-zinc-500">
                        out: ${model.outputCostPer1M.toFixed(3)}
                      </div>
                    )}
                  </td>

                  {/* Cached Cost & Savings Badge */}
                  <td className="py-3 px-3 tabular-nums">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sky-400 font-medium">
                        ${model.cachedInputCostPer1M.toFixed(3)} / 1M
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                        -{savingsPercent}%
                      </span>
                    </div>
                  </td>

                  {/* Single Run Cost */}
                  <td className="py-3 px-3 text-zinc-300 tabular-nums">
                    <div>
                      <NumberTicker
                        value={singleRunTotalStandard}
                        formatter={(val) => formatCurrency(val, 5)}
                      />
                    </div>
                    {singleRunTotalCached < singleRunTotalStandard && (
                      <div className="text-[10px] text-sky-400">
                        cached: {formatCurrency(singleRunTotalCached, 5)}
                      </div>
                    )}
                  </td>

                  {/* Batch Run Cost & Total Savings */}
                  <td className="py-3 px-3 text-right tabular-nums">
                    <div className="text-sm font-semibold text-zinc-100">
                      <NumberTicker
                        value={batchStandard}
                        formatter={(val) => formatCurrency(val, 2)}
                      />
                    </div>
                    {batchSavings > 0 && (
                      <div className="text-[10px] text-sky-400 font-medium flex items-center justify-end gap-1">
                        <TrendingDown className="w-3 h-3" aria-hidden="true" />
                        <span>Save {formatCurrency(batchSavings, 2)}</span>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

