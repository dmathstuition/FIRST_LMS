-- ============================================================================
-- Single-tutor lockdown.
--
-- D-MATHS is the only instructor/admin on this platform. Everyone who signs up
-- is a customer (student) — no one can self-register as a tutor. This redefines
-- handle_new_user() to ALWAYS create a student profile, ignoring any role in the
-- sign-up metadata (defence-in-depth: even a crafted request can't self-elevate).
--
-- Instructor/admin roles are granted only by the seed or by an existing admin
-- via the admin panel (setUserRole, which is admin-only under RLS).
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Always a student. The role in metadata is intentionally ignored.
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url',
    'student'
  );

  insert into public.streaks (user_id) values (new.id)
  on conflict do nothing;

  return new;
end;
$$;

-- Demote any accounts that self-registered as instructors before this lockdown
-- (keeps only the seeded D-MATHS instructor/admin). Adjust the excluded id if
-- your owner account differs from the seed.
update public.profiles
set role = 'student'
where role = 'instructor'
  and id <> '00000000-0000-0000-0000-000000000001';
