"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
  fromColor?: string;
  toColor?: string;
}

export function AnimatedGradientText({
  children,
  className,
  fromColor = "#10B981",
  toColor = "#06B6D4",
  ...props
}: AnimatedGradientTextProps) {
  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r bg-clip-text text-transparent font-semibold animate-gradient-flow",
        className
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${fromColor} 0%, ${toColor} 50%, ${fromColor} 100%)`,
        backgroundSize: "200% 200%",
      }}
      {...props}
    >
      {children}
    </span>
  );
}
