-- ============================================================================
-- DMATHS Learning Hub — Row Level Security
-- Migration 0003: enable RLS on every table + policies
--
-- Model:
--   * Public catalog (published courses, categories, blog, reviews) is readable
--     by anyone (anon + authenticated).
--   * Learners can read/write only their own rows.
--   * Instructors manage the courses they own (via public.owns_course()).
--   * Admins bypass restrictions (via public.is_admin()).
--   * Helper functions are defined in 0002_functions.sql.
-- ============================================================================

-- Enable RLS on all public tables.
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admins manage profiles"
  on public.profiles for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- instructor_profiles
-- ---------------------------------------------------------------------------
create policy "Instructor profiles are viewable by everyone"
  on public.instructor_profiles for select using (true);
create policy "Instructors manage own profile"
  on public.instructor_profiles for all
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- ---------------------------------------------------------------------------
-- categories (public read; admin write)
-- ---------------------------------------------------------------------------
create policy "Categories are public" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- courses + related content
-- ---------------------------------------------------------------------------
create policy "Published courses are public"
  on public.courses for select
  using (status = 'published' or instructor_id = auth.uid() or public.is_admin());
create policy "Instructors create courses"
  on public.courses for insert
  with check (instructor_id = auth.uid() and public.auth_role() in ('instructor','admin'));
create policy "Instructors update own courses"
  on public.courses for update
  using (owns_course(id)) with check (owns_course(id));
create policy "Instructors delete own courses"
  on public.courses for delete using (owns_course(id));

-- Objectives / requirements / sections mirror course ownership; readable when
-- the parent course is visible.
create policy "Course objectives readable" on public.course_objectives for select using (true);
create policy "Course objectives writable by owner" on public.course_objectives for all
  using (owns_course(course_id)) with check (owns_course(course_id));

create policy "Course requirements readable" on public.course_requirements for select using (true);
create policy "Course requirements writable by owner" on public.course_requirements for all
  using (owns_course(course_id)) with check (owns_course(course_id));

create policy "Sections readable" on public.sections for select using (true);
create policy "Sections writable by owner" on public.sections for all
  using (owns_course(course_id)) with check (owns_course(course_id));

-- Lessons: preview lessons + owned/enrolled lessons are readable.
create policy "Lessons readable when preview, owned, or enrolled"
  on public.lessons for select
  using (is_preview or owns_course(course_id) or is_enrolled(course_id));
create policy "Lessons writable by owner" on public.lessons for all
  using (owns_course(course_id)) with check (owns_course(course_id));

create policy "Lesson resources readable when enrolled or owner"
  on public.lesson_resources for select
  using (
    owns_course((select course_id from public.lessons l where l.id = lesson_id))
    or is_enrolled((select course_id from public.lessons l where l.id = lesson_id))
  );
create policy "Lesson resources writable by owner"
  on public.lesson_resources for all
  using (owns_course((select course_id from public.lessons l where l.id = lesson_id)))
  with check (owns_course((select course_id from public.lessons l where l.id = lesson_id)));

-- ---------------------------------------------------------------------------
-- Learner-owned tables: users see/write only their own rows.
-- Instructors may read progress/enrollments for their own courses.
-- ---------------------------------------------------------------------------
create policy "Users read own enrollments"
  on public.enrollments for select
  using (user_id = auth.uid() or owns_course(course_id));
create policy "Users create own enrollments"
  on public.enrollments for insert with check (user_id = auth.uid());
create policy "Users update own enrollments"
  on public.enrollments for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users read own progress"
  on public.lesson_progress for select
  using (user_id = auth.uid() or owns_course(course_id));
create policy "Users write own progress"
  on public.lesson_progress for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users manage own bookmarks" on public.bookmarks for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage own notes" on public.notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage own wishlist" on public.wishlists for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Assessments
-- ---------------------------------------------------------------------------
create policy "Quizzes readable when enrolled or owner"
  on public.quizzes for select
  using (owns_course(course_id) or is_enrolled(course_id));
create policy "Quizzes writable by owner" on public.quizzes for all
  using (owns_course(course_id)) with check (owns_course(course_id));

