-- Add missing columns to observations
alter table public.observations
  add column if not exists title text,
  add column if not exists shop_name_free text;

-- Fix abundance check constraint to match UI values
alter table public.observations
  drop constraint if exists observations_abundance_check;

alter table public.observations
  add constraint observations_abundance_check
  check (abundance in ('1', '少数', '多数', '大群'));

-- Storage bucket: photos
-- Run this in Supabase Dashboard > SQL Editor
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Storage RLS: allow authenticated users to upload
create policy "photos authenticated upload"
  on storage.objects for insert
  with check (
    bucket_id = 'photos'
    and auth.role() = 'authenticated'
  );

-- Storage RLS: allow public read
create policy "photos public read"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Storage RLS: allow owners to delete their own files
create policy "photos own delete"
  on storage.objects for delete
  using (
    bucket_id = 'photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
