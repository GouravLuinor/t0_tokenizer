"use client";

import { useTokenCraftStore } from "../../_store/useTokenCraftStore";
import { getCurrentModel } from "../../_lib/modelRegistry";
import { formatMoney } from "../../_lib/costs";
import { formatNumber } from "@/lib/utils";

const RULES = [
  ["Comments in code blocks", "// notes and /* blocks */ the model never needed"],
  ["Repeated spaces and blank lines", "each run becomes one"],
  ["Trailing spaces", "trimmed from every line"],
  ["JSON indentation", "only when the JSON parses, so data is never damaged"],
  ["Markdown table padding", "the alignment spaces between pipes"],
];

/** Shows what the minifier would save on the prompt that is in the editor right now. */
export function MinifierSection() {
  const rawText = useTokenCraftStore((s) => s.rawText);
  const savings = useTokenCraftStore((s) => s.minifySavings);
  const registry = useTokenCraftStore((s) => s.modelsRegistry);
  const selected = useTokenCraftStore((s) => s.selectedModel);
  const preview = useTokenCraftStore((s) => s.generateMinifyPreview);
  const model = getCurrentModel(registry, selected);

  const counted = savings && savings.forText === rawText ? savings : null;
  const saved = counted ? Math.max(0, counted.before - counted.after) : 0;
  // saved tokens × 1M calls ÷ 1M tokens per rate unit
  const perMillion = saved * model.inputCostPer1M;

  return (
    <section id="minifier" aria-labelledby="minifier-title" className="scroll-mt-16 border-b border-rule">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16 lg:px-10 lg:py-20">
        <div>
          <h2 id="minifier-title" className="font-display text-[36px] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink sm:text-[48px]">
            Pay for words, not whitespace
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-2">
            Prompts copied from editors and docs carry indentation, comments and padding that the model reads and you
            pay for. The minifier strips that formatting and leaves your wording alone. It counts the result with the
            same tokenizer, so the saving it shows is in tokens, not characters.
          </p>
          <ul className="mt-6 divide-y divide-rule border-y border-rule">
            {RULES.map(([rule, note]) => (
              <li key={rule} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-[14px]">
                <span className="font-medium text-ink">{rule}</span>
                <span className="text-[13px] text-ink-3">{note}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="self-start rounded-lg border border-rule bg-sheet p-6 shadow-elevated sm:p-8">
          <p className="text-[13px] text-ink-2">On the prompt in your editor</p>
          {!rawText ? (
            <p className="mt-3 text-[15px] text-ink-3">Paste a prompt above to see what it would save.</p>
          ) : !counted ? (
            <p className="mt-3 font-display text-[40px] font-semibold text-ink-3">Counting…</p>
          ) : (
            <>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3 font-display font-semibold leading-none text-ink">
                <span className="text-[56px] tnum sm:text-[72px]">{formatNumber(counted.before)}</span>
                <span className="text-[28px] text-ink-3" aria-hidden="true">→</span>
                <span className="text-[56px] tnum sm:text-[72px]">{formatNumber(counted.after)}</span>
                <span className="sr-only">tokens after minifying</span>
              </p>
              <p className="mt-3 text-[15px] text-ink-2">
                {saved > 0 ? (
                  <>
                    <span className="font-medium text-ink">{formatNumber(saved)} fewer tokens</span> per call. Over a
                    million calls on {model.name}, that is{" "}
                    <span className="font-mono text-gold-ink">{formatMoney(perMillion)}</span> of input you stop paying
                    for.
                  </>
                ) : (
                  "This prompt is already tight. There is no formatting to remove."
                )}
              </p>
            </>
          )}
          <button
            type="button"
            onClick={preview}
            disabled={!rawText}
            className="mt-6 inline-flex h-10 items-center rounded-md bg-board px-4 text-[14px] font-medium text-board-ink transition-colors hover:bg-board-2 disabled:pointer-events-none disabled:opacity-45"
          >
            Review the changes
          </button>
        </div>
      </div>
    </section>
  );
}
