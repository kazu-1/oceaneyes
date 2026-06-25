-- Add group_id to observations so unidentified posts can still carry a group
alter table public.observations
  add column if not exists group_id uuid references public.groups(id);
