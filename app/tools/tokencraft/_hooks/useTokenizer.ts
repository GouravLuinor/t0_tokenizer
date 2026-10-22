"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import type {
  TokenizeRequest,
  TokenizeResponse,
  TokenizeStats,
} from "../_lib/tokenizeTypes";
import { mapStatsToStorePatch } from "../_lib/tokenizeTypes";
import { getCurrentModel } from "../_lib/modelRegistry";
import type { TokenizerEncoding } from "../_lib/tokenizeTypes";

/**
 * One-off counts (e.g. "how many tokens would the minified prompt be?")
 * share the live worker. They use negative ids so they can never be mistaken
 * for, or supersede, the editor's own requests.
 */
let oneOffId = 0;
const pendingCounts = new Map<number, (count: number) => void>();
let countWithWorker: ((text: string, encoding: TokenizerEncoding) => Promise<number>) | null = null;

export async function countTokens(
  text: string,
  encoding: TokenizerEncoding
): Promise<number> {
  if (!text) return 0;
  if (countWithWorker) return countWithWorker(text, encoding);
  const { tokenizeTextSafe } = await import("../_lib/tokenize");
  return tokenizeTextSafe(text, encoding)?.count ?? 0;
}

/**
 * Owns the tokenization pipeline: debounced dispatch to the Web Worker,
 * stale-response rejection via monotonic request ids, and a transparent
 * main-thread fallback when Worker construction or runtime fails.
 *
 * This module deliberately imports NOTHING from _lib/tokenize: the page mount
 * path must stay free of the gpt-tokenizer BPE rank tables. tokenize.ts is
 * reached only through the worker asset or the lazy dynamic import below.
 */
export function useTokenizer() {
  const rawText = useTokenCraftStore((s) => s.rawText);
  const selectedModel = useTokenCraftStore((s) => s.selectedModel);
  const setTokenData = useTokenCraftStore((s) => s.setTokenData);
  const setWorkerDegraded = useTokenCraftStore((s) => s.setWorkerDegraded);

  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestIdRef = useRef(0);
  const latestTextRef = useRef<string | null>(null);

  /**
   * Wire format ({tokens, count}) is translated to the store schema
   * ({tokenChunks, tokenCount}) by mapStatsToStorePatch — never spread the
   * response directly into setTokenData.
   */
  const applyStats = useCallback(
    (stats: TokenizeStats) => {
      setTokenData({
        ...mapStatsToStorePatch(stats),
        tokenizedText: latestTextRef.current,
        isProcessing: false,
      });
    },
    [setTokenData]
  );

  /** Main-thread fallback for environments without Web Workers. */
  const runInline = useCallback(
    async (
      text: string,
      encoding: TokenizeRequest["encoding"],
      requestId?: number
    ) => {
      setTokenData({ isProcessing: true });
      try {
        // Dynamic import keeps gpt-tokenizer out of the main bundle unless needed
        const { tokenizeTextSafe } = await import("../_lib/tokenize");
        const stats = tokenizeTextSafe(text, encoding);
        if (requestId !== undefined && requestId !== latestRequestIdRef.current)
          return;
        if (stats) {
          applyStats(stats);
        } else {
          setTokenData({ isProcessing: false });
        }
      } catch {
        setTokenData({ isProcessing: false });
      }
    },
    [applyStats, setTokenData]
  );

  // Create the worker once; on any failure, fall back to inline computation.
  useEffect(() => {
    try {
      const worker = new Worker(
        new URL("../_workers/tokenizer.worker.ts", import.meta.url)
      );

      worker.onmessage = (e: MessageEvent<TokenizeResponse>) => {
        const resolveCount = pendingCounts.get(e.data.id);
        if (resolveCount) {
          pendingCounts.delete(e.data.id);
          resolveCount(e.data.count);
          return;
        }
        // Drop stale responses from superseded requests
        if (e.data.id !== latestRequestIdRef.current) return;
        applyStats(e.data);
      };

      worker.onerror = () => {
        // Worker died at runtime — recompute the current text inline
        worker.terminate();
        workerRef.current = null;
        countWithWorker = null;
        pendingCounts.forEach((resolve) => resolve(0));
        pendingCounts.clear();
        setWorkerDegraded(true);
        const state = useTokenCraftStore.getState();
        runInline(
          state.rawText,
          getCurrentModel(state.modelsRegistry, state.selectedModel).encoding
        );
      };

      workerRef.current = worker;
      countWithWorker = (text, encoding) =>
        new Promise((resolve) => {
          const id = --oneOffId;
          pendingCounts.set(id, resolve);
          worker.postMessage({ id, text, encoding } satisfies TokenizeRequest);
        });
      setWorkerDegraded(false);
    } catch {
      console.warn("Web Worker unavailable — using main-thread tokenizer.");
      workerRef.current = null;
      setWorkerDegraded(true);
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      countWithWorker = null;
    };
  }, [applyStats, runInline, setWorkerDegraded]);

  // Debounced dispatch on input changes
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    // High-performance debounce: 0ms for small texts, 40ms for large texts
    const delay = rawText.length > 5000 ? 40 : 0;

    debounceTimerRef.current = setTimeout(() => {
      // Enter processing state only when real work is dispatched
      // (prevents "Computing…" shimmer flicker between keystrokes)
      const requestId = ++latestRequestIdRef.current;
      latestTextRef.current = rawText;
      const encoding = getCurrentModel(
        useTokenCraftStore.getState().modelsRegistry,
        selectedModel
      ).encoding;

      if (workerRef.current) {
        const payload: TokenizeRequest = {
          id: requestId,
          text: rawText,
          encoding,
        };
        workerRef.current.postMessage(payload);
      } else {
        runInline(rawText, encoding, requestId);
      }
    }, delay);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [rawText, selectedModel, runInline]);
}
