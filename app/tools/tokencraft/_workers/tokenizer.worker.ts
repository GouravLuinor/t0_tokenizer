import { encode as encode4o, decode as decode4o } from "gpt-tokenizer/model/gpt-4o";
import { encode as encode4, decode as decode4 } from "gpt-tokenizer/model/gpt-4";

export interface TokenChunk {
  index: number;
  id: number;
  text: string;
  byteLength: number;
  hex: string;
}

export interface WorkerMessagePayload {
  text: string;
  model: string;
}

export interface WorkerResponsePayload {
  tokens: TokenChunk[];
  count: number;
  characterCount: number;
  wordCount: number;
  byteCount: number;
  executionTimeMs: number;
}

self.onmessage = (e: MessageEvent<WorkerMessagePayload>) => {
  const { text, model } = e.data;

  if (!text) {
    self.postMessage({
      tokens: [],
      count: 0,
      characterCount: 0,
      wordCount: 0,
      byteCount: 0,
      executionTimeMs: 0,
    } as WorkerResponsePayload);
    return;
  }

  const startTime = performance.now();

  try {
    const isLegacy = model === "gpt-4" || model === "gpt-3.5-turbo" || model === "cl100k_base";
    const encodeFn = isLegacy ? encode4 : encode4o;
    const decodeFn = isLegacy ? decode4 : decode4o;

    const tokenIds = encodeFn(text);
    const encoder = new TextEncoder();

    // Map token ids to detailed chunk representations
    const tokenChunks: TokenChunk[] = tokenIds.map((id, index) => {
      const rawChunk = decodeFn([id]);
      const chunkBytes = encoder.encode(rawChunk);
      const hex = Array.from(chunkBytes)
        .map((b) => `0x${b.toString(16).toUpperCase().padStart(2, "0")}`)
        .join(" ");

      return {
        index,
        id,
        text: rawChunk,
        byteLength: chunkBytes.length,
        hex,
      };
    });

    const executionTimeMs = performance.now() - startTime;

    self.postMessage({
      tokens: tokenChunks,
      count: tokenIds.length,
      characterCount: text.length,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
      byteCount: encoder.encode(text).length,
      executionTimeMs: Number(executionTimeMs.toFixed(2)),
    } as WorkerResponsePayload);
  } catch (error) {
    console.error("Tokenization worker error:", error);
    self.postMessage({
      tokens: [],
      count: 0,
      characterCount: text.length,
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
      byteCount: 0,
      executionTimeMs: 0,
    } as WorkerResponsePayload);
  }
};
