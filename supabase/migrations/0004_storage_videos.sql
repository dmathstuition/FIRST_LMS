-- ============================================================================
-- Storage bucket for course lesson videos.
--
-- Instructors/admins upload lesson videos directly from the course builder
-- (browser → Supabase Storage). Reads are public so the course player can
-- stream them (matching the public-thumbnail pattern); tighten to signed URLs
-- later if you need paid-content protection at the storage layer.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('course-videos', 'course-videos', true)
on conflict (id) do nothing;

-- Anyone may read (stream) course videos.
drop policy if exists "course videos are publicly readable" on storage.objects;
create policy "course videos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'course-videos');

-- Only instructors/admins may upload.
drop policy if exists "instructors upload course videos" on storage.objects;
create policy "instructors upload course videos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'course-videos'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('instructor', 'admin')
    )
  );

-- Instructors/admins may replace/remove videos they uploaded.
drop policy if exists "instructors manage own course videos" on storage.objects;
create policy "instructors manage own course videos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'course-videos' and owner = auth.uid());

drop policy if exists "instructors delete own course videos" on storage.objects;
create policy "instructors delete own course videos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'course-videos' and owner = auth.uid());
