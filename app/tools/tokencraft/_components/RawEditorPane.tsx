"use client";

import React, { useRef, useState } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";
import { Button } from "@/components/ui/button";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { DotGrid } from "@/components/ui/dot-grid";
import { NumberTicker } from "@/components/ui/number-ticker";
import {
  Copy,
  Trash2,
  Upload,
  Check,
  FileText,
  Code2,
} from "lucide-react";
import { formatBytes, formatNumber } from "@/lib/utils";

export function RawEditorPane() {
  const {
    rawText,
    setRawText,
    clearText,
    characterCount,
    wordCount,
    byteCount,
  } = useTokenCraftStore();

  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = rawText.split("\n");
  const lineCount = rawText ? lines.length : 0;

  const handleCopy = async () => {
    if (!rawText) return;
    await navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <SpotlightCard
      spotlightColor="rgba(16, 185, 129, 0.08)"
      spotlightSize={400}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col h-[580px] rounded-xl border transition-all duration-200 bg-surface-default ${
        isDragging
          ? "border-emerald-400/80 bg-surface-elevated ring-2 ring-emerald-500/20"
          : "border-surface-border hover:border-surface-borderHover"
      }`}
    >
      {/* Pane Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border bg-surface-subtle/70 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-medium">
            Raw Input Editor
          </span>
          <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
            ({lineCount} {lineCount === 1 ? "line" : "lines"})
          </span>
        </div>

        {/* Editor Actions */}
        <div className="flex items-center gap-1">
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
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated"
            title="Upload File"
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
            title="Copy Text"
            aria-label="Copy input text"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={clearText}
            disabled={!rawText}
            className="h-7 px-2 text-xs text-zinc-400 hover:text-rose-400 hover:bg-surface-elevated"
            title="Clear Text"
            aria-label="Clear input text"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* Editor Body: Gutter + Monospace Textarea */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Empty State Dot Grid Backdrop */}
        {!rawText && (
          <DotGrid
            dotSize={1.2}
            gap={24}
            baseColor="#202B46"
            className="opacity-60"
          />
        )}

        {/* Line Numbers Gutter */}
        <div className="w-11 py-3 bg-surface-subtle/50 border-r border-surface-border select-none text-right pr-2.5 text-[11px] font-mono text-zinc-600 overflow-hidden leading-6 tabular-nums">
          {Array.from({ length: Math.max(lineCount, 22) }).map((_, idx) => (
            <div key={idx} className="h-6">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste or drop your raw prompt, system instructions, RAG context, or code here…"
          spellCheck={false}
          aria-label="Raw prompt text input"
          className="relative z-10 flex-1 p-3 bg-transparent text-zinc-200 font-mono text-xs leading-6 resize-none focus:outline-none placeholder:text-zinc-600 overflow-y-auto"
        />

        {/* Drag Overlay Hint */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-default/95 backdrop-blur-md border-2 border-dashed border-emerald-400/60 m-2 rounded-xl pointer-events-none transition-all">
            <Upload className="w-8 h-8 text-emerald-400 mb-2 animate-bounce" aria-hidden="true" />
            <span className="text-sm font-medium text-zinc-200">
              Drop file to load content
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Supports .txt, .md, .json, .ts, .py
            </span>
          </div>
        )}
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle/70 border-t border-surface-border text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">
              Chars:
            </span>
            <span className="text-zinc-200 font-medium tabular-nums">
              <NumberTicker value={characterCount} />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">
              Words:
            </span>
            <span className="text-zinc-200 font-medium tabular-nums">
              <NumberTicker value={wordCount} />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-500 uppercase tracking-wider text-[10px]">
              Size:
            </span>
            <span className="text-zinc-200 font-medium tabular-nums">
              {formatBytes(byteCount)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px]">
          <Code2 className="w-3 h-3 text-zinc-400" aria-hidden="true" />
          <span>UTF-8 Monospace</span>
        </div>
      </div>
    </SpotlightCard>
  );
}

