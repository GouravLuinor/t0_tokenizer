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
    <section
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16 lg:px-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd()) }}
      />

      <header className="mb-8 max-w-3xl md:mb-10">
        <h2
          id="faq-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl"
        >
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          How TokenCraft handles your text, your data, and your money.
        </p>
      </header>

      <FaqAccordion items={FAQS} />
    </section>
  );
}
