type Mark = "yes" | "no" | "some";

const COLUMNS = ["TokenCraft", "Tokenizer playgrounds", "Price calculators"];

const ROWS: { feature: string; marks: [Mark, Mark, Mark]; note: string }[] = [
  {
    feature: "Token boundaries drawn on your own text",
    marks: ["yes", "yes", "no"],
    note: "Underlined in place while you edit, not in a separate pane.",
  },
  {
    feature: "Says which counts are exact and which are estimates",
    marks: ["yes", "some", "no"],
    note: "Every non-OpenAI model carries an ≈ Estimate stamp.",
  },
  {
    feature: "Live prices for 90+ models",
    marks: ["yes", "no", "some"],
    note: "Fetched from OpenRouter on load; snapshot refreshed weekly.",
  },
  {
    feature: "Cheapest model for this exact prompt",
    marks: ["yes", "no", "some"],
    note: "Ranked by full call cost, reply included, among models it fits.",
  },
  {
    feature: "Context fit including the reply you expect",
    marks: ["yes", "no", "some"],
    note: "Prompt and reserved reply shown against the window, plus price-tier warnings.",
  },
  {
    feature: "Minifier with savings counted in tokens",
    marks: ["yes", "no", "no"],
    note: "Re-tokenizes the result instead of guessing from characters.",
  },
  {
    feature: "Text never leaves the browser",
    marks: ["yes", "some", "some"],
    note: "Counting runs in a Web Worker; only prices come over the network.",
  },
];

const LABEL: Record<Mark, string> = { yes: "Yes", no: "No", some: "Varies" };

function MarkCell({ mark, ours }: { mark: Mark; ours: boolean }) {
  return (
    <span
      className={`inline-flex min-w-[4.25rem] justify-center rounded-[4px] px-2 py-0.5 font-mono text-[12px] ${
        mark === "yes"
          ? ours
            ? "bg-board text-board-ink"
            : "bg-panel text-ink"
          : mark === "some"
            ? "text-ink-2"
            : "text-ink-3"
      }`}
    >
      {LABEL[mark]}
    </span>
  );
}

/** Honest positioning against the two kinds of tool people usually reach for. */
export function CompareSection() {
  return (
    <section aria-labelledby="compare-title" className="border-b border-rule">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-14 md:px-8 lg:px-10 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="compare-title" className="font-display text-[36px] font-bold uppercase leading-[0.95] tracking-[0.02em] text-ink sm:text-[48px]">
            Counter and price list, in one place
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-2">
            Tokenizer playgrounds show you the tokens but not what they cost. Price calculators ask you to type a token
            count you do not know yet. TokenCraft reads the prompt itself and answers both questions. “Varies” means some
            tools in that group do it and many do not.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-[14px]">
            <caption className="sr-only">How TokenCraft compares with tokenizer playgrounds and price calculators</caption>
            <thead>
              <tr className="border-b border-rule-2 text-left text-[13px]">
                <th scope="col" className="py-3 pr-4 font-medium text-ink-2">
                  What you get
                </th>
                {COLUMNS.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`w-40 px-2 py-3 text-center font-medium ${i === 0 ? "text-ink" : "text-ink-2"}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.feature} className="border-b border-rule align-top">
                  <th scope="row" className="py-3.5 pr-4 text-left font-normal">
                    <span className="block font-medium text-ink">{r.feature}</span>
                    <span className="mt-0.5 block text-[13px] text-ink-3">{r.note}</span>
                  </th>
                  {r.marks.map((m, i) => (
                    <td key={i} className="px-2 py-3.5 text-center">
                      <MarkCell mark={m} ours={i === 0} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
