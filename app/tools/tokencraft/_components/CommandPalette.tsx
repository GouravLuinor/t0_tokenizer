"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  useTokenCraftStore,
  PROMPT_PRESETS,
  type VisualViewMode,
} from "../_store/useTokenCraftStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keycap } from "@/components/ui/keycap";
import { ShinyText } from "@/components/ui/shiny-text";
import {
  Cpu,
  Bookmark,
  Minimize2,
  Copy,
  Trash2,
  Layers,
  Undo2,
  Command,
} from "lucide-react";

interface CommandItem {
  id: string;
  category: "Models" | "Presets" | "Actions" | "View Modes";
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  shortcut?: string[];
  action: () => void;
}

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setSelectedModel,
    modelsRegistry,
    loadPreset,
    generateMinifyPreview,
    revertMinification,
    previousText,
    clearText,
    setViewMode,
    tokenChunks,
  } = useTokenCraftStore();

  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Global keydown listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // Models
    Object.entries(modelsRegistry).forEach(([key, model]) => {
      list.push({
        id: `model-${key}`,
        category: "Models",
        title: `Switch Model: ${model.name}`,
        subtitle: `${model.provider} • ${model.family} • ${model.badgeText} context`,
        icon: Cpu,
        action: () => {
          setSelectedModel(key);
          setCommandPaletteOpen(false);
        },
      });
    });

    // Presets
    Object.entries(PROMPT_PRESETS).forEach(([key, preset]) => {
      list.push({
        id: `preset-${key}`,
        category: "Presets",
        title: `Load Preset: ${preset.label}`,
        subtitle: preset.description,
        icon: Bookmark,
        action: () => {
          loadPreset(key);
          setCommandPaletteOpen(false);
        },
      });
    });

    // View Modes
    const modes: { mode: VisualViewMode; label: string; sub: string }[] = [
      {
        mode: "chips",
        label: "BPE Boundary Chips",
        sub: "5-color cyclic token boundaries",
      },
      {
        mode: "ids",
        label: "Token ID Stream",
        sub: "Sequential integer token indices",
      },
      {
        mode: "heatmap",
        label: "Byte Density Heatmap",
        sub: "UTF-8 multi-byte weight visualization",
      },
      {
        mode: "analytics",
        label: "Vocabulary Analytics",
        sub: "Token distribution and compression efficiency",
      },
    ];

    modes.forEach((m) => {
      list.push({
        id: `mode-${m.mode}`,
        category: "View Modes",
        title: `View Mode: ${m.label}`,
        subtitle: m.sub,
        icon: Layers,
        action: () => {
          setViewMode(m.mode);
          setCommandPaletteOpen(false);
        },
      });
    });

    // Actions
    list.push({
      id: "action-minify",
      category: "Actions",
      title: "Minify Prompt & Inspect Diff",
      subtitle: "Execute AST cleanup, comment stripping & whitespace reduction",
      icon: Minimize2,
      shortcut: ["⌘", "M"],
      action: () => {
        setCommandPaletteOpen(false);
        generateMinifyPreview();
      },
    });

    if (previousText) {
      list.push({
        id: "action-revert",
        category: "Actions",
        title: "Revert Last Minification",
        subtitle: "Undo changes and restore previous text",
        icon: Undo2,
        shortcut: ["⌘", "Z"],
        action: () => {
          revertMinification();
          setCommandPaletteOpen(false);
        },
      });
    }

    list.push({
      id: "action-copy-tokens",
      category: "Actions",
      title: "Copy Token IDs Array",
      subtitle: `Export ${tokenChunks.length} token IDs as JSON array`,
      icon: Copy,
      shortcut: ["⌘", "C"],
      action: async () => {
        const ids = tokenChunks.map((t) => t.id);
        await navigator.clipboard.writeText(JSON.stringify(ids));
        setCommandPaletteOpen(false);
      },
    });

    list.push({
      id: "action-clear",
      category: "Actions",
      title: "Clear Editor",
      subtitle: "Erase raw text and reset token counters",
      icon: Trash2,
      action: () => {
        clearText();
        setCommandPaletteOpen(false);
      },
    });

    return list;
  }, [
    modelsRegistry,
    setSelectedModel,
    loadPreset,
    setViewMode,
    generateMinifyPreview,
    revertMinification,
    previousText,
    clearText,
    tokenChunks,
    setCommandPaletteOpen,
  ]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;
    const q = search.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.action();
      }
    }
  };

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-surface-border bg-surface-default shadow-elevated rounded-2xl glass-edge">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>

        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-border bg-surface-subtle/80">
          <Command className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Type a command or search actions…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label="Command palette search"
            className="flex-1 bg-transparent text-sm font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <Keycap size="xs">ESC</Keycap>
        </div>

        {/* Commands List (Raycast 6px rows, border-brighten) */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1" role="listbox">
          {filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-zinc-500">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-[6px] cursor-pointer transition-all duration-100 ${
                    isSelected
                      ? "bg-surface-elevated text-zinc-100 border border-surface-borderHover shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                      : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-md border transition-colors ${
                        isSelected
                          ? "bg-surface-default border-emerald-500/30 text-emerald-400"
                          : "bg-surface-subtle border-surface-border text-zinc-400"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className={`text-xs font-medium ${
                          isSelected ? "text-zinc-100 font-semibold" : "text-zinc-300"
                        }`}
                      >
                        {cmd.title}
                      </span>
                      {cmd.subtitle && (
                        <span className="text-[10px] font-mono text-zinc-500">
                          {cmd.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {cmd.shortcut ? (
                      <div className="flex items-center gap-1">
                        {cmd.shortcut.map((key, i) => (
                          <Keycap key={i} size="xs">
                            {key}
                          </Keycap>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider bg-surface-subtle px-1.5 py-0.5 rounded border border-surface-border">
                        {cmd.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-surface-subtle/80 border-t border-surface-border text-[10px] font-mono text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Keycap size="xs">↑</Keycap>
              <Keycap size="xs">↓</Keycap>
              <span className="ml-1 text-zinc-400">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <Keycap size="xs">↵</Keycap>
              <span className="ml-1 text-zinc-400">Select</span>
            </span>
          </div>
          <ShinyText shineColor="emerald" className="text-[10px]">
            TokenCraft Studio
          </ShinyText>
        </div>
      </DialogContent>
    </Dialog>
  );
}

