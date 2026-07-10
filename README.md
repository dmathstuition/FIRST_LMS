<div align="center">

# 🎓 DMATHS Learning Hub

**A modern, production-ready Learning Management System for selling online courses.**

Built with Next.js 15 · React 19 · TypeScript · TailwindCSS · Framer Motion · shadcn/ui · Supabase

</div>

---

## ✨ Overview

DMATHS Learning Hub is a commercial-grade LMS: a beautiful, animated marketing
site, secure authentication, and a normalized PostgreSQL backend with row-level
security — ready to grow into a full course platform.

This repository is being built **phase by phase**. What's included today (the
**foundation**) is fully functional on its own:

| Phase | Status | What's included |
| ----- | ------ | --------------- |
| 1 · Architecture | ✅ | Next.js 15 App Router scaffold, TypeScript, Tailwind + brand theme, shadcn/ui, dark mode, typed env, stubbed payment/video/AI adapters |
| 2 · Database | ✅ | Normalized Postgres schema, RLS on every table, triggers/functions, seed data, ER diagram (`supabase/`) |
| 3 · Authentication | ✅ | Email + Google + GitHub via Supabase SSR, RBAC middleware, login/register/reset flows |
| 4 · Landing Page | ✅ | Animated hero, stats, featured courses, categories, instructor, testimonials, pricing, FAQ, newsletter, footer + `/courses`, `/courses/[slug]`, `/verify`, `/blog`, SEO (sitemap, robots, OG images, JSON-LD) |
| 5–11 | 🔜 | Student / Instructor / Admin dashboards, course player, live payments, testing, deployment |

## 🎨 Brand

| Token | Value |
| ----- | ----- |
| Primary | `#2563EB` |
| Dark | `#0F172A` |
| Light | `#FFFFFF` |
| Accent | `#14B8A6` |
| Font | Inter |

## 🚀 Getting started

### Prerequisites

- Node.js ≥ 18.18
- A [Supabase](https://supabase.com) project (optional to start — the app ships
  with demo data and runs without one)

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY once you have a project.
```

> **No Supabase yet?** The app runs immediately using curated demo data (mirrors
> the seed). Live data takes over automatically once your Supabase credentials
> are set.

### 3. Set up the database (when ready)

See [`supabase/README.md`](./supabase/README.md). In short:

```bash
supabase start        # local stack (Docker)
supabase db reset     # apply migrations + seed
npm run db:types      # generate TypeScript types
```

### 4. Run

```bash
npm run dev           # http://localhost:3000
```

## 📜 Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |
| `npm run db:types` | Regenerate Supabase types |

## 🗂️ Project structure

```
src/
  app/
    (marketing)/       # public site: landing, courses, blog, verify
    (auth)/            # login, register, password reset, verify-email
    (dashboard)/       # authenticated area (expands in Phase 5)
    auth/callback/     # OAuth / email-link code exchange
    sitemap.ts robots.ts manifest.ts icon.tsx opengraph-image.tsx
  components/
    ui/                # shadcn/ui primitives
    marketing/         # navbar, footer, landing sections
    motion/            # Framer Motion helpers
  features/            # feature modules (auth, courses, certificates, newsletter)
  lib/                 # supabase clients, env, adapters (payments/video/ai), utils, auth
  hooks/               # reusable React hooks
  config/              # site + navigation config
  types/               # shared + generated DB types
supabase/
  migrations/          # 0001 schema · 0002 functions · 0003 policies
  seed.sql             # demo instructor + courses
docs/erd.md            # entity-relationship diagram (Mermaid)
```

## 🔒 Security

- **Row Level Security** on every table is the primary authorization boundary.
- Middleware adds **role-based route protection** (defense-in-depth).
- Secure, httpOnly cookie sessions via `@supabase/ssr`.
- Security headers set globally (`next.config.mjs`).
- Public certificate verification uses a `SECURITY DEFINER` RPC — the
  `certificates` table is never exposed to anonymous reads.

## 🔌 Integrations

Payment (Stripe / Paystack / Flutterwave), video (Mux / Bunny / Vimeo /
YouTube), and AI (Claude) providers are behind clean adapter interfaces in
`src/lib/`. They run in **dev-mock mode** until you add the relevant keys, so
every flow is testable today and real providers drop in without refactoring.

## ☁️ Deployment

Optimized for [Vercel](https://vercel.com):

1. Import the repo into Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy. `vercel.json` and CI (`.github/workflows/ci.yml`) are included.

## 📄 License

Proprietary — © DMATHS Learning Hub.