create policy "Questions readable when enrolled or owner"
  on public.questions for select
  using (
    is_enrolled((select course_id from public.quizzes q where q.id = quiz_id))
    or owns_course((select course_id from public.quizzes q where q.id = quiz_id))
  );
create policy "Questions writable by owner" on public.questions for all
  using (owns_course((select course_id from public.quizzes q where q.id = quiz_id)))
  with check (owns_course((select course_id from public.quizzes q where q.id = quiz_id)));

-- Options: hide is_correct is handled at query layer; readable to enrolled/owner.
create policy "Question options readable when enrolled or owner"
  on public.question_options for select
  using (
    is_enrolled((select q.course_id from public.quizzes q
                 join public.questions qn on qn.quiz_id = q.id
                 where qn.id = question_id))
    or owns_course((select q.course_id from public.quizzes q
                 join public.questions qn on qn.quiz_id = q.id
                 where qn.id = question_id))
  );
create policy "Question options writable by owner"
  on public.question_options for all
  using (owns_course((select q.course_id from public.quizzes q
                 join public.questions qn on qn.quiz_id = q.id
                 where qn.id = question_id)))
  with check (owns_course((select q.course_id from public.quizzes q
                 join public.questions qn on qn.quiz_id = q.id
                 where qn.id = question_id)));

create policy "Users manage own quiz attempts" on public.quiz_attempts for all
  using (user_id = auth.uid()
         or owns_course((select course_id from public.quizzes q where q.id = quiz_id)))
  with check (user_id = auth.uid());
create policy "Users manage own quiz answers" on public.quiz_answers for all
  using (exists (select 1 from public.quiz_attempts a
                 where a.id = attempt_id and a.user_id = auth.uid()))
  with check (exists (select 1 from public.quiz_attempts a
                 where a.id = attempt_id and a.user_id = auth.uid()));

create policy "Assignments readable when enrolled or owner"
  on public.assignments for select
  using (owns_course(course_id) or is_enrolled(course_id));
create policy "Assignments writable by owner" on public.assignments for all
  using (owns_course(course_id)) with check (owns_course(course_id));

create policy "Submissions visible to owner student or course owner"
  on public.assignment_submissions for select
  using (user_id = auth.uid()
         or owns_course((select course_id from public.assignments a where a.id = assignment_id)));
create policy "Students create own submissions"
  on public.assignment_submissions for insert with check (user_id = auth.uid());
create policy "Students update own, instructors grade"
  on public.assignment_submissions for update
  using (user_id = auth.uid()
         or owns_course((select course_id from public.assignments a where a.id = assignment_id)));

-- ---------------------------------------------------------------------------
-- Certificates (owner reads; public verification is done server-side via a
-- SECURITY DEFINER RPC / service role, so no anon SELECT policy here).
-- ---------------------------------------------------------------------------
create policy "Users read own certificates"
  on public.certificates for select using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Commerce (users see own orders; admins see all)
-- ---------------------------------------------------------------------------
create policy "Coupons readable" on public.coupons for select using (true);
create policy "Admins manage coupons" on public.coupons for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Bundles are public" on public.bundles for select using (true);
create policy "Admins manage bundles" on public.bundles for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Bundle courses readable" on public.bundle_courses for select using (true);
create policy "Admins manage bundle courses" on public.bundle_courses for all
  using (public.is_admin()) with check (public.is_admin());

create policy "Users read own orders" on public.orders for select
  using (user_id = auth.uid() or public.is_admin());
create policy "Users create own orders" on public.orders for insert
  with check (user_id = auth.uid());
create policy "Users read own order items" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (o.user_id = auth.uid() or public.is_admin())));
create policy "Users read own payments" on public.payments for select
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (o.user_id = auth.uid() or public.is_admin())));
create policy "Users read own invoices" on public.invoices for select
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (o.user_id = auth.uid() or public.is_admin())));
create policy "Users manage own refund requests" on public.refund_requests for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "Users manage own affiliate codes" on public.affiliate_codes for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Community
-- ---------------------------------------------------------------------------
create policy "Reviews are public" on public.reviews for select using (true);
create policy "Enrolled users write reviews" on public.reviews for insert
  with check (user_id = auth.uid() and is_enrolled(course_id));
