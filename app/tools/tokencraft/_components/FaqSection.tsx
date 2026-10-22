import { FAQS } from "../_content/faq";
import { FaqAccordion } from "./FaqAccordion";
import { siteUrl } from "@/lib/site";

// FAQPage structured data derived from the same source array the visible
// accordion renders, so the schema can never drift from the on-page copy.
function buildFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${siteUrl()}/tools/tokencraft#faq`,
    mainEntity: FAQS.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }}
      />
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-8 px-4 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16 lg:px-10 lg:py-20">
        <div>
          <h2
            id="faq-heading"
            className="font-display text-[36px] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink sm:text-[48px]"
          >
            Questions people ask
          </h2>
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-2">
            About accuracy, prices and what happens to your text.
          </p>
        </div>
        <FaqAccordion items={FAQS} />
      </div>
    </section>
  );
}
