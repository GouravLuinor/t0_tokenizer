"use client";

import React, { useCallback, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Copy, Minimize2, Undo2, Upload, X } from "lucide-react";
import { useTokenCraftStore, type VisualViewMode } from "../../_store/useTokenCraftStore";
import { PROMPT_PRESETS } from "../../_lib/presets";
import type { TokenChunk } from "../../_lib/tokenizeTypes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyText } from "@/lib/clipboard";
import { formatBytes, formatNumber } from "@/lib/utils";
import { OVERLAY_TOKEN_LIMIT, TokenOverlayEditor } from "./TokenOverlayEditor";
import { TokenStream, displayTokenText } from "./TokenStream";
import { TokenStats } from "./TokenStats";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

const VIEWS: { mode: VisualViewMode; label: string }[] = [
  { mode: "text", label: "Text" },
  { mode: "chips", label: "Tokens" },
  { mode: "ids", label: "IDs" },
  { mode: "heatmap", label: "Bytes" },
  { mode: "analytics", label: "Stats" },
];

const toolButton =
  "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] text-ink-2 transition-colors hover:bg-panel hover:text-ink disabled:pointer-events-none disabled:opacity-45";

export function PromptPane() {
  const rawText = useTokenCraftStore((s) => s.rawText);
  const setRawText = useTokenCraftStore((s) => s.setRawText);
  const clearText = useTokenCraftStore((s) => s.clearText);
  const loadPreset = useTokenCraftStore((s) => s.loadPreset);
  const tokenChunks = useTokenCraftStore((s) => s.tokenChunks);
  const tokenizedText = useTokenCraftStore((s) => s.tokenizedText);
  const characterCount = useTokenCraftStore((s) => s.characterCount);
  const wordCount = useTokenCraftStore((s) => s.wordCount);
  const byteCount = useTokenCraftStore((s) => s.byteCount);
  const executionTimeMs = useTokenCraftStore((s) => s.executionTimeMs);
  const isWorkerDegraded = useTokenCraftStore((s) => s.isWorkerDegraded);
  const viewMode = useTokenCraftStore((s) => s.viewMode);
  const setViewMode = useTokenCraftStore((s) => s.setViewMode);
  const generateMinifyPreview = useTokenCraftStore((s) => s.generateMinifyPreview);
  const revertMinification = useTokenCraftStore((s) => s.revertMinification);
  const canRevert = useTokenCraftStore((s) => s.previousText !== null);
  const savings = useTokenCraftStore((s) => s.minifySavings);

  const [caretToken, setCaretToken] = useState<TokenChunk | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const current = tokenizedText === rawText;
  const counting = tokenizedText === null && rawText.length > 0;
  const tokensForText = current ? tokenChunks : null;
  const tokenSaving =
    savings && savings.forText === rawText ? Math.max(0, savings.before - savings.after) : null;

  const readFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_BYTES) {
        setLoadError(`“${file.name}” is ${formatBytes(file.size)}. The limit is 2 MB; paste an excerpt instead.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setLoadError(null);
          setRawText(e.target.result);
          setViewMode("text");
        }
      };
      reader.onerror = () => setLoadError(`Couldn’t read “${file.name}”. It may be binary or locked.`);
      reader.readAsText(file);
    },
    [setRawText, setViewMode]
  );

  const onCopy = async () => {
    if (rawText && (await copyText(rawText))) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col"
      onDragEnter={(e) => {
        e.preventDefault();
        dragDepth.current += 1;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) readFile(file);
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Your prompt</h2>
          <p className="mt-0.5 text-[13px] text-ink-2">Paste or drop a file. Nothing you type leaves this tab.</p>
        </div>
        <div role="tablist" aria-label="How to show the prompt" className="flex rounded-md border border-rule bg-sheet p-0.5">
          {VIEWS.map(({ mode, label }) => {
            const active = viewMode === mode;
            return (
              <button
                key={mode}
                role="tab"
                aria-selected={active}
                onClick={() => setViewMode(mode)}
                className={`rounded-[5px] px-2.5 py-1 text-[13px] transition-colors ${
                  active ? "bg-board text-board-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-rule bg-sheet">
        <div className="flex flex-wrap items-center gap-1 border-b border-rule px-2 py-1.5 sm:px-3">
          <DropdownMenu>
            <DropdownMenuTrigger className={toolButton}>
              Samples <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              {Object.entries(PROMPT_PRESETS).map(([key, p]) => (
                <DropdownMenuItem key={key} onClick={() => loadPreset(key)} className="flex-col items-start gap-0.5">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-xs text-ink-3">{p.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".txt,.md,.json,.js,.ts,.tsx,.py,.html,.css,.csv,.yaml,.yml"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) readFile(f);
              e.target.value = "";
            }}
          />
          <button type="button" className={toolButton} onClick={() => fileRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Open file
          </button>
          <button type="button" className={toolButton} onClick={onCopy} disabled={!rawText}>
            {copied ? <Check className="h-3.5 w-3.5 text-ok" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className={toolButton} onClick={clearText} disabled={!rawText} aria-label="Clear the prompt">
            <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
          </button>

          <div className="ml-auto flex items-center gap-1">
            {canRevert && (
              <button type="button" className={toolButton} onClick={revertMinification}>
                <Undo2 className="h-3.5 w-3.5" aria-hidden="true" /> Undo minify
              </button>
            )}
            <button
              type="button"
              onClick={generateMinifyPreview}
              disabled={!rawText}
              aria-label="Minify prompt"
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-board px-3 text-[13px] font-medium text-board-ink transition-colors hover:bg-board-2 disabled:pointer-events-none disabled:opacity-45"
            >
              <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              Minify
              {tokenSaving !== null && tokenSaving > 0 && (
                <span className="font-mono text-gold tnum">−{formatNumber(tokenSaving)}</span>
              )}
            </button>
          </div>
        </div>

        {loadError && (
          <div role="alert" className="flex items-start gap-2 border-b border-danger/30 bg-danger-wash px-4 py-2 text-[13px] text-danger">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="flex-1">{loadError}</span>
            <button type="button" onClick={() => setLoadError(null)} aria-label="Dismiss" className="rounded p-0.5 hover:bg-danger/10">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {viewMode === "text" ? (
          <TokenOverlayEditor
            value={rawText}
            onChange={setRawText}
            tokens={tokensForText}
            onCaretToken={setCaretToken}
            placeholder="Paste a prompt, system instructions, a RAG chunk, code or JSON…"
          />
        ) : viewMode === "analytics" ? (
          <TokenStats tokens={current ? tokenChunks : []} characters={characterCount} bytes={byteCount} />
        ) : (
          <TokenStream tokens={current ? tokenChunks : []} mode={viewMode} />
        )}

        {!rawText && viewMode === "text" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-6">
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2 text-[13px] text-ink-3">
              Try a sample:
              {Object.entries(PROMPT_PRESETS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => loadPreset(key)}
                  className="rounded-md border border-rule bg-sheet px-2.5 py-1 text-ink-2 transition-colors hover:border-rule-2 hover:text-ink"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          id="prompt-stats"
          className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-rule px-5 py-2.5 font-mono text-[12px] text-ink-3 sm:px-6"
        >
          <span className="tnum">{formatNumber(characterCount)} chars</span>
          <span className="tnum">{formatNumber(wordCount)} words</span>
          <span className="tnum">{formatBytes(byteCount)}</span>
          {viewMode === "text" && current && tokenChunks.length > OVERLAY_TOKEN_LIMIT && (
            <span>Boundaries hidden above {formatNumber(OVERLAY_TOKEN_LIMIT)} tokens. Use Tokens view.</span>
          )}
          {viewMode === "text" && caretToken && (
            <span className="text-ink-2" aria-live="polite">
              Cursor in token {formatNumber(caretToken.index + 1)}:{" "}
              <span className="rounded-[3px] bg-gold-wash px-1 text-ink">{displayTokenText(caretToken.text)}</span> #
              {caretToken.id} · {caretToken.byteLength} B
            </span>
          )}
          <span className="ml-auto">
            {counting
              ? "Loading the tokenizer…"
              : isWorkerDegraded
                ? `Counted on the main thread · ${executionTimeMs} ms`
                : `Counted in your browser · ${executionTimeMs} ms`}
          </span>
        </div>
      </div>

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-board bg-sheet/95 text-center dark:border-gold">
          <Upload className="mb-2 h-7 w-7 text-board dark:text-gold" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">Drop to load the file</p>
          <p className="mt-1 text-xs text-ink-3">Text, Markdown, JSON, code · up to 2 MB</p>
        </div>
      )}
    </div>
  );
}
