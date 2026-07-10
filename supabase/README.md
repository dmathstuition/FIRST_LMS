# Supabase — DMATHS Learning Hub

This directory holds the complete database definition as versioned SQL migrations,
row-level-security policies, business-logic functions/triggers, and seed data.

```
supabase/
  config.toml            # local dev stack config
  migrations/
    0001_schema.sql      # extensions, enums, tables, indexes
    0002_functions.sql   # triggers, aggregate maintenance, RBAC helpers
    0003_policies.sql    # RLS enabled + policies on every table
  seed.sql               # demo instructor + categories + published courses
```

## Apply to a fresh project

### Option A — Supabase CLI (recommended)

```bash
# 1. Install the CLI: https://supabase.com/docs/guides/cli
# 2. Start the local stack (Docker required)
supabase start

# 3. Apply all migrations + seed
supabase db reset

# 4. Generate TypeScript types for the app
npm run db:types
```

To push to a hosted project instead:

```bash
supabase link --project-ref <your-project-ref>
supabase db push          # applies migrations
# then run seed.sql once from the SQL editor if you want demo data
```

### Option B — Supabase SQL Editor (no CLI)

Open your project's **SQL Editor** and run the files in order:

1. `migrations/0001_schema.sql`
2. `migrations/0002_functions.sql`
3. `migrations/0003_policies.sql`
4. `seed.sql` (optional demo data)

## Enabling OAuth (Google / GitHub)

1. In the Supabase dashboard → **Authentication → Providers**, enable Google and
   GitHub and paste their client id/secret.
2. Add the redirect URL `https://<your-domain>/auth/callback` (and
   `http://localhost:3000/auth/callback` for local dev).
3. No app code changes are needed — the login/register pages already trigger the
   OAuth flow (see `src/features/auth`).

## Demo credentials (seed)

- **Instructor:** `instructor@dmaths.io` / `Password123!`

> The seed inserts one auth user directly so the catalog has an author. Rotate or
> remove it before going to production.

## Security model

- **RLS is the primary authorization boundary** — every table has policies
  (`0003_policies.sql`). The anon/public key is safe to expose to the browser.
- The **service role key** bypasses RLS and must only ever be used server-side.
- Public certificate verification uses the `verify_certificate(token)` SECURITY
  DEFINER function rather than exposing the `certificates` table to anon reads.
