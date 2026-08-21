"use client";

import React from "react";
import {
  useTokenCraftStore,
  PROMPT_PRESETS,
} from "../_store/useTokenCraftStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { Keycap } from "@/components/ui/keycap";
import {
  Minimize2,
  ChevronDown,
  Bookmark,
  Cpu,
  Command,
  Undo2,
} from "lucide-react";

export function TopToolbar() {
  const {
    selectedModel,
    setSelectedModel,
    modelsRegistry,
    loadPreset,
    generateMinifyPreview,
    revertMinification,
    previousText,
    setCommandPaletteOpen,
    rawText,
    isProcessing,
  } = useTokenCraftStore();

  const currentModel =
    modelsRegistry[selectedModel] ||
    Object.values(modelsRegistry)[0] || {
      id: "claude-sonnet-5",
      name: "Claude Sonnet 5",
      provider: "Anthropic",
      family: "Claude BPE",
      contextWindow: 1000000,
      inputCostPer1M: 2.0,
      cachedInputCostPer1M: 0.2,
      outputCostPer1M: 10.0,
      badgeText: "1.0M",
    };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-3.5 border border-surface-border bg-surface-subtle/80 backdrop-blur-md rounded-xl glass-edge-subtle">
      {/* Brand & App Identifier */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-default border border-surface-border text-sky-400 font-mono font-extrabold text-sm tracking-tight shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] select-none">
          TC
        </div>
        <div>
          <div className="flex items-center gap-2">
            <AnimatedGradientText
              fromColor="#38BDF8"
              toColor="#06B6D4"
              className="text-sm font-semibold tracking-tight"
            >
              TokenCraft
            </AnimatedGradientText>
          </div>
          <p className="text-xs text-zinc-400 font-mono">
            BPE Tokenizer & Multi-Model Cost Engine
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Command Palette Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCommandPaletteOpen(true)}
          className="gap-2 bg-surface-default border-surface-border text-xs text-zinc-300 hover:text-zinc-100 hover:border-surface-borderHover h-8"
          aria-label="Open Command Palette (Cmd+K)"
        >
          <Command className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          <span className="hidden sm:inline font-mono text-xs">Commands</span>
          <div className="hidden md:flex items-center gap-0.5">
            <Keycap size="xs">⌘</Keycap>
            <Keycap size="xs">K</Keycap>
          </div>
        </Button>

        {/* Model Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-surface-default border-surface-border font-mono text-xs text-zinc-200 hover:text-white hover:border-surface-borderHover h-8"
              aria-label={`Select Tokenizer Model, currently ${currentModel.name}`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" />
              <span>{currentModel.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-zinc-300 border border-surface-border">
                {currentModel.badgeText}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto bg-surface-default border-surface-border shadow-elevated">
            <DropdownMenuLabel className="text-xs font-mono text-zinc-400">
              Active Production Models (2026)
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-surface-border" />
            {Object.entries(modelsRegistry).map(([key, model]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => setSelectedModel(key)}
                className="flex items-center justify-between text-xs py-2 cursor-pointer hover:bg-surface-elevated focus:bg-surface-elevated"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-200">{model.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {model.provider} • {model.family}
                  </span>
                </div>
                <Badge
                  variant={selectedModel === key ? "default" : "outline"}
                  className="text-[10px] px-1.5"
                >
                  {model.badgeText}
                </Badge>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Preset Loader */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-surface-default border-surface-border text-xs text-zinc-300 hover:text-white h-8"
              aria-label="Load preset prompts"
            >
              <Bookmark className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <span className="font-mono">Presets</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-surface-default border-surface-border shadow-elevated">
            <DropdownMenuLabel className="text-xs font-mono text-zinc-400">
              Sample Prompts
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-surface-border" />
            {Object.entries(PROMPT_PRESETS).map(([key, preset]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => loadPreset(key)}
                className="flex flex-col items-start gap-0.5 text-xs py-2 cursor-pointer hover:bg-surface-elevated focus:bg-surface-elevated"
              >
                <span className="font-medium text-zinc-200">{preset.label}</span>
                <span className="text-[10px] text-zinc-400 line-clamp-1">
                  {preset.description}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Revert Minification Button (if available) */}
        {previousText !== null && (
          <Button
            variant="outline"
            size="sm"
            onClick={revertMinification}
            className="gap-1.5 text-xs font-mono text-amber-400 border-amber-500/30 hover:bg-amber-500/10 h-8"
            title="Revert to pre-minified prompt"
            aria-label="Undo last minification"
          >
            <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Undo Minify</span>
          </Button>
        )}

        {/* Minify Action - Clean Compiler Optimizer aesthetic */}
        <Button
          variant="default"
          size="sm"
          onClick={generateMinifyPreview}
          disabled={!rawText || isProcessing}
          className="gap-1.5 text-xs font-mono bg-zinc-100 text-zinc-950 hover:bg-white font-semibold h-8 transition-transform active:scale-[0.97]"
          aria-label="Minify prompt"
        >
          <Minimize2 className="w-3.5 h-3.5 text-zinc-950" aria-hidden="true" />
          <span>Minify Prompt</span>
        </Button>
      </div>
    </header>
  );
}

