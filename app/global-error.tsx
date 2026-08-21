"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#09090B",
          color: "#FAFAFA",
          fontFamily: "monospace, system-ui",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 13, marginBottom: 8, color: "#F43F5E" }}>
            ⚠ Fatal error{error.digest ? ` · ref ${error.digest}` : ""}
          </div>
          <p style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 24 }}>
            TokenCraft failed to boot. No data was lost — your workspace is
            stored locally.
          </p>
          <button
            onClick={reset}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: 8,
              background: "#F4F4F5",
              color: "#09090B",
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload TokenCraft
          </button>
        </div>
      </body>
    </html>
  );
}
