-- ============================================================================
-- DMATHS Learning Hub — Seed Data
--
-- Bootstraps ONLY what the platform needs to run: the single owner account
-- (D-MATHS, an admin who authors every course), the subject categories, site
-- settings and starter badges. No sample courses, lessons or blog posts are
-- seeded — D-MATHS uploads the real catalogue from scratch through the admin
-- portal. Safe to re-run: fixed UUIDs + ON CONFLICT guards.
--
-- The owner is a real auth user (email: instructor@dmaths.io /
-- password: Password123!) so you can sign in and manage the platform.
-- ============================================================================

-- ---- Owner account (auth user → profile created by handle_new_user trigger)
--
-- NOTE: manually seeding a Supabase auth user is version-sensitive. Two things
-- are required for email/password sign-in to actually work, beyond the row
-- itself: (1) the token columns must be empty strings (NOT NULL — GoTrue scans
-- them into Go strings and errors on NULL), and (2) a matching auth.identities
-- row for the "email" provider. Both are handled below, and the ON CONFLICT
-- clauses repair a previously-seeded (broken) row when you re-run this file.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'instructor@dmaths.io',
  crypt('Password123!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"D-MATHS","role":"instructor"}',
  '', '', '', ''
)
on conflict (id) do update set
  encrypted_password    = excluded.encrypted_password,
  email_confirmed_at    = excluded.email_confirmed_at,
  confirmation_token    = '',
  recovery_token        = '',
  email_change          = '',
  email_change_token_new = '';

-- Matching identity for the email provider (required by modern GoTrue).
insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"instructor@dmaths.io","email_verified":true,"phone_verified":false}',
  'email', now(), now(), now()
)
on conflict (provider_id, provider) do nothing;

-- Enrich the auto-created profile + instructor profile.
-- D-MATHS is the sole owner: role = admin (admins can also author courses under
-- RLS), so this one account controls the whole platform.
update public.profiles
set role = 'admin',
    headline = 'Founder • Web Developer, Data Analyst & AI Engineer',
    bio = 'The visionary behind D-MATHS — a passionate educator and technology professional dedicated to transforming education through innovation. He combines web development, data analysis, and AI to make learning practical, engaging, and impactful.',
    avatar_url = '/founder.jpg',
    country = 'NG'
where id = '00000000-0000-0000-0000-000000000001';

update public.instructor_profiles
set approved = true,
    years_experience = 8,
    expertise = array['Mathematics','Coding for Kids','AI & Technology'],
    social_links = '{"twitter":"https://twitter.com/dmaths","linkedin":"https://linkedin.com/in/dmaths"}'
where id = '00000000-0000-0000-0000-000000000001';

-- ---- Categories
insert into public.categories (id, name, slug, description, icon, sort_order) values
  ('10000000-0000-0000-0000-000000000001','Mathematics','mathematics','From foundations to advanced topics, taught visually and intuitively.','Sigma',1),
  ('10000000-0000-0000-0000-000000000002','Coding for Kids','coding-for-kids','Fun, hands-on programming for young learners — from Scratch to Python.','Code',2),
  ('10000000-0000-0000-0000-000000000003','Data Analysis','data-analysis','Turn data into insight with practical, real-world skills.','BarChart3',3),
  ('10000000-0000-0000-0000-000000000004','Artificial Intelligence','artificial-intelligence','Understand and build with AI — no PhD required.','BrainCircuit',4),
  ('10000000-0000-0000-0000-000000000005','Tech in Teaching','tech-in-teaching','Empower educators with modern digital-classroom tools.','GraduationCap',5),
  ('10000000-0000-0000-0000-000000000006','Web Development','web-development','Build modern, production-ready websites and apps.','Laptop',6)
on conflict (id) do nothing;

-- NOTE: No sample courses, sections, lessons or blog posts are seeded. The
-- catalogue starts empty and D-MATHS builds it from scratch in the admin portal
-- (Admin → Courses, Admin → Blog).

-- ---- Site settings defaults
insert into public.site_settings (key, value) values
  ('branding', '{"name":"DMATHS Learning Hub","primary":"#2563EB","accent":"#14B8A6"}'),
  ('features', '{"affiliates":true,"gamification":true,"blog":true}')
on conflict (key) do nothing;

-- ---- Starter badges
insert into public.badges (slug, name, description, icon) values
  ('first-course','First Steps','Enrolled in your first course','Rocket'),
  ('course-complete','Finisher','Completed a course','Trophy'),
  ('streak-7','On Fire','7-day learning streak','Flame'),
  ('quiz-ace','Quiz Ace','Scored 100% on a quiz','Target')
on conflict (slug) do nothing;
