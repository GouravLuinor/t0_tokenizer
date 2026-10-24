import { COMPANY, FAMILY_TOOLS, TOOL } from "@/lib/site";
import { NorAiMark } from "./NorAiMark";
import { Wordmark } from "./TopBar";

const HERE = [
  ["#workspace", "Token counter"],
  ["#rate-board", "Rate board"],
  ["#minifier", "Prompt minifier"],
  ["#guide", "Tokenization guide"],
  ["#faq", "FAQ"],
];

export function SiteFooter({ linkBase = "" }: { linkBase?: string }) {
  const others = FAMILY_TOOLS.filter((t) => t.name !== TOOL.name);
  return (
    <footer className="bg-board text-board-ink">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-board-ink-2">
              Free token counter and LLM cost calculator. Your text stays in your browser.
            </p>
            <a href={COMPANY.url} className="mt-5 inline-flex items-center gap-2 text-[14px] text-board-ink hover:text-gold">
              <NorAiMark size={24} />
              Built by {COMPANY.name}
            </a>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-board-ink-2">{COMPANY.blurb}</p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
              <a href={COMPANY.contactUrl} className="font-medium text-board-ink underline decoration-gold hover:text-gold">Contact</a>
              <a href={COMPANY.aboutUrl} className="text-board-ink-2 hover:text-board-ink">Mission</a>
              <a href={COMPANY.toolsUrl} className="text-board-ink-2 hover:text-board-ink">All tools</a>
            </p>
          </div>

          <nav aria-labelledby="footer-here">
            <h2 id="footer-here" className="text-[13px] font-medium text-board-ink">
              TokenCraft
            </h2>
            <ul className="mt-3 space-y-2">
              {HERE.map(([href, label]) => (
                <li key={href}>
                  <a href={`${linkBase}${href}`} className="text-[14px] text-board-ink-2 hover:text-board-ink">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-family">
            <h2 id="footer-family" className="text-[13px] font-medium text-board-ink">
              More free tools
            </h2>
            <ul className="mt-3 space-y-2">
              {others.map(({ name, blurb, href }) => (
                <li key={href}>
                  <a href={href} className="group text-[14px]">
                    <span className="text-board-ink group-hover:text-gold">{name}</span>
                    <span className="text-board-ink-2"> · {blurb}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-board-rule pt-5 text-[12px] text-board-ink-2 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY.name}</p>
          <p>
            Prices from{" "}
            <a href="https://openrouter.ai/models" className="underline hover:text-board-ink" rel="noopener noreferrer">
              OpenRouter
            </a>
            . Counts for non-OpenAI models are o200k_base estimates.
          </p>
        </div>
      </div>
    </footer>
  );
}
