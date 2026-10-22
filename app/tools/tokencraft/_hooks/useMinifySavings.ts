"use client";

import { useEffect } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { getCurrentModel } from "../_lib/modelRegistry";
import { minifyPromptWithOptions } from "../_lib/promptMinifier";
import { countTokens } from "./useTokenizer";

const SETTLE_MS = 400;

/**
 * Keeps `minifySavings` honest: the minifier's output is counted with the
 * same encoding as the prompt, so the UI can promise tokens saved rather
 * than characters. Runs once typing settles and only for counted text.
 */
export function useMinifySavings() {
  const rawText = useTokenCraftStore((s) => s.rawText);
  const tokenizedText = useTokenCraftStore((s) => s.tokenizedText);
  const tokenCount = useTokenCraftStore((s) => s.tokenCount);
  const options = useTokenCraftStore((s) => s.minifyOptions);
  const encoding = useTokenCraftStore(
    (s) => getCurrentModel(s.modelsRegistry, s.selectedModel).encoding
  );
  const setSavings = useTokenCraftStore((s) => s.setMinifySavings);

  useEffect(() => {
    if (!rawText || tokenizedText !== rawText) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const minified = minifyPromptWithOptions(rawText, options).minifiedText;
      const after = minified === rawText ? tokenCount : await countTokens(minified, encoding);
      if (!cancelled) setSavings({ forText: rawText, before: tokenCount, after });
    }, SETTLE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [rawText, tokenizedText, tokenCount, options, encoding, setSavings]);
}