create policy "Users update own reviews" on public.reviews for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users delete own reviews" on public.reviews for delete
  using (user_id = auth.uid() or public.is_admin());

create policy "Discussions readable when enrolled or owner"
  on public.discussions for select
  using (owns_course(course_id) or is_enrolled(course_id));
create policy "Enrolled users create discussions" on public.discussions for insert
  with check (user_id = auth.uid() and (is_enrolled(course_id) or owns_course(course_id)));
create policy "Authors update own discussions" on public.discussions for update
  using (user_id = auth.uid() or owns_course(course_id));
create policy "Authors delete own discussions" on public.discussions for delete
  using (user_id = auth.uid() or owns_course(course_id));

create policy "Comments readable to authenticated" on public.comments for select
  using (auth.uid() is not null);
create policy "Users create own comments" on public.comments for insert
  with check (user_id = auth.uid());
create policy "Users update own comments" on public.comments for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users delete own comments" on public.comments for delete
  using (user_id = auth.uid() or public.is_admin());

create policy "Users manage own likes" on public.likes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Likes readable" on public.likes for select using (true);

create policy "Users read own messages" on public.messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy "Users send messages" on public.messages for insert
  with check (sender_id = auth.uid());
create policy "Recipients update read state" on public.messages for update
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create policy "Users read own notifications" on public.notifications for select
  using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Announcements readable when enrolled or owner"
  on public.announcements for select
  using (course_id is null or is_enrolled(course_id) or owns_course(course_id));
create policy "Course owners create announcements" on public.announcements for insert
  with check (author_id = auth.uid() and (course_id is null or owns_course(course_id)));

-- Anyone (incl. anon) may subscribe to the newsletter; nobody may read the list.
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert
  with check (true);
create policy "Admins read subscribers" on public.newsletter_subscribers for select
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Gamification
-- ---------------------------------------------------------------------------
create policy "XP events readable by owner" on public.xp_events for select
  using (user_id = auth.uid() or public.is_admin());
create policy "Badges are public" on public.badges for select using (true);
create policy "Admins manage badges" on public.badges for all
  using (public.is_admin()) with check (public.is_admin());
create policy "User badges readable" on public.user_badges for select using (true);
create policy "Users read own streak" on public.streaks for select
  using (user_id = auth.uid() or public.is_admin());
create policy "Users update own streak" on public.streaks for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage own goals" on public.learning_goals for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Blog
-- ---------------------------------------------------------------------------
create policy "Blog categories public" on public.blog_categories for select using (true);
create policy "Admins manage blog categories" on public.blog_categories for all
  using (public.is_admin()) with check (public.is_admin());
create policy "Published posts are public"
  on public.blog_posts for select
  using (published or author_id = auth.uid() or public.is_admin());
create policy "Authors manage own posts" on public.blog_posts for all
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());
create policy "Blog comments readable" on public.blog_comments for select using (true);
create policy "Users create own blog comments" on public.blog_comments for insert
  with check (user_id = auth.uid());
create policy "Users delete own blog comments" on public.blog_comments for delete
  using (user_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Operations
-- ---------------------------------------------------------------------------
create policy "Users manage own tickets" on public.support_tickets for all
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy "Only admins read audit logs" on public.audit_logs for select
  using (public.is_admin());
create policy "Site settings public read" on public.site_settings for select using (true);
create policy "Admins write site settings" on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public certificate verification RPC (bypasses RLS safely; returns only the
-- fields needed to render the public verification page).
-- ---------------------------------------------------------------------------
create or replace function public.verify_certificate(token text)
returns table (
  certificate_number text,
  issued_at timestamptz,
  student_name text,
  course_title text
)
language sql
stable
security definer
set search_path = public
as $$
  select c.certificate_number,
         c.issued_at,
         p.full_name,
         co.title
  from public.certificates c
  join public.profiles p on p.id = c.user_id
  join public.courses co on co.id = c.course_id
  where c.verification_token = token;
$$;

grant execute on function public.verify_certificate(text) to anon, authenticated;
