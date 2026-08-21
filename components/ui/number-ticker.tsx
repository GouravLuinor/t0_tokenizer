"use client";

import React, { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberTickerProps {
  value: number;
  direction?: "up" | "down";
  delay?: number;
  className?: string;
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  formatter?: (val: number) => string;
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  formatter,
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 120,
  });
  const isInView = useInView(ref, { once: false, margin: "0px" });
  const prevValueRef = useRef<number>(direction === "down" ? value : 0);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [motionValue, isInView, delay, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        if (formatter) {
          ref.current.textContent = `${prefix}${formatter(latest)}${suffix}`;
        } else {
          const formatted = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)));
          ref.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      }
    });

    return () => unsubscribe();
  }, [springValue, decimalPlaces, prefix, suffix, formatter]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tabular-nums tracking-tight font-mono",
        className
      )}
    >
      {prefix}
      {formatter
        ? formatter(value)
        : Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(value)}
      {suffix}
    </span>
  );
}
