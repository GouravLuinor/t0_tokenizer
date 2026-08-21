"use client";

import { useEffect, useRef } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import type {
  WorkerMessagePayload,
  WorkerResponsePayload,
} from "../_workers/tokenizer.worker";

export function useTokenizer() {
  const { rawText, selectedModel, setTokenData } = useTokenCraftStore();
  const workerRef = useRef<Worker | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Web Worker
    try {
      workerRef.current = new Worker(
        new URL("../_workers/tokenizer.worker.ts", import.meta.url)
      );

      workerRef.current.onmessage = (
        e: MessageEvent<WorkerResponsePayload>
      ) => {
        const {
          tokens,
          count,
          characterCount,
          wordCount,
          byteCount,
          executionTimeMs,
        } = e.data;

        setTokenData({
          tokenChunks: tokens,
          tokenCount: count,
          characterCount,
          wordCount,
          byteCount,
          executionTimeMs,
          isProcessing: false,
        });
      };
    } catch (err) {
      console.warn("Web Worker initialization failed, falling back to direct computation:", err);
    }

    return () => {
      workerRef.current?.terminate();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [setTokenData]);

  // Trigger worker tokenization on rawText or selectedModel changes
  useEffect(() => {
    setTokenData({ isProcessing: true });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // High-performance debounce: 0ms for small texts, 40ms for large texts
    const delay = rawText.length > 5000 ? 40 : 0;

    debounceTimerRef.current = setTimeout(() => {
      if (workerRef.current) {
        workerRef.current.postMessage({
          text: rawText,
          model: selectedModel,
        } as WorkerMessagePayload);
      }
    }, delay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [rawText, selectedModel, setTokenData]);
}
