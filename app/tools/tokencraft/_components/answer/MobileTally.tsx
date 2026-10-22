"use client";

import { useEffect, useState } from "react";
import { useTokenCraftStore } from "../../_store/useTokenCraftStore";
import { getCurrentModel } from "../../_lib/modelRegistry";
import { callCost, formatMoney, isExactCount } from "../../_lib/costs";
import { formatNumber } from "@/lib/utils";

/**
 * Phones stack the answer under the editor, so while the editor is on
 * screen and the answer is not, the count and price ride along at the bottom.
 */
export function MobileTally() {
  const tokenizedText = useTokenCraftStore((s) => s.tokenizedText);
  const tokenCount = useTokenCraftStore((s) => s.tokenCount);
  const ratio = useTokenCraftStore((s) => s.outputMultiplier);
  const model = useTokenCraftStore((s) => getCurrentModel(s.modelsRegistry, s.selectedModel));
  const [show, setShow] = useState(false);

  useEffect(() => {
    const editor = document.getElementById("prompt-pane");
    const answer = document.getElementById("answer-panel");
    if (!editor || !answer) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      setShow(Boolean(seen.get(editor)) && !seen.get(answer));
    });
    io.observe(editor);
    io.observe(answer);
    return () => io.disconnect();
  }, []);

  const counting = tokenizedText === null;
  const cost = callCost(model, tokenCount, Math.round(tokenCount * ratio));

  return (
    <a
      href="#answer-panel"
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-lg bg-board px-4 py-2.5 text-board-ink shadow-board transition-[opacity,transform] duration-200 motion-reduce:transition-none lg:hidden ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <span className="font-display text-[22px] font-semibold leading-none tnum">
        {counting ? "Counting…" : formatNumber(tokenCount)}
        <span className="ml-1.5 font-sans text-[12px] font-normal text-board-ink-2">
          {isExactCount(model) ? "tokens" : "≈ tokens"}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-mono text-[14px] text-gold tnum">{counting ? "—" : formatMoney(cost.total)}</span>
        <span className="block text-[11px] text-board-ink-2">per call · {model.name}</span>
      </span>
    </a>
  );
}
