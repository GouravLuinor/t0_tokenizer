"use client";

/** Replaces the root layout, so it carries its own inline styles and no Tailwind. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const link = { color: "#E4EDE8", textDecoration: "underline" } as const;
  return (
    <html lang="en">
      <body
        style={{
          background: "#0F3B2E",
          color: "#E4EDE8",
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 440 }}>
          <p style={{ margin: 0, fontSize: 15, display: "flex", alignItems: "center", gap: 10 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nor-ai-mark.png" alt="" width={24} height={24} style={{ background: "#fff", borderRadius: 4 }} />
            <strong style={{ letterSpacing: 1 }}>
              TOKEN<span style={{ color: "#F2A93B" }}>CRAFT</span>
            </strong>
            <span style={{ color: "#A5C0B3" }}>by</span>
            <a href="https://norai.tech" style={link}>Nor AI</a>
          </p>
          <h1 style={{ fontSize: 28, margin: "28px 0 8px" }}>TokenCraft failed to load</h1>
          <p style={{ color: "#A5C0B3", fontSize: 15, lineHeight: 1.5, margin: 0 }}>
            Your workspace is stored in this browser and nothing was uploaded.{error.digest ? ` ref: ${error.digest}` : ""}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 20, height: 40, padding: "0 16px", borderRadius: 6, background: "#F2A93B", color: "#1d1400", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Reload TokenCraft
          </button>
          <p style={{ marginTop: 32, fontSize: 13, color: "#A5C0B3" }}>
            <a href="https://norai.tech/contact" style={link}>Talk to an engineer</a> ·{" "}
            <a href="https://norai.tech/products" style={link}>All Nor AI tools</a>
          </p>
        </div>
      </body>
    </html>
  );
}
