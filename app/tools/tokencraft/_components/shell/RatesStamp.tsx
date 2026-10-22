"use client";

import { RefreshCw } from "lucide-react";
import { useTokenCraftStore } from "../../_store/useTokenCraftStore";
import { MODEL_CATALOG_GENERATED_AT } from "../../_lib/priceService";

const SNAPSHOT_DATE = new Date(MODEL_CATALOG_GENERATED_AT).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

/**
 * The board's timestamp: says exactly where today's rates came from and lets
 * the visitor pull them again. Live sync is a real OpenRouter fetch.
 */
export function RatesStamp({ compact = false }: { compact?: boolean }) {
  const source = useTokenCraftStore((s) => s.priceSource);
  const syncedAt = useTokenCraftStore((s) => s.lastSyncedAt);
  const syncing = useTokenCraftStore((s) => s.isSyncingPrices);
  const sync = useTokenCraftStore((s) => s.syncLivePrices);

  const label = syncing
    ? "Fetching rates…"
    : source === "live"
      ? compact
        ? `Live · ${syncedAt}`
        : `Rates live · OpenRouter · ${syncedAt}`
      : source === "cached"
        ? `Rates from ${syncedAt} · offline`
        : compact
          ? `Rates · ${SNAPSHOT_DATE}`
          : `Snapshot rates · ${SNAPSHOT_DATE}`;

  return (
    <button
      type="button"
      onClick={() => void sync()}
      disabled={syncing}
      title="Fetch current prices from OpenRouter"
      aria-label={`${label}. Refresh rates`}
      className="group inline-flex h-8 items-center gap-2 rounded-[3px] border border-board-rule px-2.5 font-mono text-[12px] uppercase tracking-wide text-gold transition-colors hover:border-gold/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-80"
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${source === "live" && !syncing ? "bg-gold" : "bg-board-ink-2"}`}
      />
      <span className="tnum whitespace-nowrap">{label}</span>
      <RefreshCw
        aria-hidden="true"
        className={`h-3 w-3 text-board-ink-2 transition-colors group-hover:text-gold ${syncing ? "animate-spin motion-reduce:animate-none" : ""}`}
      />
    </button>
  );
}
