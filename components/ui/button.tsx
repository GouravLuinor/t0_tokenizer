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
      "inline-flex items-center justify-center gap-2 font-medium transition-[background-color,border-color,color,transform] duration-150 select-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] motion-reduce:transition-none touch-manipulation";

    const variantStyles = {
      default:
        "bg-board text-board-ink hover:bg-board-2 border border-transparent",
      outline:
        "bg-sheet text-ink border border-rule hover:border-rule-2 hover:bg-panel",
      ghost:
        "bg-transparent text-ink-2 hover:text-ink hover:bg-panel",
      cyan:
        "bg-panel text-ink border border-rule hover:border-rule-2",
      emerald:
        "bg-gold text-board hover:brightness-105 border border-transparent",
      danger:
        "bg-danger-wash text-danger border border-danger/30 hover:border-danger/60",
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
