"use client";

import { useEffect } from "react";

// Global error boundary — replaces the root layout when an unrecoverable error
// occurs. Must include <html>/<body> because it renders above the layout.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to logs/monitoring (wire Sentry etc. here later).
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0F172A",
          color: "white",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ marginTop: "0.75rem", color: "#94a3b8", maxWidth: 420 }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1.5rem",
            padding: "0.6rem 1.4rem",
            borderRadius: "0.6rem",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontWeight: 600,
            background: "linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
