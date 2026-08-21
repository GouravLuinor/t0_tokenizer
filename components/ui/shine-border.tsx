"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string[];
  className?: string;
  children?: React.ReactNode;
}

export function ShineBorder({
  borderRadius = 12,
  borderWidth = 1,
  duration = 10,
  color = ["#10B981", "#06B6D4", "#10B981"],
  className,
  children,
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
        } as React.CSSProperties
      }
      className={cn(
        "relative rounded-[--border-radius] p-[1px] overflow-hidden",
        className
      )}
    >
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--duration": `${duration}s`,
            "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            "--background-radial-gradient": `radial-gradient(transparent,transparent, ${color.join(",")},transparent,transparent)`,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute inset-0 size-full rounded-[inherit] p-[--border-width]",
          "before:absolute before:inset-0 before:size-full before:rounded-[inherit] before:animate-spin before:[animation-duration:var(--duration)] before:[background-image:var(--background-radial-gradient)]",
          "[mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:var(--mask-linear-gradient)]"
        )}
      />
      {children}
    </div>
  );
}
