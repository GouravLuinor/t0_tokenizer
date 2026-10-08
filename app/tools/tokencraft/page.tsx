import { Cpu, ShieldCheck, Lock } from "lucide-react";
import { SiteHeader } from "./_components/SiteHeader";
import { Workstation } from "./_components/Workstation";
import { WorkloadSection } from "./_components/WorkloadSection";
import { KnowledgeHub } from "./_components/KnowledgeHub";
import { FaqSection } from "./_components/FaqSection";
import { StudioFooter } from "./_components/StudioFooter";
import { TooltipProvider } from "@/components/ui/tooltip";

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "No cloud storage",
    detail: "Your prompts never leave the browser",
    className: "border-emerald-500/20 text-emerald-300/90",
  },
  {
    icon: Cpu,
    label: "Client-side BPE",
    detail: "Exact o200k & cl100k token boundaries",
    className: "border-sky-500/20 text-sky-300/90",
  },
  {
    icon: Lock,
    label: "No account required",
    detail: "Free forever, no paywall, no ads",
    className: "border-white/10 text-zinc-300/90",
  },
] as const;

export default function TokenCraftPage() {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-dvh bg-background text-zinc-100 selection:bg-sky-500/20">
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:px-3 focus:py-1.5 focus:rounded-lg focus:bg-zinc-100 focus:text-zinc-950 focus:text-xs focus:font-mono focus:shadow-elevated"
      >
        Skip to workspace
      </a>

      <SiteHeader />

      <main id="main" className="relative w-full">
        {/* Section 1 — Hero Workstation */}
        <section
          aria-label="Token Crafting Workstation"
          className="mx-auto w-full max-w-6xl px-4 pt-12 pb-16 md:px-6 md:pt-16 lg:px-8"
        >
          <header className="mb-10 md:mb-12 max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
              AI Tokenizer &amp; Token Cost Calculator
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
              Count tokens with the exact OpenAI BPE encodings, see where every
              token boundary falls, and price your prompt across{" "}
              <span className="text-zinc-200">95 live models</span> — all
              computed in your browser.
            </p>

            <ul className="mt-7 flex flex-wrap gap-3">
              {TRUST_BADGES.map(({ icon: Icon, label, detail, className }) => (
                <li
                  key={label}
                  className={`flex items-center gap-2.5 rounded-xl border bg-surface-subtle/40 px-3.5 py-2.5 ${className}`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">
                      {label}
                    </span>
                    <span className="text-xs font-normal leading-tight text-zinc-400">
                      {detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </header>

          <Workstation />
        </section>

        {/* Section 2 — Workload Budget Calculator */}
        <WorkloadSection />

        {/* Section 3 — Knowledge Hub */}
        <KnowledgeHub />

        {/* Section 4 — FAQ */}
        <FaqSection />
      </main>

      {/* Section 5 — Studio Footer */}
      <StudioFooter />
      </div>
    </TooltipProvider>
  );
}
