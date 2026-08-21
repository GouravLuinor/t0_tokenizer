"use client";

import { useEffect } from "react";
import { useTokenCraftStore } from "../_store/useTokenCraftStore";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useGlobalShortcuts() {
  const commandPaletteOpen = useTokenCraftStore(
    (s) => s.commandPaletteOpen
  );
  const setCommandPaletteOpen = useTokenCraftStore(
    (s) => s.setCommandPaletteOpen
  );
  const generateMinifyPreview = useTokenCraftStore(
    (s) => s.generateMinifyPreview
  );
  const revertMinification = useTokenCraftStore(
    (s) => s.revertMinification
  );
  const clearText = useTokenCraftStore((s) => s.clearText);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      const key = e.key.toLowerCase();

      if (key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        return;
      }

      // Text-editing safety: never hijack shortcuts while typing
      if (isTypingTarget(e.target)) return;

      if (key === "m") {
        e.preventDefault();
        generateMinifyPreview();
      } else if (key === "z") {
        e.preventDefault();
        revertMinification();
      } else if (key === "backspace") {
        e.preventDefault();
        clearText();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    commandPaletteOpen,
    setCommandPaletteOpen,
    generateMinifyPreview,
    revertMinification,
    clearText,
  ]);
}
