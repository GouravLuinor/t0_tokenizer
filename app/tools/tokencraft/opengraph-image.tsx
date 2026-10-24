import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { INITIAL_MODEL_REGISTRY } from "./_lib/priceService";
import { formatRate } from "./_lib/costs";

export const alt = "TokenCraft by Nor AI: token counter and LLM cost calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BOARD = ["gpt-6-luna", "claude-sonnet-5.5", "claude-haiku-5.5", "gpt-6.1-sol"]
  .map((k) => INITIAL_MODEL_REGISTRY[k])
  .filter(Boolean);

/** A slice of the rate board itself: the product is the picture. */
export default async function OpengraphImage() {
  const mark = `data:image/png;base64,${(await readFile(join(process.cwd(), "public/nor-ai-mark.png"))).toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0F3B2E", color: "#E4EDE8", padding: "64px 72px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800, letterSpacing: 3 }}>
            TOKEN<span style={{ color: "#F2A93B" }}>CRAFT</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, fontWeight: 600 }}>
            <span style={{ fontWeight: 400, color: "#A5C0B3" }}>by</span>
            <img src={mark} width={48} height={48} alt="" style={{ borderRadius: 6, background: "#ffffff" }} />
            Nor AI
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 68, fontWeight: 800, lineHeight: 1.02, maxWidth: 980 }}>
          Count the tokens. See what the call costs.
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 20, color: "#A5C0B3", paddingBottom: 10 }}>USD per 1M tokens</div>
        <div style={{ display: "flex", flexDirection: "column", borderTop: "2px solid #215645" }}>
          {BOARD.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #215645", fontSize: 28 }}>
              <span>{m.name}</span>
              <span style={{ color: "#F2A93B", fontFamily: "monospace" }}>
                ${formatRate(m.inputCostPer1M)} in · ${formatRate(m.outputCostPer1M)} out
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
