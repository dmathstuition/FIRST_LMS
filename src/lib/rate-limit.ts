import "server-only";

import { headers } from "next/headers";

/**
 * Lightweight, dependency-free rate limiter (fixed-window over a sliding map).
 *
 * Why in-memory: it works out of the box with zero external services, which is
 * the right default for this build. The tradeoff is that state lives per server
 * instance — on a horizontally-scaled/serverless deployment each instance keeps
 * its own counters, so the effective global limit is `limit × instances`. That
 * is still a meaningful brake on brute-force and abuse.
 *
 * Upgrading to a shared store: for strict global limits across instances, swap
 * the `hit()` body for a Redis/Upstash `INCR` + `EXPIRE` (or the
 * `@upstash/ratelimit` sliding-window algorithm) keyed by the same identifier.
 * The call sites in the auth actions do not change.
 */

interface Counter {
  count: number;
  resetAt: number;
}

// Keyed by `${bucket}:${identifier}`. A single Map is fine for our volume.
const store = new Map<string, Counter>();

// Opportunistic cleanup so the Map can't grow without bound on a long-lived
// instance. Runs at most once per sweep interval, on access.
let lastSweep = 0;
const SWEEP_INTERVAL_MS = 60_000;

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, counter] of store) {
    if (counter.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  /** Seconds until the window resets (only meaningful when blocked). */
  retryAfter: number;
  remaining: number;
}

/**
 * Record a hit against `identifier` within `bucket`. Returns whether the caller
 * is still under the limit. `windowMs` is the window length; `limit` is the max
 * allowed hits per window.
 */
export function rateLimit(
  bucket: string,
  identifier: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const key = `${bucket}:${identifier}`;
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, retryAfter: 0, remaining: limit - 1 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      success: false,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
      remaining: 0,
    };
  }

  return {
    success: true,
    retryAfter: 0,
    remaining: limit - existing.count,
  };
}

/**
 * Best-effort client identifier for rate limiting, derived from proxy headers.
 * Falls back to a constant so a missing IP still shares one (stricter) bucket
 * rather than bypassing the limit entirely.
 */
export async function clientIdentifier(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}
