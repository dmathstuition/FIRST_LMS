-- ============================================================================
-- DMATHS Learning Hub — Core Schema
-- Migration 0001: extensions, enums, tables, indexes
--
-- Normalized PostgreSQL schema for a production LMS. Row Level Security is
-- enabled here but the policies themselves live in 0002_policies.sql. Triggers
-- and business-logic functions live in 0003_functions.sql. Seed data in seed.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";       -- gen_random_uuid()
create extension if not exists "citext";         -- case-insensitive email
create extension if not exists "pg_trgm";        -- trigram search (courses, blog)

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type user_role as enum ('student', 'instructor', 'admin');
create type course_level as enum ('beginner', 'intermediate', 'advanced', 'all');
create type course_status as enum ('draft', 'published', 'archived');
create type lesson_type as enum (
  'video', 'text', 'markdown', 'pdf', 'audio', 'slides',
  'code', 'embed', 'youtube', 'vimeo'
);
create type enrollment_status as enum ('active', 'completed', 'refunded', 'cancelled');
create type order_status as enum ('pending', 'paid', 'failed', 'refunded');
create type payment_provider as enum ('stripe', 'paystack', 'flutterwave', 'mock');
create type question_type as enum (
  'multiple_choice', 'checkbox', 'true_false', 'fill_blank', 'essay', 'coding'
);
create type attempt_status as enum ('in_progress', 'submitted', 'graded');
create type submission_status as enum ('submitted', 'graded', 'returned');
create type ticket_status as enum ('open', 'pending', 'resolved', 'closed');
create type notification_type as enum (
  'system', 'course', 'payment', 'assignment', 'quiz', 'message', 'achievement'
);
create type discount_type as enum ('percent', 'fixed');

-- Reusable moddatetime-style trigger fn (defined early; used by many tables).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Identity & profiles
-- ----------------------------------------------------------------------------

-- One row per auth.users record (created automatically via trigger in 0003).
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  avatar_url   text,
  role         user_role not null default 'student',
  headline     text,
  bio          text,
  website      text,
  country      text,
  locale       text default 'en',
  xp_points    integer not null default 0,
  onboarded    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Extended, instructor-only professional profile.
