import { COMPANY } from "@/lib/site";
import { NorAiMark } from "./NorAiMark";
import { SignInButton } from "../auth/SignInButton";
import { RatesStamp } from "./RatesStamp";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "#workspace", label: "Counter" },
  { href: "#rate-board", label: "Rate board" },
  { href: "#minifier", label: "Minifier" },
  { href: "#guide", label: "Guide" },
  { href: "#faq", label: "FAQ" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-display text-[22px] font-bold uppercase leading-none tracking-[0.06em] ${className}`}
    >
      Token<span className="text-gold">Craft</span>
    </span>
  );
}

/** `linkBase` prefixes the section anchors when the bar sits on another page. */
export function TopBar({ home = "/tools/tokencraft", linkBase = "" }: { home?: string; linkBase?: string }) {
  return (
    <header className="sticky top-0 z-50 bg-board text-board-ink">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center gap-2 px-4 sm:gap-4 md:gap-6 md:px-8 lg:px-10">
        <a
          href={home}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          aria-label="TokenCraft home"
        >
          <Wordmark />
        </a>
        <a
          href={COMPANY.url}
          aria-label={`TokenCraft is made by ${COMPANY.name}`}
          className="flex shrink-0 items-center gap-1.5 rounded-sm border-l border-board-rule pl-2.5 sm:pl-3 text-[12px] text-board-ink-2 transition-colors hover:text-board-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span>by</span>
          <NorAiMark size={22} />
          <span className="hidden text-[13px] font-medium text-board-ink min-[350px]:inline">Nor AI</span>
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={`${linkBase}${item.href}`}
                  className="rounded-md px-2.5 py-1.5 text-[13px] text-board-ink-2 transition-colors hover:bg-board-2 hover:text-board-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={COMPANY.contactUrl}
                className="rounded-md px-2.5 py-1.5 text-[13px] font-medium text-board-ink transition-colors hover:bg-board-2 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline-flex">
            <RatesStamp />
          </span>
          <ThemeToggle />
          <SignInButton />
        </div>
      </div>
    </header>
  );
}
