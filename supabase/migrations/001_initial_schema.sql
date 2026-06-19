-- Areas (diving areas)
create table public.areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  description text,
  map_position jsonb,
  species_count int not null default 0,
  post_count int not null default 0,
  shop_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Shops (dive operators)
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area_id uuid references public.areas(id),
  phone text,
  url text,
  created_at timestamptz not null default now()
);

-- Dive points
create table public.points (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  area_id uuid references public.areas(id),
  type text check (type in ('beach', 'boat')),
  depth_min int,
  depth_max int,
  map_coords jsonb,
  created_at timestamptz not null default now()
);

-- Point <-> Shop many-to-many
create table public.point_shops (
  point_id uuid references public.points(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  primary key (point_id, shop_id)
);

-- Species groups (categories)
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  sort_order int not null default 0
);

-- Species (taxa)
create table public.taxa (
  id uuid primary key default gen_random_uuid(),
  name_ja text not null,
  name_scientific text,
  group_id uuid references public.groups(id),
  colors jsonb,
  description text,
  record_count int not null default 0,
  confirmed_areas uuid[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'shop', 'expert', 'admin')),
  shop_id uuid references public.shops(id),
  dive_count int not null default 0,
  post_count int not null default 0,
  species_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Observations
create table public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  photo_url text,
  photo_path text,
  species_id uuid references public.taxa(id),
  species_name_raw text,
  area_id uuid references public.areas(id),
  point_id uuid references public.points(id),
  shop_id uuid references public.shops(id),
  observed_at date not null,
  depth_min int,
  depth_max int,
  temperature decimal(4,1),
  visibility int,
  abundance text check (abundance in ('single', 'few', 'several', 'many', 'school')),
  substrate text,
  habitat text,
  comment text,
  map_coords jsonb,
  permissions jsonb not null default '{"web_public": true, "pr_use": false, "research_use": false, "credit_type": "handle"}',
  status text not null default 'unconfirmed' check (status in (
    'unconfirmed', 'unidentified', 'poster_identified', 'shop_confirmed',
    'expert_confirmed', 'research_grade', 'review', 'rejected'
  )),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Identification history
create table public.identifications (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  user_id uuid references public.profiles(id),
  species_id uuid references public.taxa(id),
  role text not null,
  comment text,
  action text not null check (action in ('identify', 'confirm', 'hold', 'reject', 'reopen')),
  created_at timestamptz not null default now()
);

-- RLS Policies
alter table public.areas enable row level security;
alter table public.shops enable row level security;
alter table public.points enable row level security;
alter table public.point_shops enable row level security;
alter table public.groups enable row level security;
alter table public.taxa enable row level security;
alter table public.profiles enable row level security;
alter table public.observations enable row level security;
alter table public.identifications enable row level security;

-- Public read access for reference data
create policy "areas public read" on public.areas for select using (true);
create policy "shops public read" on public.shops for select using (true);
create policy "points public read" on public.points for select using (true);
create policy "point_shops public read" on public.point_shops for select using (true);
create policy "groups public read" on public.groups for select using (true);
create policy "taxa public read" on public.taxa for select using (true);

-- Profiles
create policy "profiles public read" on public.profiles for select using (true);
create policy "profiles own write" on public.profiles for all using (auth.uid() = id);

-- Observations
create policy "observations public read" on public.observations for select using (is_public = true);
create policy "observations own read" on public.observations for select using (auth.uid() = user_id);
create policy "observations authenticated insert" on public.observations for insert with check (auth.uid() = user_id);
create policy "observations own update" on public.observations for update using (auth.uid() = user_id);

-- Admin full access
create policy "admin areas" on public.areas for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "admin shops" on public.shops for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "admin points" on public.points for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "admin taxa" on public.taxa for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'expert'))
);
create policy "admin observations" on public.observations for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'expert', 'shop'))
);
create policy "identifications read" on public.identifications for select using (true);
create policy "identifications write" on public.identifications for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'expert', 'shop', 'user'))
);

-- Triggers
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger observations_updated_at before update on public.observations
  for each row execute function public.handle_updated_at();
create trigger taxa_updated_at before update on public.taxa
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed initial data
insert into public.groups (name, name_en, sort_order) values
  ('魚類', 'Fish', 1),
  ('ウミウシ', 'Nudibranch', 2),
  ('甲殻類', 'Crustacean', 3),
  ('頭足類', 'Cephalopod', 4),
  ('海藻・海草', 'Seaweed', 5),
  ('その他', 'Other', 6);

insert into public.areas (name, name_en, description) values
  ('田子', 'Tago', '西伊豆を代表するダイビングスポット。透明度が高く多様な生物が生息する'),
  ('安良里', 'Arari', 'ウミウシの宝庫として知られるエリア。穏やかな湾内で初心者にも人気'),
  ('黄金崎', 'Koganezaki', '夕日の名所でもある岬周辺。カエルアンコウの目撃例多数'),
  ('浮島', 'Ukishima', '沖合の無人島周辺。大型の魚群に出会える');
