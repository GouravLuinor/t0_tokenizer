"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

/**
 * Mouse-tracking radial spotlight. The gradient position is written to CSS
 * custom properties via refs — zero React re-renders while tracking.
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(16, 185, 129, 0.08)",
  spotlightSize = 350,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!divRef.current || !spotlightRef.current || isFocused) return;

      const { clientX, clientY } = e;
      if (frameRef.current !== null) return; // coalesce to one write per frame

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const div = divRef.current;
        const spot = spotlightRef.current;
        if (!div || !spot) return;

        const rect = div.getBoundingClientRect();
        spot.style.setProperty("--spot-x", `${clientX - rect.left}px`);
        spot.style.setProperty("--spot-y", `${clientY - rect.top}px`);
        spot.style.opacity = "1";
      });
    },
    [isFocused]
  );

  const setOpacity = useCallback((value: "0" | "1") => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = value;
    }
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity("1");
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity("0");
  };

  const handleMouseLeave = () => {
    setOpacity("0");
  };

  const handleMouseEnter = () => {
    setOpacity("1");
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-xl border border-surface-border bg-surface-default overflow-hidden transition-[border-color,background-color] duration-150",
        className
      )}
      {...props}
    >
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 rounded-[inherit]"
        style={
          {
            "--spot-x": "0px",
            "--spot-y": "0px",
            background:
              "radial-gradient(" +
              spotlightSize +
              "px circle at var(--spot-x) var(--spot-y), " +
              spotlightColor +
              ", transparent 80%)",
          } as React.CSSProperties
        }
      />
      {children}
    </div>
  );
}
