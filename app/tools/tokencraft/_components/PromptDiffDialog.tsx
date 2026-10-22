"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import type { MinifyOptions } from "../_lib/promptMinifier";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { formatNumber } from "@/lib/utils";

const RULES: { key: keyof MinifyOptions; label: string; note: string }[] = [
  { key: "stripComments", label: "Strip comments", note: "// and /* */ in code blocks" },
  { key: "collapseWhitespace", label: "Collapse whitespace", note: "runs of spaces and blank lines" },
  { key: "trimLineEndings", label: "Trim line endings", note: "trailing spaces" },
  { key: "minifyJson", label: "Minify JSON", note: "valid JSON only" },
  { key: "compactTables", label: "Compact tables", note: "Markdown table padding" },
];

/** Side-by-side review of the minifier's output, priced in real tokens. */
export function PromptDiffDialog() {
  const open = useTokenCraftStore((s) => s.diffModalOpen);
  const setOpen = useTokenCraftStore((s) => s.setDiffModalOpen);
  const preview = useTokenCraftStore((s) => s.minifiedPreview);
  const options = useTokenCraftStore((s) => s.minifyOptions);
  const setOptions = useTokenCraftStore((s) => s.setMinifyOptions);
  const apply = useTokenCraftStore((s) => s.applyMinification);
  const rawText = useTokenCraftStore((s) => s.rawText);
  const savings = useTokenCraftStore((s) => s.minifySavings);
  const [copied, setCopied] = useState(false);

  if (!preview) return null;

  const counted = savings && savings.forText === rawText ? savings : null;
  const saved = counted ? Math.max(0, counted.before - counted.after) : null;
  const pct = counted && counted.before ? Math.round(((saved ?? 0) / counted.before) * 100) : 0;
  const unchanged = preview.minifiedText === rawText;

  const onCopy = async () => {
    if (await copyText(preview.minifiedText)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[92vh] w-[95vw] max-w-[1200px] flex-col gap-0 overflow-hidden rounded-xl border border-rule bg-sheet p-0 shadow-elevated">
        <DialogHeader className="border-b border-rule px-6 py-4 text-left">
          <div className="flex flex-wrap items-end justify-between gap-4 pr-8">
            <div>
              <DialogTitle className="text-[17px] font-semibold text-ink">Minify the prompt</DialogTitle>
              <DialogDescription className="mt-1 text-[13px] text-ink-2">
                Removes formatting the model does not need. Wording is never changed. Review it before you apply.
              </DialogDescription>
            </div>
            <p className="font-display text-[34px] font-semibold leading-none text-ink tnum" aria-live="polite">
              {unchanged ? (
                <span className="text-[18px] text-ink-3">Nothing to remove</span>
              ) : saved === null ? (
                <span className="text-[18px] text-ink-3">Counting…</span>
              ) : (
                <>
                  −{formatNumber(saved)} <span className="text-[18px] font-medium text-ink-2">tokens · {pct}%</span>
                </>
              )}
            </p>
          </div>
        </DialogHeader>

        <fieldset className="flex flex-wrap gap-x-5 gap-y-2 border-b border-rule bg-paper px-6 py-3">
          <legend className="sr-only">Rules to apply</legend>
          {RULES.map((r) => (
            <label key={r.key} className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={options[r.key]}
                onChange={(e) => setOptions({ [r.key]: e.target.checked })}
                className="h-4 w-4 cursor-pointer rounded-sm accent-[rgb(var(--board))] dark:accent-[rgb(var(--gold))]"
              />
              {r.label}
              <span className="hidden text-[12px] text-ink-3 lg:inline">{r.note}</span>
            </label>
          ))}
        </fieldset>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
          {[
            ["Before", rawText, counted ? `${formatNumber(counted.before)} tokens` : `${formatNumber(preview.originalChars)} chars`],
            ["After", preview.minifiedText, counted ? `${formatNumber(counted.after)} tokens` : `${formatNumber(preview.minifiedChars)} chars`],
          ].map(([label, text, meta], i) => (
            <div key={label} className={`flex min-h-0 flex-col ${i ? "border-t border-rule md:border-l md:border-t-0" : ""}`}>
              <div className="flex items-center justify-between px-6 py-2 text-[12px]">
                <span className="font-medium text-ink">{label}</span>
                <span className="font-mono text-ink-3 tnum">{meta}</span>
              </div>
              <pre className="h-[240px] overflow-auto whitespace-pre-wrap break-words px-6 pb-4 font-mono text-[12.5px] leading-relaxed text-ink-2 md:h-[360px]">
                {text}
              </pre>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 border-t border-rule px-6 py-3 sm:gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={onCopy} disabled={unchanged}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy result"}
          </Button>
          <Button onClick={apply} disabled={unchanged}>
            Apply to prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
