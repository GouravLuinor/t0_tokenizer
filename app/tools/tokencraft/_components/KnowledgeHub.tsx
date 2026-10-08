import { KNOWLEDGE_CARDS } from "../_content/knowledge";

export function KnowledgeHub() {
  return (
    <section
      aria-labelledby="knowledge-heading"
      className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16 lg:px-8"
    >
      <header className="mb-8 max-w-3xl md:mb-12">
        <h2
          id="knowledge-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl"
        >
          How Tokenization Actually Works
        </h2>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          The vocabulary behind every token count you see above — and why the
          same sentence costs more on one model than another.
        </p>
      </header>

      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {KNOWLEDGE_CARDS.map((card, index) => (
          <li
            key={card.title}
            className="flex flex-col rounded-xl border border-white/10 bg-surface-subtle/30 p-6 transition-colors duration-200 hover:border-white/15"
          >
            <span
              className="mb-3 font-mono text-[11px] tabular-nums text-zinc-400"
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-base font-medium leading-snug text-zinc-100">
              {card.title}
            </h3>
            <p className="mt-2.5 text-sm leading-relaxed text-zinc-400">
              {card.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
