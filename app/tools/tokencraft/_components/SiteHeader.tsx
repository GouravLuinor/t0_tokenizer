import { SignInButton } from "./auth/SignInButton";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-lg border border-surface-border bg-surface-default font-mono text-sm font-extrabold tracking-tight text-sky-400 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            TC
          </div>
          <div className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold tracking-tight text-zinc-100">
              TokenCraft
            </span>
            <span className="hidden truncate text-xs font-mono text-zinc-400 sm:block">
              BPE Tokenizer &amp; Token Cost Calculator
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <SignInButton />
        </div>
      </div>
    </header>
  );
}
