import { ImageResponse } from "next/og";

import { siteConfig } from "@/config/site";

// Default Open Graph / social share image (1200×630), generated at the edge.
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 80,
          background:
            "linear-gradient(135deg, #0F172A 0%, #1e293b 55%, #1e3a8a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            fontSize: 34,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            }}
          >
            <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="15" stroke="white" strokeWidth="5" />
              <path
                d="M13 34 L35 14"
                stroke="#F97316"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          Master real skills with premium, expert-led courses
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#cbd5e1" }}>
          Mathematics · Coding · Data Science · Design
        </div>
      </div>
    ),
    { ...size },
  );
}
