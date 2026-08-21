import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#10b981",
          borderRadius: "8px",
          border: "1px solid rgba(16,185,129,0.3)",
          fontWeight: 800,
          fontFamily: "monospace",
        }}
      >
        TC
      </div>
    ),
    {
      ...size,
    }
  );
}
