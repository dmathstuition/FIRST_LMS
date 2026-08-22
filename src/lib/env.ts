import { z } from "zod";

/**
 * Centralized, type-safe environment access.
 *
 * We validate lazily and split public vs. server schemas so that:
 *  - Missing *required* public keys fail loudly at startup in every runtime.
 *  - Optional integration keys (Stripe, Mux, AI, …) stay optional in this
 *    foundation build — the corresponding adapters fall back to dev mocks
 *    when their keys are absent (see src/lib/payments, src/lib/video, src/lib/ai).
 *
 * Add real values to `.env.local` (copy from `.env.example`).
 */

/** Variables safe to expose to the browser (must be prefixed NEXT_PUBLIC_). */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .default("https://placeholder.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default("public-anon-placeholder"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
});

/** Server-only variables. Never import `serverEnv` into client components. */
const serverSchema = z.object({
  // Supabase service role — server-only, bypasses RLS. Optional in foundation build.
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Payment providers (stubbed until keys provided).
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  PAYSTACK_SECRET_KEY: z.string().optional(),
  FLUTTERWAVE_SECRET_KEY: z.string().optional(),

  // Video hosting (stubbed until keys provided).
  MUX_TOKEN_ID: z.string().optional(),
  MUX_TOKEN_SECRET: z.string().optional(),
  BUNNY_STREAM_API_KEY: z.string().optional(),

  // AI features (DeepSeek). Optional — falls back to a mock without a key.
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_MODEL: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

function formatErrors(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

const parsedPublic = publicSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsedPublic.success) {
  throw new Error(
    `❌ Invalid public environment variables:\n${formatErrors(parsedPublic.error)}`,
  );
}

export const env = parsedPublic.data;

/**
 * Server env is parsed on demand so that client bundles never pull server keys.
 * Call from server components, route handlers, and server actions only.
 */
export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `❌ Invalid server environment variables:\n${formatErrors(parsed.error)}`,
    );
  }
  return parsed.data;
}

/** Convenience flags for gating integration code paths. */
export const integrations = {
  get stripe() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },
  get paystack() {
    return Boolean(process.env.PAYSTACK_SECRET_KEY);
  },
  get flutterwave() {
    return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
  },
  get mux() {
    return Boolean(process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET);
  },
  get bunny() {
    return Boolean(process.env.BUNNY_STREAM_API_KEY);
  },
  get ai() {
    return Boolean(process.env.DEEPSEEK_API_KEY);
  },
  /** True when Supabase is configured with real (non-placeholder) credentials. */
  get supabase() {
    return (
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder")
    );
  },
};
