"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, "aria-label": ariaLabel, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center touch-manipulation",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface-elevated">
      <SliderPrimitive.Range className="absolute h-full bg-zinc-300" />
    </SliderPrimitive.Track>
    {/* The thumb carries role="slider", so it is the element that needs the
        accessible name — a label on the root does not reach it. */}
    <SliderPrimitive.Thumb
      className="relative block h-3.5 w-3.5 rounded-full border border-surface-border bg-zinc-100 shadow-sm transition-[transform,background-color] duration-150 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 before:absolute before:-inset-[6px] before:rounded-full before:content-['']"
      aria-label={ariaLabel}
      aria-live="off"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
