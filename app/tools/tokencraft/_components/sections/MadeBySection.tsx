import { ArrowRight } from "lucide-react";
import { COMPANY } from "@/lib/site";
import { NorAiMark } from "../shell/NorAiMark";

/** Sits after the rate board and comparison, where a visitor has just priced a prompt and may be pricing a product. */
export function MadeBySection() {
  return (
    <section id="made-by" aria-labelledby="made-by-title" className="border-b border-rule">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 py-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:px-10 lg:py-16">
        <h2 id="made-by-title" className="flex items-center gap-3 font-display text-[32px] font-bold uppercase leading-none tracking-[0.02em] text-ink sm:text-[40px]">
          <NorAiMark size={40} className="border border-rule" />
          Made by Nor AI
        </h2>
        <div className="max-w-[64ch]">
          <p className="text-[16px] leading-relaxed text-ink-2">
            TokenCraft is a free tool from {COMPANY.name}, an engineering studio in Ghazipur, Uttar Pradesh. We build custom AI, web and 3D
            software that runs in your own infrastructure, and you keep the code.
          </p>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-2">
            Pricing an LLM feature for real traffic, or deciding which model a pipeline should run on? Bring the numbers from the rate board and
            talk to the engineers who would build it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={COMPANY.contactUrl}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-board px-5 text-[15px] font-semibold text-board-ink transition-colors hover:bg-board-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Talk to an engineer
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={COMPANY.aboutUrl}
              className="inline-flex h-11 items-center rounded-md border border-rule-2 px-5 text-[15px] font-medium text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              About Nor AI
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
