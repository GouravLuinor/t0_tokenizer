"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("TokenCraft render error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-md rounded-xl border border-surface-border bg-surface-default shadow-elevated glass-edge px-8 py-10">
        <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-400" aria-hidden="true" />
        </div>
        <h1 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-medium mb-2">
          Something broke in the engine room
        </h1>
        <p className="text-xs font-mono text-zinc-400 mb-1">
          An unexpected client-side error interrupted TokenCraft.
        </p>
        <p className="text-[11px] font-mono text-zinc-500 mb-8 break-all">
          {error.digest ? `ref: ${error.digest}` : "ref: local"}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            aria-label="Retry rendering"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold font-mono hover:bg-white transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            Retry
          </button>
          <a
            href="/tools/tokencraft"
            aria-label="Return to a fresh workspace"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-surface-border bg-surface-default text-xs font-mono text-zinc-300 hover:text-white hover:border-surface-borderHover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Home className="w-3.5 h-3.5" aria-hidden="true" />
            Fresh Workspace
          </a>
        </div>
      </div>
    </div>
  );
}
