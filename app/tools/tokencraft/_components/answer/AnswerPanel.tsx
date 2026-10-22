"use client";

import { useMemo } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useTokenCraftStore } from "../../_store/useTokenCraftStore";
import { getCurrentModel } from "../../_lib/modelRegistry";
import {
  cacheSavingPercent,
  callCost,
  contextFit,
  crossesPriceTier,
  formatCompact,
  formatMoney,
  isExactCount,
  rampPosition,
  rankByCost,
  blendedRate,
} from "../../_lib/costs";
import { formatNumber } from "@/lib/utils";
import { ModelPicker } from "./ModelPicker";
import { RollingFigure } from "./RollingFigure";

const OUTPUT_RATIOS = [0, 0.5, 1, 2, 4];
const CALL_VOLUMES = [1, 1000, 10_000, 100_000, 1_000_000];

function Segmented<T extends number>({
  label,
  options,
  value,
  onChange,
  format,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format: (v: T) => string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-md border border-rule bg-paper p-0.5">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={`min-w-0 flex-1 rounded-[5px] px-1.5 py-1 font-mono text-[12px] tnum transition-colors ${
              on ? "bg-board text-board-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            {format(o)}
          </button>
        );
      })}
    </div>
  );
}

export function AnswerPanel() {
  const registry = useTokenCraftStore((s) => s.modelsRegistry);
  const selected = useTokenCraftStore((s) => s.selectedModel);
  const select = useTokenCraftStore((s) => s.setSelectedModel);
  const rawText = useTokenCraftStore((s) => s.rawText);
  const tokenizedText = useTokenCraftStore((s) => s.tokenizedText);
  const tokenCount = useTokenCraftStore((s) => s.tokenCount);
  const outputRatio = useTokenCraftStore((s) => s.outputMultiplier);
  const setOutputRatio = useTokenCraftStore((s) => s.setOutputMultiplier);
  const calls = useTokenCraftStore((s) => s.batchVolume);
  const setCalls = useTokenCraftStore((s) => s.setBatchVolume);

  const model = getCurrentModel(registry, selected);
  const counting = tokenizedText === null;
  const stale = !counting && tokenizedText !== rawText;
  const input = counting ? 0 : tokenCount;
  const output = Math.round(input * outputRatio);
  const exact = isExactCount(model);

  const cost = callCost(model, input, output);
  const fit = contextFit(model, input, output);
  const saving = cacheSavingPercent(model);
  const tiered = crossesPriceTier(model, input);

  const cheapest = useMemo(
    () => rankByCost(registry, input, output).slice(0, 5),
    [registry, input, output]
  );
  const modelCount = Object.keys(registry).length;
  const dash = "—";

  return (
    <aside id="answer-panel" aria-label="Count and cost" className="flex min-w-0 scroll-mt-16 flex-col gap-4">
      <div className="rounded-lg border border-rule bg-sheet shadow-elevated">
        <div className="border-b border-rule px-5 py-3">
          <ModelPicker />
        </div>

        <div className="px-5 pb-5 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] text-ink-2">Input tokens</p>
            <span
              className={`rounded-[4px] px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide ${
                exact ? "bg-board text-board-ink" : "bg-gold-wash text-gold-ink"
              }`}
              title={
                exact
                  ? `Exact: counted with ${model.family}, the encoding this model uses.`
                  : `Estimate: ${model.provider} uses its own tokenizer; counted with o200k_base.`
              }
            >
              {exact ? "Exact" : "≈ Estimate"}
            </span>
          </div>
          <p
            id="answer-count"
            className={`mt-1 font-display text-[64px] font-semibold leading-[0.95] text-ink sm:text-[88px] ${stale ? "opacity-70" : ""}`}
            aria-live="polite"
            aria-busy={counting || stale}
          >
            {counting ? (
              <span className="text-[40px] text-ink-3 sm:text-[48px]">Counting…</span>
            ) : (
              <RollingFigure value={formatNumber(input)} />
            )}
          </p>
          <p className="mt-1 text-[13px] text-ink-3">
            {exact
              ? `${model.family}, the same encoding ${model.provider} bills with.`
              : `${model.provider} tokenizes differently; real counts can be higher.`}
          </p>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-rule pt-4">
            {[
              ["This prompt", cost.input, "input only"],
              ["Per call", cost.total, `with ${formatCompact(output)} out`],
              [`× ${formatCompact(calls)} calls`, cost.total * calls, "at list rates"],
            ].map(([label, value, note]) => (
              <div key={label as string} className="min-w-0">
                <dt className="truncate text-[12px] text-ink-2">{label}</dt>
                <dd className="mt-0.5 truncate font-mono text-[17px] font-medium text-gold-ink sm:text-[18px]">
                  {counting ? dash : <RollingFigure value={formatMoney(value as number)} />}
                </dd>
                <dd className="truncate text-[11px] text-ink-3">{note}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-[12px] text-ink-2">Expected reply, × input</p>
              <Segmented
                label="Expected reply length as a multiple of the input"
                options={OUTPUT_RATIOS}
                value={outputRatio}
                onChange={setOutputRatio}
                format={(v) => `${v}×`}
              />
            </div>
            <div>
              <p className="mb-1 text-[12px] text-ink-2">Calls</p>
              <Segmented
                label="Number of calls"
                options={CALL_VOLUMES}
                value={calls}
                onChange={setCalls}
                format={formatCompact}
              />
            </div>
          </div>

          {saving !== null && !counting && input > 0 && (
            <p className="mt-3 text-[13px] text-ink-2">
              Reusing this prompt as a cached prefix cuts input to{" "}
              <span className="font-mono text-gold-ink">{formatMoney(cost.cachedInput)}</span>, {saving}% less.
            </p>
          )}

          <FitBar fit={fit} counting={counting} tiered={tiered} tierAt={model.tieredAboveTokens} />
        </div>
      </div>

      <section aria-labelledby="mini-board-title" className="rounded-lg bg-board text-board-ink shadow-board">
        <div className="flex items-baseline justify-between gap-3 border-b border-board-rule px-5 py-3">
          <h2 id="mini-board-title" className="font-display text-[17px] font-semibold uppercase tracking-[0.06em]">
            Cheapest for this call
          </h2>
          <span className="font-mono text-[11px] text-board-ink-2">per call</span>
        </div>
        <ol>
          {!counting && cheapest.map(({ key, model: m, cost: c }) => {
            const on = key === selected || m.id === model.id;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => select(key)}
                  aria-pressed={on}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_4.5rem_5.5rem] items-center gap-3 border-b border-board-rule/60 px-5 py-2 text-left transition-colors last:border-0 hover:bg-board-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold ${
                    on ? "bg-board-2" : ""
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">
                      {m.name}
                      {!isExactCount(m) && <span className="ml-1 text-board-ink-2" title="Estimated count">≈</span>}
                    </span>
                    <span className="block truncate text-[11px] text-board-ink-2">{m.provider}</span>
                  </span>
                  <span className="h-1.5 rounded-full bg-board-rule" aria-hidden="true">
                    <span
                      className="block h-1.5 rounded-full bg-gold"
                      style={{ width: `${(rampPosition(blendedRate(m, outputRatio)) * 100).toFixed(1)}%` }}
                    />
                  </span>
                  <span className="text-right font-mono text-[13px] text-gold tnum">
                    <RollingFigure value={formatMoney(c.total)} />
                  </span>
                </button>
              </li>
            );
          })}
          {counting && (
            <li className="px-5 py-4 text-[13px] text-board-ink-2">Ranking once the prompt is counted…</li>
          )}
          {!counting && !cheapest.length && (
            <li className="px-5 py-4 text-[13px] text-board-ink-2">No model can hold this prompt and its reply.</li>
          )}
        </ol>
        <a
          href="#rate-board"
          className="flex items-center justify-between rounded-b-lg border-t border-board-rule px-5 py-2.5 text-[13px] text-board-ink-2 transition-colors hover:text-board-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
        >
          Full rate board · {modelCount} models
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </section>
    </aside>
  );
}

function FitBar({
  fit,
  counting,
  tiered,
  tierAt,
}: {
  fit: ReturnType<typeof contextFit>;
  counting: boolean;
  tiered: boolean;
  tierAt?: number;
}) {
  const tone = fit.status === "over" ? "text-danger" : fit.status === "tight" ? "text-warn" : "text-ink-2";
  const summary = counting
    ? "Waiting for the count"
    : fit.status === "over"
      ? `Over by ${formatNumber(fit.input + fit.output - fit.capacity)} tokens`
      : `${formatNumber(fit.remaining)} tokens left`;

  return (
    <div role="region" aria-label="Context window" className="mt-5 border-t border-rule pt-4">
      <div className="flex items-baseline justify-between gap-3 text-[12px]">
        <span className="text-ink-2">Context window · {formatCompact(fit.capacity)}</span>
        <span className={`font-mono tnum ${tone}`}>{summary}</span>
      </div>
      <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-panel" aria-hidden="true">
        <span className="h-full bg-board dark:bg-ok" style={{ width: `${fit.inputShare * 100}%` }} />
        <span
          className="h-full bg-gold"
          style={{ width: `${fit.outputShare * 100}%`, minWidth: fit.output ? 2 : 0 }}
        />
      </div>
      <div className="mt-1.5 flex gap-4 text-[11px] text-ink-3">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-board dark:bg-ok" aria-hidden="true" />
          Prompt {formatCompact(fit.input)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
          Reply reserved {formatCompact(fit.output)}
        </span>
      </div>
      {tiered && tierAt && (
        <p className="mt-2 flex items-start gap-1.5 text-[12px] text-warn">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Above {formatCompact(tierAt)} input tokens this model bills a higher long-context rate. Figures use the base rate.
        </p>
      )}
    </div>
  );
}
