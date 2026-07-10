import { ImageResponse } from "next/og";

// Dynamically generated favicon — the D-MATHS ring-and-stroke mark on a royal
// blue tile. Keeps the browser tab on-brand without shipping a binary .ico.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          borderRadius: 7,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="15" stroke="white" strokeWidth="6" />
          <path
            d="M13 34 L35 14"
            stroke="#F97316"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
