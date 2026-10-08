export function StudioFooter() {
  return (
    <footer className="mt-8 border-t border-white/10">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-14 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 select-none items-center justify-center rounded-lg border border-surface-border bg-surface-default font-mono text-sm font-extrabold tracking-tight text-sky-400">
                TC
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                TokenCraft
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              A free, browser-first tokenizer and cost calculator. No accounts
              required, no ads, no paywall.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-zinc-400">
              Tokenization runs entirely on your device. We never store or
              transmit the text you type.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-14">
            <nav aria-labelledby="footer-product">
              <h2
                id="footer-product"
                className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
              >
                Product
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                <li>
                  <a
                    href="#workspace"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    Tokenizer
                  </a>
                </li>
                <li>
                  <a
                    href="#workload-heading"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    Cost calculator
                  </a>
                </li>
                <li>
                  <a
                    href="#knowledge-heading"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    Tokenization guide
                  </a>
                </li>
                <li>
                  <a
                    href="#faq-heading"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </nav>

            <nav aria-labelledby="footer-norai">
              <h2
                id="footer-norai"
                className="font-mono text-[11px] uppercase tracking-wider text-zinc-400"
              >
                More from NorAI
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                <li>
                  <a
                    href="https://norai.tech"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    NorAI.tech
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/GouravLuinor"
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Source code
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NorAI. Uttar Pradesh, India.</p>
          <p>
            Model data &amp; pricing from{" "}
            <a
              href="https://openrouter.ai"
              className="text-zinc-400 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-200"
              rel="noreferrer noopener"
              target="_blank"
            >
              OpenRouter
            </a>
            . Token counts for non-OpenAI models are o200k approximations.
          </p>
        </div>
      </div>
    </footer>
  );
}