create table public.instructor_profiles (
  id            uuid primary key references public.profiles(id) on delete cascade,
  expertise     text[],
  years_experience integer,
  social_links  jsonb not null default '{}'::jsonb,
  payout_email  citext,
  total_students integer not null default 0,
  total_courses  integer not null default 0,
  rating_avg    numeric(3,2) not null default 0,
  approved      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Catalog: categories, courses, sections, lessons
-- ----------------------------------------------------------------------------

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon        text,                        -- lucide icon name
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  subtitle       text,
  description    text,
  thumbnail_url  text,
  promo_video    jsonb,                     -- { provider, ref }
  level          course_level not null default 'all',
  language        text not null default 'en',
  price          numeric(10,2) not null default 0,
  currency       text not null default 'USD',
  discount_price numeric(10,2),
  status         course_status not null default 'draft',
  is_featured    boolean not null default false,
  category_id    uuid references public.categories(id) on delete set null,
  instructor_id  uuid not null references public.profiles(id) on delete cascade,
  -- Denormalized aggregates (kept fresh by triggers) for fast catalog reads.
  rating_avg     numeric(3,2) not null default 0,
  rating_count   integer not null default 0,
  student_count  integer not null default 0,
  duration_minutes integer not null default 0,
  lesson_count   integer not null default 0,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table public.course_objectives (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  content    text not null,
  sort_order integer not null default 0
);

create table public.course_requirements (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  content    text not null,
  sort_order integer not null default 0
);

create table public.sections (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  title      text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.sections(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  type        lesson_type not null default 'video',
  -- Body/config is polymorphic per type: video source, markdown text, embed url…
  content     jsonb not null default '{}'::jsonb,
  duration_minutes integer not null default 0,
  is_preview  boolean not null default false,   -- viewable before purchase
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.lesson_resources (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  title      text not null,
  file_url   text not null,               -- Supabase Storage path
  file_size  bigint,
  kind       text not null default 'download', -- download | source_code | pdf | slides
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Enrollment, progress, engagement
-- ----------------------------------------------------------------------------

create table public.enrollments (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  status        enrollment_status not null default 'active',
  progress_pct  numeric(5,2) not null default 0,
  completed_at  timestamptz,
  last_lesson_id uuid references public.lessons(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  completed   boolean not null default false,
  seconds_watched integer not null default 0,
  updated_at  timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.bookmarks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  label      text,
  timestamp_seconds integer,          -- position within a video lesson
  created_at timestamptz not null default now()
);

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  lesson_id  uuid not null references public.lessons(id) on delete cascade,
  content    text not null,
  timestamp_seconds integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  course_id  uuid not null references public.courses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ----------------------------------------------------------------------------
-- Assessments: quizzes, questions, attempts, assignments
-- ----------------------------------------------------------------------------

create table public.quizzes (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  lesson_id     uuid references public.lessons(id) on delete set null,
  title         text not null,
  description   text,
  is_final_exam boolean not null default false,
  time_limit_minutes integer,          -- null = untimed
  pass_pct      numeric(5,2) not null default 70,
  shuffle       boolean not null default true,
  question_pool_size integer,          -- draw N random questions from the bank
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.questions (
  id           uuid primary key default gen_random_uuid(),
  quiz_id      uuid not null references public.quizzes(id) on delete cascade,
  type         question_type not null default 'multiple_choice',
  prompt       text not null,
  explanation  text,
  points       integer not null default 1,
  -- For fill_blank/coding: expected answer(s) / rubric stored here.
  answer_key   jsonb,
  sort_order   integer not null default 0
);

create table public.question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  content     text not null,
  is_correct  boolean not null default false,
  sort_order  integer not null default 0
);

create table public.quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  quiz_id     uuid not null references public.quizzes(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  status      attempt_status not null default 'in_progress',
  score       numeric(6,2),
  max_score   numeric(6,2),
  passed      boolean,
  started_at  timestamptz not null default now(),
  submitted_at timestamptz
);

create table public.quiz_answers (
  id          uuid primary key default gen_random_uuid(),
  attempt_id  uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  -- Selected option ids and/or free-text response.
  response    jsonb not null default '{}'::jsonb,
  is_correct  boolean,
  points_awarded numeric(6,2),
  unique (attempt_id, question_id)
);

create table public.assignments (
  id           uuid primary key default gen_random_uuid(),
  course_id    uuid not null references public.courses(id) on delete cascade,
  lesson_id    uuid references public.lessons(id) on delete set null,
  title        text not null,
  instructions text,
  rubric       jsonb,                  -- [{ criterion, points }]
  max_points   integer not null default 100,
  due_at       timestamptz,
  created_at   timestamptz not null default now()
);

create table public.assignment_submissions (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  file_url      text,                  -- Supabase Storage path
  notes         text,
  status        submission_status not null default 'submitted',
  grade         numeric(6,2),
  feedback      text,
  graded_by     uuid references public.profiles(id) on delete set null,
  submitted_at  timestamptz not null default now(),
  graded_at     timestamptz,
  unique (assignment_id, user_id)
);

-- ----------------------------------------------------------------------------
-- Certificates
-- ----------------------------------------------------------------------------

create table public.certificates (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  course_id     uuid not null references public.courses(id) on delete cascade,
  -- Human-friendly unique number + opaque token embedded in the QR code.
  certificate_number text not null unique,
  verification_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  issued_at     timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ----------------------------------------------------------------------------
-- Commerce: orders, payments, coupons, bundles, invoices, refunds, affiliates
-- ----------------------------------------------------------------------------

create table public.coupons (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  discount_type discount_type not null default 'percent',
  amount        numeric(10,2) not null,       -- percent (0-100) or fixed amount
  max_redemptions integer,
  redemptions   integer not null default 0,
  expires_at    timestamptz,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.bundles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text,
  price       numeric(10,2) not null,
  currency    text not null default 'USD',
  created_at  timestamptz not null default now()
);

create table public.bundle_courses (
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  primary key (bundle_id, course_id)
);

create table public.affiliate_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  code        text not null unique,
  commission_pct numeric(5,2) not null default 20,
  clicks      integer not null default 0,
  conversions integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  status        order_status not null default 'pending',
  currency      text not null default 'USD',
  subtotal      numeric(10,2) not null default 0,
  discount      numeric(10,2) not null default 0,
  tax           numeric(10,2) not null default 0,
  total         numeric(10,2) not null default 0,
  coupon_id     uuid references public.coupons(id) on delete set null,
  affiliate_id  uuid references public.affiliate_codes(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  course_id  uuid references public.courses(id) on delete set null,
  bundle_id  uuid references public.bundles(id) on delete set null,
  title      text not null,
  unit_price numeric(10,2) not null,
  quantity   integer not null default 1,
  check (course_id is not null or bundle_id is not null)
);

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  provider      payment_provider not null,
  reference     text not null,
  amount        numeric(10,2) not null,
  currency      text not null default 'USD',
  status        order_status not null default 'pending',
  raw           jsonb,                       -- provider payload for auditing
  created_at    timestamptz not null default now(),
  unique (provider, reference)
);

create table public.invoices (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  number      text not null unique,
  issued_at   timestamptz not null default now(),
  pdf_url     text
);

create table public.refund_requests (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  reason      text,
  status      ticket_status not null default 'open',
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

-- ----------------------------------------------------------------------------
-- Community & engagement
-- ----------------------------------------------------------------------------

create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  title      text,
  content    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, user_id)
);

create table public.discussions (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references public.courses(id) on delete cascade,
  lesson_id  uuid references public.lessons(id) on delete set null,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  is_pinned  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  discussion_id uuid references public.discussions(id) on delete cascade,
  lesson_id     uuid references public.lessons(id) on delete cascade,
  parent_id     uuid references public.comments(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  body          text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (discussion_id is not null or lesson_id is not null)
);

create table public.likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  comment_id  uuid references public.comments(id) on delete cascade,
  discussion_id uuid references public.discussions(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, comment_id),
  unique (user_id, discussion_id)
);

create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        notification_type not null default 'system',
  title       text not null,
  body        text,
  link        text,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table public.announcements (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid references public.courses(id) on delete cascade,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      citext not null unique,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Gamification
-- ----------------------------------------------------------------------------

create table public.xp_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  amount     integer not null,
  reason     text not null,
  created_at timestamptz not null default now()
);

create table public.badges (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text,
  criteria    jsonb
);

create table public.user_badges (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  badge_id  uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create table public.streaks (
  user_id       uuid primary key references public.profiles(id) on delete cascade,
  current_days  integer not null default 0,
  longest_days  integer not null default 0,
  last_active   date,
  updated_at    timestamptz not null default now()
);

create table public.learning_goals (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  minutes_per_week integer not null default 150,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Blog / content
-- ----------------------------------------------------------------------------

create table public.blog_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  slug  text not null unique
);

create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  content      text,                    -- rich text / markdown
  cover_url    text,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  category_id  uuid references public.blog_categories(id) on delete set null,
  tags         text[] not null default '{}',
  published    boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.blog_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.blog_posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Operations: support, audit, settings
-- ----------------------------------------------------------------------------

create table public.support_tickets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subject     text not null,
  body        text not null,
  status      ticket_status not null default 'open',
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,
  entity     text,
  entity_id  uuid,
  metadata   jsonb,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes (FKs + common filters + search)
-- ----------------------------------------------------------------------------
create index idx_courses_status on public.courses(status);
create index idx_courses_category on public.courses(category_id);
create index idx_courses_instructor on public.courses(instructor_id);
create index idx_courses_featured on public.courses(is_featured) where is_featured;
create index idx_courses_title_trgm on public.courses using gin (title gin_trgm_ops);

create index idx_sections_course on public.sections(course_id);
create index idx_lessons_section on public.lessons(section_id);
create index idx_lessons_course on public.lessons(course_id);
create index idx_lesson_resources_lesson on public.lesson_resources(lesson_id);

create index idx_enrollments_user on public.enrollments(user_id);
create index idx_enrollments_course on public.enrollments(course_id);
create index idx_lesson_progress_user on public.lesson_progress(user_id);
create index idx_lesson_progress_course on public.lesson_progress(course_id);
create index idx_bookmarks_user on public.bookmarks(user_id);
create index idx_notes_user on public.notes(user_id);
create index idx_wishlists_user on public.wishlists(user_id);

create index idx_questions_quiz on public.questions(quiz_id);
create index idx_question_options_question on public.question_options(question_id);
create index idx_quiz_attempts_user on public.quiz_attempts(user_id);
create index idx_quiz_answers_attempt on public.quiz_answers(attempt_id);
create index idx_assignment_subs_user on public.assignment_submissions(user_id);

create index idx_certificates_user on public.certificates(user_id);

create index idx_orders_user on public.orders(user_id);
create index idx_order_items_order on public.order_items(order_id);
create index idx_payments_order on public.payments(order_id);

create index idx_reviews_course on public.reviews(course_id);
create index idx_discussions_course on public.discussions(course_id);
create index idx_comments_discussion on public.comments(discussion_id);
create index idx_comments_lesson on public.comments(lesson_id);
create index idx_messages_recipient on public.messages(recipient_id);
create index idx_notifications_user on public.notifications(user_id) where read_at is null;

create index idx_xp_events_user on public.xp_events(user_id);
create index idx_blog_posts_published on public.blog_posts(published, published_at desc);
create index idx_blog_posts_slug_trgm on public.blog_posts using gin (title gin_trgm_ops);
create index idx_support_tickets_status on public.support_tickets(status);
create index idx_audit_logs_entity on public.audit_logs(entity, entity_id);
