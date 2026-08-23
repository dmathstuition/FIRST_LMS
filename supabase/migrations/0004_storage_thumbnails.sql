-- ============================================================================
-- Storage bucket for course thumbnail images.
--
-- Instructors/admins upload a course cover image from the course builder
-- (browser → Supabase Storage). Reads are public so cards and course pages can
-- display them.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('course-thumbnails', 'course-thumbnails', true)
on conflict (id) do nothing;

drop policy if exists "course thumbnails are publicly readable" on storage.objects;
create policy "course thumbnails are publicly readable"
  on storage.objects for select
  using (bucket_id = 'course-thumbnails');

drop policy if exists "instructors upload course thumbnails" on storage.objects;
create policy "instructors upload course thumbnails"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-thumbnails'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('instructor', 'admin')
    )
  );

drop policy if exists "instructors manage own course thumbnails" on storage.objects;
create policy "instructors manage own course thumbnails"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'course-thumbnails' and owner = auth.uid());

drop policy if exists "instructors delete own course thumbnails" on storage.objects;
create policy "instructors delete own course thumbnails"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'course-thumbnails' and owner = auth.uid());
