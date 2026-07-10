import { ImageResponse } from "next/og";

// Dynamically generated favicon — a brand-gradient "D" tile. Avoids shipping a
// binary .ico and stays on-brand.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
          borderRadius: 7,
        }}
      >
        D
      </div>
    ),
    { ...size },
  );
}
