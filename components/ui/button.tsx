import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "cyan" | "emerald" | "danger";
  size?: "sm" | "default" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-medium transition-[background-color,border-color,color,transform] duration-150 select-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] motion-reduce:transition-none touch-manipulation";

    const variantStyles = {
      default:
        "bg-zinc-100 text-zinc-950 hover:bg-white border border-transparent shadow-sm focus-visible:ring-zinc-400",
      outline:
        "bg-surface-default text-zinc-200 border border-surface-border hover:bg-surface-elevated hover:border-surface-borderHover hover:text-white focus-visible:ring-zinc-400",
      ghost:
        "bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-surface-elevated focus-visible:ring-zinc-600",
      cyan:
        "bg-surface-elevated text-zinc-100 border border-surface-border hover:bg-surface-default hover:border-surface-borderHover focus-visible:ring-zinc-400",
      emerald:
        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 focus-visible:ring-emerald-500/40",
      danger:
        "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 focus-visible:ring-rose-500/40",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs",
      default: "h-9 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin motion-reduce:animate-none mr-1" aria-hidden="true" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
