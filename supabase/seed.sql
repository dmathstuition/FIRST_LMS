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

-- ---- Courses (all published so they appear in the catalog + featured strip)
insert into public.courses (
  id, slug, title, subtitle, description, thumbnail_url, level, price, currency,
  discount_price, status, is_featured, category_id, instructor_id,
  rating_avg, rating_count, student_count, duration_minutes, lesson_count, published_at
) values
  (
    '20000000-0000-0000-0000-000000000001',
    'mathematics-made-simple',
    'Mathematics Made Simple',
    'Build real intuition for numbers, algebra, and problem-solving.',
    'A visual-first mathematics course that builds deep intuition before formalism. Perfect for students and self-learners who want to truly understand — not just memorize.',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&h=450&fit=crop',
    'beginner', 8000, 'NGN', 5000, 'published', true,
    '10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001',
    4.9, 128, 1840, 720, 96, now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'coding-for-kids-scratch-to-python',
    'Coding for Kids: Scratch to Python',
    'A fun, step-by-step coding journey for young learners.',
    'Kids start with visual Scratch projects and gradually move to real Python — building games and apps while learning to think like programmers.',
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&h=450&fit=crop',
    'beginner', 10000, 'NGN', 6500, 'published', true,
    '10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001',
    4.8, 209, 2431, 640, 88, now()
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'data-analysis-for-beginners',
    'Data Analysis for Beginners',
    'Spreadsheets, Python, and visualization from scratch.',
    'Learn the full data-analysis workflow with hands-on projects: cleaning, analysis, and turning raw numbers into clear, compelling insight.',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    'beginner', 9000, 'NGN', null, 'published', true,
    '10000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001',
    4.7, 87, 1123, 600, 74, now()
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'ai-for-everyone',
    'AI for Everyone',
    'Understand and use artificial intelligence in everyday life.',
    'Demystify artificial intelligence — how it works, where it is used, and how anyone can apply modern AI tools to learn and work smarter.',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=450&fit=crop',
    'beginner', 12000, 'NGN', 7500, 'published', true,
    '10000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001',
    4.9, 54, 782, 480, 60, now()
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'tech-in-teaching',
    'Tech in Teaching: The Digital Classroom',
    'Practical tools and strategies for modern educators.',
    'Equip teachers with the digital tools, platforms, and techniques to create engaging, effective, technology-powered classrooms.',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=450&fit=crop',
    'all', 8000, 'NGN', 5000, 'published', false,
    '10000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001',
    4.8, 41, 964, 540, 68, now()
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    'web-development-foundations',
    'Web Development Foundations',
    'Build real websites with HTML, CSS, and JavaScript.',
    'Go from zero to building and deploying real, responsive websites — the practical foundation every modern developer needs.',
    'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=450&fit=crop',
    'beginner', 10000, 'NGN', null, 'published', false,
    '10000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001',
    4.8, 73, 1392, 720, 92, now()
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
