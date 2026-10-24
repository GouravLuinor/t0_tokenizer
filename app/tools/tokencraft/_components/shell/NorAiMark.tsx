/** The Nor AI logo. It has a light background, so on the dark board it sits on its own light chip. */
export function NorAiMark({ size = 22, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- 160px static asset, fixed size
    <img
      src="/nor-ai-mark.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 rounded-[4px] bg-white ${className}`}
    />
  );
}
