import { TopBar } from "./_components/shell/TopBar";
import { SiteFooter } from "./_components/shell/SiteFooter";
import { Workstation } from "./_components/Workstation";
import { RateBoard } from "./_components/board/RateBoard";
import { MinifierSection } from "./_components/sections/MinifierSection";
import { CompareSection } from "./_components/sections/CompareSection";
import { GuideSection } from "./_components/sections/GuideSection";
import { FaqSection } from "./_components/FaqSection";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MODEL_REGISTRY } from "./_store/useTokenCraftStore";
import { siteUrl } from "@/lib/site";
import { isExactCount } from "./_lib/costs";

const MODEL_COUNT = Object.keys(MODEL_REGISTRY).length;
const ESTIMATED_COUNT = Object.values(MODEL_REGISTRY).filter((m) => !isExactCount(m)).length;

const APP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TokenCraft",
  url: `${siteUrl()}/tools/tokencraft`,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (runs in the browser)",
  description: `Token counter and LLM cost calculator. Exact counts for OpenAI encodings, estimates for ${MODEL_COUNT}+ other models, live OpenRouter prices, all computed in your browser.`,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "Nor AI", url: "https://norai.tech" },
};

export default function TokenCraftPage() {
  return (
    <TooltipProvider delayDuration={200}>
      <a
        href="#workspace"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[80] focus:rounded-md focus:bg-gold focus:px-3 focus:py-1.5 focus:text-[13px] focus:text-[#1d1400]"
      >
        Skip to the counter
      </a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_JSON_LD) }} />

      <TopBar />

      <main id="main">
        <section aria-labelledby="page-title" className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-6 md:px-8 md:pt-8 lg:px-10">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
            <h1 id="page-title" className="font-display text-[30px] font-bold uppercase leading-none tracking-[0.02em] text-ink sm:text-[36px]">
              Token counter &amp; LLM cost calculator
            </h1>
            <p className="max-w-2xl text-[14px] leading-snug text-ink-2">
              Exact counts for GPT models, clearly marked estimates for {ESTIMATED_COUNT} others, and what the call costs
              at today&apos;s rates. Counted in your browser; your text is never uploaded.
            </p>
          </div>
          <Workstation />
        </section>

        <RateBoard />
        <MinifierSection />
        <CompareSection />
        <GuideSection />
        <FaqSection />
      </main>

      <SiteFooter />
    </TooltipProvider>
  );
}
