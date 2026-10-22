import { Wordmark } from "./TopBar";

/** The Nor AI family: every tool links to the others, minus itself. */
const FAMILY = [
  ["SchemaCraft", "JSON to Zod, Pydantic and TypeScript types", "https://schema.norai.tech"],
  ["RegexCraft", "Regex tester with plain-English explanations", "https://regex.norai.tech"],
  ["Judgewright", "Calibrate your LLM judge against human labels", "https://judgewright.norai.tech"],
  ["Anchorflow", "Pin and audit GitHub Actions workflows", "https://anchor.norai.tech"],
  ["Smart Rozgar", "Sarkari job alerts in Hindi and English", "https://rozgar.norai.tech"],
];

const HERE = [
  ["#workspace", "Token counter"],
  ["#rate-board", "Rate board"],
  ["#minifier", "Prompt minifier"],
  ["#guide", "Tokenization guide"],
  ["#faq", "FAQ"],
];

export function SiteFooter({ linkBase = "" }: { linkBase?: string }) {
  return (
    <footer className="bg-board text-board-ink">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 md:px-8 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-board-ink-2">
              Free token counter and LLM cost calculator. Your text stays in your browser.
            </p>
            <a
              href="https://norai.tech"
              className="mt-5 inline-flex items-center gap-2 text-[14px] text-board-ink hover:text-gold"
            >
              <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-[4px] bg-board-ink font-display text-[13px] font-bold text-board">
                N
              </span>
              Built by Nor AI
            </a>
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
              {FAMILY.map(([name, what, href]) => (
                <li key={href}>
                  <a href={href} className="group text-[14px]">
                    <span className="text-board-ink group-hover:text-gold">{name}</span>
                    <span className="text-board-ink-2"> · {what}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-board-rule pt-5 text-[12px] text-board-ink-2 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Nor AI</p>
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
