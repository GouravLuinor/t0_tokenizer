import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-zinc-100 flex items-center justify-center p-6">
      <div className="flex flex-col items-center text-center max-w-md rounded-xl border border-surface-border bg-surface-default shadow-elevated glass-edge px-8 py-10">
        <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <FileQuestion className="w-6 h-6 text-sky-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold tracking-[-0.022em] text-zinc-100 mb-2">
          404 — Uncharted territory
        </h1>
        <p className="text-xs font-mono text-zinc-400 mb-8">
          This route doesn&apos;t exist. The tokenizer, however, does.
        </p>
        <Link
          href="/tools/tokencraft"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold font-mono hover:bg-white transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Open TokenCraft
        </Link>
      </div>
    </div>
  );
}
