import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "emerald" | "cyan" | "violet" | "amber" | "rose" | "outline";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-surface-elevated text-zinc-300 border-surface-border",
    emerald:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cyan: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    violet:
      "bg-violet-500/10 text-violet-300 border-violet-500/20",
    amber:
      "bg-amber-500/10 text-amber-300 border-amber-500/20",
    rose:
      "bg-rose-500/10 text-rose-300 border-rose-500/20",
    outline:
      "bg-transparent text-zinc-400 border-surface-border",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
