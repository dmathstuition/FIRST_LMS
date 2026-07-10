-- ============================================================================
-- DMATHS Learning Hub — Seed Data
--
-- Populates categories, a demo instructor, and several published courses so the
-- landing page and catalog render real content immediately after `db reset`.
-- Safe to re-run: uses fixed UUIDs + ON CONFLICT guards.
--
-- The demo instructor is a real auth user (email: instructor@dmaths.io /
-- password: Password123!) so you can sign in and explore instructor views.
-- ============================================================================

-- ---- Demo instructor (auth user → profile created by handle_new_user trigger)
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
  '{"full_name":"Dr. Ada Mensah","role":"instructor"}',
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
update public.profiles
set headline = 'Mathematician & Software Engineer • 12+ years teaching',
    bio = 'Ada has helped over 40,000 students master mathematics and programming through clear, first-principles teaching. Former university lecturer and lead engineer.',
    avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&h=256&fit=crop&crop=faces',
    country = 'GH'
where id = '00000000-0000-0000-0000-000000000001';

update public.instructor_profiles
set approved = true,
    years_experience = 12,
    expertise = array['Mathematics','Data Science','Web Development'],
    social_links = '{"twitter":"https://twitter.com/dmaths","linkedin":"https://linkedin.com/in/dmaths"}'
where id = '00000000-0000-0000-0000-000000000001';

-- ---- Categories
insert into public.categories (id, name, slug, description, icon, sort_order) values
  ('10000000-0000-0000-0000-000000000001','Mathematics','mathematics','From algebra to advanced calculus, taught visually.','Sigma',1),
  ('10000000-0000-0000-0000-000000000002','Web Development','web-development','Build modern, production-ready web apps.','Code',2),
  ('10000000-0000-0000-0000-000000000003','Data Science','data-science','Turn data into insight and intelligent models.','BarChart3',3),
  ('10000000-0000-0000-0000-000000000004','Design','design','UI/UX and product design fundamentals.','Palette',4),
  ('10000000-0000-0000-0000-000000000005','Business','business','Entrepreneurship, finance, and growth.','Briefcase',5),
  ('10000000-0000-0000-0000-000000000006','Test Prep','test-prep','Ace standardized exams with proven strategies.','GraduationCap',6)
on conflict (id) do nothing;

-- ---- Courses (all published so they appear in the catalog + featured strip)
insert into public.courses (
  id, slug, title, subtitle, description, thumbnail_url, level, price, currency,
  discount_price, status, is_featured, category_id, instructor_id,
  rating_avg, rating_count, student_count, duration_minutes, lesson_count, published_at
) values
  (
    '20000000-0000-0000-0000-000000000001',
    'calculus-made-intuitive',
    'Calculus Made Intuitive',
    'Master limits, derivatives, and integrals with visual intuition.',
    'A complete, visual-first calculus course that builds deep intuition before formalism. Perfect for students and self-learners who want to truly understand — not just memorize.',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
    'beginner', 89.99, 'USD', 49.99, 'published', true,
    '10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',
    4.9, 1284, 18450, 720, 96, now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'fullstack-nextjs-15',
    'Full-Stack Web Development with Next.js 15',
    'Ship production apps with React 19, TypeScript, and Supabase.',
    'Go from zero to deploying real, scalable full-stack applications using the exact stack top companies use today.',
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop',
    'intermediate', 129.99, 'USD', 79.99, 'published', true,
    '10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001',
    4.8, 2093, 24310, 1080, 142, now()
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'data-science-python',
    'Data Science with Python',
    'Pandas, visualization, and machine learning from scratch.',
    'Learn the full data-science workflow with hands-on projects: cleaning, analysis, visualization, and your first ML models.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    'intermediate', 109.99, 'USD', null, 'published', true,
    '10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001',
    4.7, 876, 11230, 900, 118, now()
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'linear-algebra-for-ml',
    'Linear Algebra for Machine Learning',
    'The math that powers modern AI, explained clearly.',
    'Vectors, matrices, eigenvalues, and decompositions — with direct connections to how machine learning actually works.',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    'advanced', 99.99, 'USD', 59.99, 'published', true,
    '10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',
    4.9, 543, 7820, 660, 84, now()
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'ui-ux-design-foundations',
    'UI/UX Design Foundations',
    'Design beautiful, usable products people love.',
    'Master the principles of visual and interaction design, then build a portfolio-ready product from scratch.',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop',
    'beginner', 79.99, 'USD', 39.99, 'published', false,
    '10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001',
    4.6, 412, 9640, 540, 72, now()
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'sat-math-mastery',
    'SAT Math Mastery',
    'Proven strategies to maximize your SAT math score.',
    'Every concept, question type, and time-saving technique you need to walk into the SAT confident.',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=450&fit=crop',
    'all', 69.99, 'USD', null, 'published', false,
    '10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001',
    4.8, 731, 13920, 480, 64, now()
  )
on conflict (id) do nothing;

-- ---- A sample curriculum for the first course (section + preview lessons)
insert into public.sections (id, course_id, title, sort_order) values
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Getting Started with Limits',1),
  ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Derivatives',2)
on conflict (id) do nothing;

insert into public.lessons (id, section_id, course_id, title, type, content, duration_minutes, is_preview, sort_order) values
  ('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','What is a Limit? (Preview)','video','{"provider":"youtube","ref":"riXcZT2ICjA"}',9,true,1),
  ('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Evaluating Limits Algebraically','video','{"provider":"youtube","ref":"riXcZT2ICjA"}',14,false,2),
  ('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','The Derivative as a Rate of Change','video','{"provider":"youtube","ref":"riXcZT2ICjA"}',12,false,1)
on conflict (id) do nothing;

-- ---- Learning objectives + requirements for the first course
insert into public.course_objectives (course_id, content, sort_order) values
  ('20000000-0000-0000-0000-000000000001','Understand limits intuitively and formally',1),
  ('20000000-0000-0000-0000-000000000001','Differentiate any standard function with confidence',2),
  ('20000000-0000-0000-0000-000000000001','Apply integration to real-world problems',3),
  ('20000000-0000-0000-0000-000000000001','Build lasting mathematical intuition',4)
on conflict do nothing;

insert into public.course_requirements (course_id, content, sort_order) values
  ('20000000-0000-0000-0000-000000000001','Comfort with high-school algebra',1),
  ('20000000-0000-0000-0000-000000000001','A curious, persistent mindset',2)
on conflict do nothing;

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
