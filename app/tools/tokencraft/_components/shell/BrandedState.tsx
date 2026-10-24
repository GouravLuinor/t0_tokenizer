import type { ReactNode } from "react";
import { COMPANY, FAMILY_TOOLS, TOOL } from "@/lib/site";
import { NorAiMark } from "./NorAiMark";
import { Wordmark } from "./TopBar";

/** Error and 404 frame: the board, the maker, and a way out to the company and the sibling tools. */
export function BrandedState({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  const others = FAMILY_TOOLS.filter((t) => t.name !== TOOL.name);
  return (
    <main className="min-h-screen bg-board text-board-ink">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-12">
        <p className="flex items-center gap-3">
          <a href="/tools/tokencraft" aria-label="TokenCraft home" className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            <Wordmark />
          </a>
          <span className="text-[12px] text-board-ink-2">by</span>
          <a href={COMPANY.url} className="inline-flex items-center gap-1.5 text-[14px] font-medium hover:text-gold">
            <NorAiMark size={22} /> Nor AI
          </a>
        </p>
        <h1 className="mt-8 font-display text-[40px] font-bold uppercase leading-none tracking-[0.02em]">{title}</h1>
        <div className="mt-3 text-[15px] leading-relaxed text-board-ink-2">{children}</div>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">{actions}</div>
        <div className="mt-10 border-t border-board-rule pt-4 text-[13px] text-board-ink-2">
          <p>
            <a href={COMPANY.contactUrl} className="font-medium text-board-ink underline decoration-gold hover:text-gold">
              Talk to an engineer
            </a>{" "}
            · <a href={COMPANY.toolsUrl} className="underline hover:text-board-ink">All Nor AI tools</a>
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {others.map((t) => (
              <li key={t.href}>
                <a href={t.href} className="hover:text-board-ink">{t.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
