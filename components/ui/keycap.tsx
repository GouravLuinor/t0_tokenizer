"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface KeycapProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md";
}

export function Keycap({
  children,
  className,
  size = "sm",
  ...props
}: KeycapProps) {
  const sizeClasses = {
    xs: "h-4 min-w-4 px-1 text-[9px]",
    sm: "h-5 min-w-5 px-1.5 text-[10px]",
    md: "h-6 min-w-6 px-2 text-[11px]",
  };

  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center font-mono font-medium select-none rounded-[4px] border border-rule-2 border-b-2 bg-sheet text-ink-2",
        "transition-transform active:translate-y-[0.5px]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
