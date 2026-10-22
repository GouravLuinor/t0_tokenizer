"use client";

import { useEffect, useRef, useState } from "react";
import { countTokens } from "../../_hooks/useTokenizer";
import { formatNumber } from "@/lib/utils";

const SAMPLES = [
  {
    label: "English",
    text: "Summarise the customer's last three support tickets and suggest one next step for the account manager.",
  },
  {
    label: "Code",
    text: "export function debounce<T extends (...a: unknown[]) => void>(fn: T, ms = 200) {\n  let t: ReturnType<typeof setTimeout>;\n  return (...a: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };\n}",
  },
  {
    label: "Hindi",
    text: "ग्राहक के पिछले तीन सहायता टिकटों का सारांश दें और खाता प्रबंधक के लिए एक अगला कदम सुझाएँ।",
  },
];

type Counts = { cl100k: number; o200k: number } | null;

/** Counts the same three snippets with both OpenAI vocabularies, live, on this device. */
export function EncodingDemo() {
  const [counts, setCounts] = useState<Counts[]>(SAMPLES.map(() => null));
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Count only once the table is near the viewport, by which time the
  // editor's worker is warm and the BPE tables are already loaded
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    void Promise.all(
      SAMPLES.map(async (s) => ({
        cl100k: await countTokens(s.text, "cl100k_base"),
        o200k: await countTokens(s.text, "o200k_base"),
      }))
    ).then((r) => !cancelled && setCounts(r));
    return () => {
      cancelled = true;
    };
  }, [visible]);

  return (
    <figure ref={ref} className="my-8 overflow-hidden rounded-lg border border-rule bg-sheet">
      <table className="w-full border-collapse text-[14px]">
        <caption className="sr-only">Token counts for the same text in cl100k_base and o200k_base</caption>
        <thead>
          <tr className="border-b border-rule bg-paper text-[12px] text-ink-2">
            <th scope="col" className="px-4 py-2 text-left font-medium">Same text in</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">cl100k_base</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">o200k_base</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">Change</th>
          </tr>
        </thead>
        <tbody>
          {SAMPLES.map((s, i) => {
            const c = counts[i];
            const change = c && c.cl100k ? Math.round(((c.o200k - c.cl100k) / c.cl100k) * 100) : null;
            return (
              <tr key={s.label} className="border-b border-rule last:border-0">
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-ink">
                  {s.label}
                </th>
                <td className="px-4 py-2.5 text-right font-mono text-ink tnum">{c ? formatNumber(c.cl100k) : "…"}</td>
                <td className="px-4 py-2.5 text-right font-mono text-ink tnum">{c ? formatNumber(c.o200k) : "…"}</td>
                <td className="px-4 py-2.5 text-right font-mono text-ink-2 tnum">
                  {change === null ? "…" : `${change > 0 ? "+" : ""}${change}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <figcaption className="border-t border-rule px-4 py-2.5 text-[12px] text-ink-3">
        Counted just now in your browser. The Hindi line is a translation of the English one.
      </figcaption>
    </figure>
  );
}
