import { EncodingDemo } from "./EncodingDemo";

const TOC = [
  ["what-is-a-token", "What a token is"],
  ["why-counts-differ", "Why counts differ by model"],
  ["cl100k-vs-o200k", "cl100k_base vs o200k_base"],
  ["cut-the-bill", "Four ways to cut the bill"],
  ["how-we-price", "How TokenCraft prices a call"],
];

const h3 = "scroll-mt-20 font-display text-[28px] font-semibold uppercase leading-tight tracking-[0.02em] text-ink";
const p = "mt-3 text-[16px] leading-[1.7] text-ink-2";

/** The long-form guide: written for reading, with one live demo. */
export function GuideSection() {
  return (
    <section id="guide" aria-labelledby="guide-title" className="scroll-mt-16 border-b border-rule bg-sheet">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 px-4 py-14 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 lg:px-10 lg:py-20">
        <nav aria-label="Guide contents" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[13px] font-medium text-ink">In this guide</p>
          <ol className="mt-3 space-y-1 border-l border-rule">
            {TOC.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="-ml-px block border-l border-transparent py-1 pl-3 text-[14px] text-ink-2 transition-colors hover:border-board hover:text-ink dark:hover:border-gold"
                >
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="max-w-[68ch]">
          <h2 id="guide-title" className="font-display text-[40px] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink sm:text-[56px]">
            Tokens, plainly
          </h2>
          <p className="mt-4 text-[18px] leading-[1.6] text-ink">
            Every model price is quoted per million tokens, so knowing how your text turns into tokens is the whole game.
            Here is what matters, without the hype.
          </p>

          <h3 id="what-is-a-token" className={`mt-12 ${h3}`}>What a token is</h3>
          <p className={p}>
            A model never sees letters or words. A tokenizer first cuts your text into pieces from a fixed vocabulary and
            turns each piece into a number. Common words are usually one piece, often with the space in front of them.
            Rare words, names and numbers break into several. Emoji and many non-Latin characters can take more than one
            token each, because the vocabulary is built from bytes.
          </p>
          <p className={p}>
            That is why the editor above underlines each token in place. Look at a long URL or a block of
            JSON and you can see the cost pile up.
          </p>

          <h3 id="why-counts-differ" className={`mt-12 ${h3}`}>Why counts differ by model</h3>
          <p className={p}>
            Each lab trains its own vocabulary. OpenAI publishes theirs, so TokenCraft runs it exactly and marks those
            models <strong className="font-medium text-ink">Exact</strong>. Anthropic, Google, Meta, Mistral, DeepSeek
            and others use tokenizers that are not all public, so their counts here are estimates made with
            o200k_base and marked <strong className="font-medium text-ink">≈ Estimate</strong>.
          </p>
          <p className={p}>
            Treat estimates as a planning figure. Some newer tokenizers produce noticeably more tokens than o200k_base
            for the same text, so leave headroom near a context limit and check your provider&apos;s usage report for
            the billed number.
          </p>

          <h3 id="cl100k-vs-o200k" className={`mt-12 ${h3}`}>cl100k_base vs o200k_base</h3>
          <p className={p}>
            cl100k_base has about 100,000 entries and arrived with GPT-4; the text-embedding-3 models still use it.
            o200k_base doubled the vocabulary with GPT-4o and is used by newer GPT models. A bigger vocabulary means
            longer pieces, so the same text usually needs fewer tokens, and the difference is largest outside English.
            Here are both, counted on your device:
          </p>
          <EncodingDemo />

          <h3 id="cut-the-bill" className={`mt-12 ${h3}`}>Four ways to cut the bill</h3>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-[16px] leading-[1.7] text-ink-2 marker:font-mono marker:text-ink-3">
            <li>
              <strong className="font-medium text-ink">Cache the stable part.</strong> Put instructions and reference
              material first and keep them identical between calls. Providers that offer prompt caching bill repeated
              prefixes at a much lower rate; the answer panel shows that rate when the model has one.
            </li>
            <li>
              <strong className="font-medium text-ink">Ask for shorter replies.</strong> Output usually costs several
              times more per token than input. Set the reply size in the answer panel and watch which side of the bill
              moves.
            </li>
            <li>
              <strong className="font-medium text-ink">Strip formatting.</strong> Indentation, comments and table padding
              are tokens too. The minifier removes them and shows the real saving.
            </li>
            <li>
              <strong className="font-medium text-ink">Pick the model per job.</strong> The rate board ranks every model
              for your exact prompt. A cheaper model that fits often does routine work just as well.
            </li>
          </ol>

          <h3 id="how-we-price" className={`mt-12 ${h3}`}>How TokenCraft prices a call</h3>
          <p className={p}>
            Cost per call is input tokens times the input rate, plus the expected reply times the output rate. Rates are
            list prices in US dollars from OpenRouter&apos;s public catalog. They do not include batch discounts,
            regional pricing or taxes. When a model charges more above a certain prompt length, the answer panel warns
            you once your prompt crosses it.
          </p>
        </article>
      </div>
    </section>
  );
}
