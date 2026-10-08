"use client";

import React, { useRef, useState, useMemo, useCallback } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { Button } from "@/components/ui/button";
import { DotGrid } from "@/components/ui/dot-grid";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  Copy,
  Upload,
  Check,
  FileText,
  Code2,
  AlertTriangle,
  X,
} from "lucide-react";
import { formatBytes, formatNumber } from "@/lib/utils";
import { copyText } from "@/lib/clipboard";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB guard — keeps the worker responsive

export const RawEditorPane = React.memo(function RawEditorPane() {
  const rawText = useTokenCraftStore((s) => s.rawText);
  const setRawText = useTokenCraftStore((s) => s.setRawText);
  const clearText = useTokenCraftStore((s) => s.clearText);
  const characterCount = useTokenCraftStore((s) => s.characterCount);
  const wordCount = useTokenCraftStore((s) => s.wordCount);
  const byteCount = useTokenCraftStore((s) => s.byteCount);

  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragDepthRef = useRef(0);

  const lineCount = useMemo(
    () => (rawText ? rawText.split("\n").length : 0),
    [rawText]
  );

  const handleCopy = async () => {
    if (!rawText) return;
    const ok = await copyText(rawText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const readFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_BYTES) {
        setLoadError(
          `"${file.name}" is ${formatBytes(file.size)} — the limit is 2 MB. Trim the file or paste a smaller excerpt.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          setLoadError(null);
          setRawText(content);
        }
      };
      reader.onerror = () =>
        setLoadError(`Could not read "${file.name}". The file may be locked or binary.`);
      reader.readAsText(file);
    },
    [setRawText]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
    e.target.value = ""; // allow re-selecting the same file
  };

  // Dragenter/dragleave counter — prevents overlay flicker when
  // the pointer crosses child elements mid-drag.
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    readFile(file);
  };

  return (
    <div
      className="flex flex-col min-h-[520px] lg:min-h-[640px] min-w-0 lg:h-full transition-all duration-200"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Pane Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
            Raw Input Editor
          </span>
          <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
            ({formatNumber(lineCount)} {lineCount === 1 ? "line" : "lines"})
          </span>
        </div>
      </div>

      {/* Load Error Banner — clear recovery affordance */}
      {loadError && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-center justify-between gap-2 px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-[11px] font-mono text-rose-300"
        >
          <span className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{loadError}</span>
          </span>
          <button
            type="button"
            onClick={() => setLoadError(null)}
            aria-label="Dismiss error"
            className="shrink-0 rounded p-0.5 text-rose-300/70 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Editor Body: Gutter + Monospace Textarea */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden transition-shadow duration-150 ease-out-expo focus-within:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]">
        {/* Empty State Dot Grid Backdrop */}
        {!rawText && (
          <DotGrid
            dotSize={1.2}
            gap={24}
            baseColor="#202B46"
            className="opacity-60"
          />
        )}

        {/* Textarea — soft word wrap keeps long prompt lines readable: the
            inspection chips and cost model don't care about visual columns. */}
        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste or drop your raw prompt, system instructions, RAG context, or code here…"
          spellCheck={false}
          wrap="soft"
          aria-label="Raw prompt text input"
          className="relative z-10 flex-1 min-h-[300px] whitespace-pre-wrap break-words p-3 bg-transparent text-zinc-200 font-mono text-xs leading-6 resize-none outline-none placeholder:text-zinc-600 overflow-auto"
        />

        {/* Drag Overlay Hint */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-default/95 backdrop-blur-md border-2 border-dashed border-sky-400/60 m-2 rounded-xl pointer-events-none transition-all duration-150 ease-out-expo">
            <Upload className="w-8 h-8 text-sky-400 mb-2 animate-bounce motion-reduce:animate-none" aria-hidden="true" />
            <span className="text-sm font-medium text-zinc-200">
              Drop file to load content
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              .txt · .md · .json · .ts · .py · max 2 MB
            </span>
          </div>
        )}
      </div>

      {/* Editor Controls — Clear / Upload / Copy, one row directly under the
          textarea like Tiktokenizer */}
      <div className="flex items-center gap-1 border-t border-zinc-800 px-3 py-1.5">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.md,.json,.js,.ts,.tsx,.py,.html,.css"
          aria-label="Upload document file"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={clearText}
          disabled={!rawText}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-rose-400 hover:bg-surface-elevated"
          aria-label="Clear input text"
        >
          <X className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          <span>Clear</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated"
          aria-label="Upload File"
        >
          <Upload className="w-3.5 h-3.5 mr-1 text-zinc-400" aria-hidden="true" />
          <span>Upload</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!rawText}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated"
          aria-label="Copy input text"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-sky-400 mr-1" aria-hidden="true" />
          ) : (
            <Copy className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle/70 border-t border-surface-border text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">
              Chars:
            </span>
            <span className="text-zinc-200 font-medium tabular-nums">
              <NumberTicker value={characterCount} />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">
              Words:
            </span>
            <span className="text-zinc-200 font-medium tabular-nums">
              <NumberTicker value={wordCount} />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400 uppercase tracking-wider text-[10px]">
              Size:
            </span>
            <span className="text-zinc-200 font-medium tabular-nums">
              {formatBytes(byteCount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px]">
          <Code2 className="w-3 h-3 text-zinc-400" aria-hidden="true" />
          <span>UTF-8 · Word wrap</span>
        </div>
      </div>
    </div>
  );
});
