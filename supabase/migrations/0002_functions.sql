-- ============================================================================
-- DMATHS Learning Hub — Functions & Triggers
-- Migration 0002: business logic, aggregate maintenance, RBAC helpers
-- ============================================================================

-- ----------------------------------------------------------------------------
-- RBAC helper functions (SECURITY DEFINER so policies can call them safely).
-- Used throughout 0003_policies.sql to keep policy expressions readable.
-- ----------------------------------------------------------------------------

-- NOTE: named `auth_role` (not `current_role`) because CURRENT_ROLE is a
-- reserved SQL keyword in PostgreSQL and cannot be used as a function name.
create or replace function public.auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.auth_role() = 'admin', false);
$$;

-- True when the current user owns the given course (or is an admin).
create or replace function public.owns_course(course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
      or exists (
        select 1 from public.courses c
        where c.id = course and c.instructor_id = auth.uid()
      );
$$;

-- True when the current user is enrolled in the given course.
create or replace function public.is_enrolled(course uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    where e.course_id = course
      and e.user_id = auth.uid()
      and e.status in ('active', 'completed')
  );
$$;

-- ----------------------------------------------------------------------------
-- Auto-provision a profile (and streak row) whenever an auth user is created.
-- Reads role + name from the sign-up metadata when present.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role user_role;
begin
  -- Only allow self-selecting student/instructor at sign-up; never admin.
  requested_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::user_role, 'student'
  );
  if requested_role = 'admin' then
    requested_role := 'student';
  end if;

  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    requested_role
  );

  insert into public.streaks (user_id) values (new.id)
  on conflict do nothing;

  if requested_role = 'instructor' then
    insert into public.instructor_profiles (id) values (new.id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- updated_at maintenance across all mutable tables.
-- ----------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array[
    'profiles','instructor_profiles','courses','lessons','enrollments',
    'lesson_progress','notes','quizzes','reviews','discussions','comments',
    'orders','support_tickets','blog_posts','streaks'
  ];
begin
  foreach t in array tables loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at();', t
    );
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- Course aggregate maintenance: lesson_count + duration_minutes.
-- ----------------------------------------------------------------------------
create or replace function public.refresh_course_lesson_stats()
returns trigger
language plpgsql
as $$
declare
  target uuid := coalesce(new.course_id, old.course_id);
begin
  update public.courses c
  set lesson_count = sub.cnt,
      duration_minutes = sub.total_minutes
  from (
    select course_id,
           count(*) as cnt,
           coalesce(sum(duration_minutes), 0) as total_minutes
    from public.lessons
    where course_id = target
    group by course_id
  ) sub
  where c.id = target;

  -- Handle deletion of the last lesson (sub returns no row).
  if not found then
    update public.courses set lesson_count = 0, duration_minutes = 0
    where id = target;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_lessons_stats
  after insert or update or delete on public.lessons
  for each row execute function public.refresh_course_lesson_stats();

-- ----------------------------------------------------------------------------
-- Course rating aggregate maintenance from reviews.
-- ----------------------------------------------------------------------------
create or replace function public.refresh_course_rating()
returns trigger
language plpgsql
as $$
declare
  target uuid := coalesce(new.course_id, old.course_id);
begin
  update public.courses c
  set rating_avg = coalesce(sub.avg_rating, 0),
      rating_count = coalesce(sub.cnt, 0)
  from (
    select course_id, round(avg(rating), 2) as avg_rating, count(*) as cnt
    from public.reviews
    where course_id = target
    group by course_id
  ) sub
  where c.id = target;

  if not found then
    update public.courses set rating_avg = 0, rating_count = 0 where id = target;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_course_rating();

-- ----------------------------------------------------------------------------
-- Student count maintenance from enrollments.
-- ----------------------------------------------------------------------------
create or replace function public.refresh_course_students()
returns trigger
language plpgsql
as $$
declare
  target uuid := coalesce(new.course_id, old.course_id);
begin
  update public.courses c
  set student_count = (
    select count(*) from public.enrollments
    where course_id = target and status in ('active', 'completed')
  )
  where c.id = target;
  return coalesce(new, old);
end;
$$;

create trigger trg_enrollments_students
  after insert or update or delete on public.enrollments
  for each row execute function public.refresh_course_students();

-- ----------------------------------------------------------------------------
-- Progress rollup: when a lesson_progress row flips to completed, recompute the
-- enrollment's progress_pct and mark completion (issuing a certificate).
-- ----------------------------------------------------------------------------
create or replace function public.recompute_enrollment_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total_lessons integer;
  done_lessons integer;
  pct numeric(5,2);
begin
  select lesson_count into total_lessons
  from public.courses where id = new.course_id;

  if total_lessons is null or total_lessons = 0 then
    return new;
  end if;

  select count(*) into done_lessons
  from public.lesson_progress
  where user_id = new.user_id and course_id = new.course_id and completed;

  pct := round((done_lessons::numeric / total_lessons) * 100, 2);

  update public.enrollments
  set progress_pct = pct,
      last_lesson_id = new.lesson_id,
      status = case when pct >= 100 then 'completed' else status end,
      completed_at = case when pct >= 100 then now() else completed_at end
  where user_id = new.user_id and course_id = new.course_id;

  -- Auto-issue a certificate on 100% completion.
  if pct >= 100 then
    insert into public.certificates (user_id, course_id, certificate_number)
    values (
      new.user_id,
      new.course_id,
      'DMATHS-' || to_char(now(), 'YYYY') || '-' ||
        upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8))
    )
    on conflict (user_id, course_id) do nothing;

    -- Award completion XP.
    insert into public.xp_events (user_id, amount, reason)
    values (new.user_id, 100, 'course_completed');
  end if;

  return new;
end;
$$;

create trigger trg_lesson_progress_rollup
  after insert or update on public.lesson_progress
  for each row when (new.completed is true)
  execute function public.recompute_enrollment_progress();

-- ----------------------------------------------------------------------------
-- Keep profiles.xp_points in sync as XP events accrue.
-- ----------------------------------------------------------------------------
create or replace function public.apply_xp_event()
returns trigger
language plpgsql
as $$
begin
  update public.profiles
  set xp_points = xp_points + new.amount
  where id = new.user_id;
  return new;
end;
$$;

create trigger trg_xp_events_apply
  after insert on public.xp_events
  for each row execute function public.apply_xp_event();
