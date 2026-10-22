"use client";

import { useEffect, useRef, useState } from "react";

const SETTLE_MS = 220;

/**
 * Renders a figure that rolls in once a change has settled, like a rate
 * board re-pricing. Only the characters that changed move; the rest stay
 * still. Reduced-motion users get an instant swap (see `.roll` in CSS).
 */
export function RollingFigure({ value, className = "" }: { value: string; className?: string }) {
  const [shown, setShown] = useState(value);
  const [version, setVersion] = useState(0);
  const prev = useRef(value);

  useEffect(() => {
    if (value === shown) return;
    const t = setTimeout(() => {
      prev.current = shown;
      setShown(value);
      setVersion((v) => v + 1);
    }, SETTLE_MS);
    return () => clearTimeout(t);
  }, [value, shown]);

  const before = prev.current;
  const chars = Array.from(shown);
  const offset = chars.length - Array.from(before).length;

  return (
    <span className={`tnum inline-flex overflow-hidden ${className}`} aria-label={value}>
      {chars.map((ch, i) => {
        const was = Array.from(before)[i - offset];
        const changed = version > 0 && was !== ch;
        return (
          <span key={changed ? `${i}-${version}` : `${i}`} className={changed ? "roll" : undefined} aria-hidden="true">
            {ch}
          </span>
        );
      })}
    </span>
  );
}
