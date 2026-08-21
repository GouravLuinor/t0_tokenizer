"use client";

import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface DotGridProps extends React.HTMLAttributes<HTMLDivElement> {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  className?: string;
  fadeEdges?: boolean;
}

export function DotGrid({
  dotSize = 1.5,
  gap = 20,
  baseColor = "#202B46",
  className,
  fadeEdges = true,
  ...props
}: DotGridProps) {
  const patternId = useId();
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        fadeEdges && "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]",
        className
      )}
      {...props}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={gap / 2}
              cy={gap / 2}
              r={dotSize}
              fill={baseColor}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}
