"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
  shineColor?: "white" | "emerald" | "cyan";
  speed?: number;
}

export function ShinyText({
  children,
  className,
  shineColor = "white",
  ...props
}: ShinyTextProps) {
  const colorClass =
    shineColor === "emerald"
      ? "shiny-text-emerald"
      : "shiny-text";

  return (
    <span
      className={cn(
        "inline-block font-mono select-none",
        colorClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
