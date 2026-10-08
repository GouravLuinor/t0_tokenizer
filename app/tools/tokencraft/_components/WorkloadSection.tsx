import { MultiModelCostMatrix } from "./MultiModelCostMatrix";

export function WorkloadSection() {
  return (
    <section
      aria-labelledby="workload-heading"
      className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 md:py-16 lg:px-8"
    >
      <header className="mb-8 max-w-3xl md:mb-10">
        <h2
          id="workload-heading"
          className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl"
        >
          Workload Budget Calculator
        </h2>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          Model what this prompt actually costs to run at volume. Set your batch
          size and expected output length, then compare standard input pricing
          against cached input pricing across every model in the live catalog.
          Models without a cache tier are marked{" "}
          <span className="text-zinc-300">—</span> rather than given a fabricated
          discount.
        </p>
      </header>

      <MultiModelCostMatrix />
    </section>
  );
}
