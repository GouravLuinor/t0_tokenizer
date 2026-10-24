"use client";

import { useEffect } from "react";
import { BrandedState } from "./tools/tokencraft/_components/shell/BrandedState";

const BUTTON =
  "inline-flex h-10 items-center rounded-md bg-gold px-4 text-[14px] font-semibold text-[#1d1400] hover:bg-[#f6b955] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-board-ink";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("TokenCraft render error:", error);
  }, [error]);

  return (
    <BrandedState
      title="Something broke"
      actions={
        <>
          <button type="button" onClick={reset} className={BUTTON}>
            Retry
          </button>
          <a href="/tools/tokencraft" className="text-[14px] underline hover:text-gold">
            Fresh workspace
          </a>
        </>
      }
    >
      <p>An unexpected error interrupted TokenCraft. Your text never left your browser.</p>
      <p className="mt-2 font-mono text-[12px] break-all">ref: {error.digest ?? "local"}</p>
    </BrandedState>
  );
}
