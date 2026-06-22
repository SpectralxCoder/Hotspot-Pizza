-- ============================================================
-- Hot Spot Pizza - Migration v2 (Auth, Menu CRUD, Settings, Map)
-- Run AFTER /app/database/schema.sql, in Supabase Dashboard → SQL Editor
-- ============================================================

create extension if not exists pgcrypto;

-- =============== MENU ITEMS ================================
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null,
  price numeric(10,2),                 -- null for items with sizes
  sizes jsonb,                          -- [{"size":"Regular","price":180}, ...]
  image_url text,
  in_stock boolean not null default true,
  is_popular boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menu_items_category_idx on public.menu_items(category);
create index if not exists menu_items_sort_idx on public.menu_items(sort_order);

alter table public.menu_items enable row level security;

drop policy if exists "Public read menu_items" on public.menu_items;
create policy "Public read menu_items" on public.menu_items for select using (true);

drop policy if exists "Public write menu_items" on public.menu_items;
create policy "Public write menu_items" on public.menu_items for all using (true) with check (true);

drop trigger if exists menu_items_set_updated_at on public.menu_items;
create trigger menu_items_set_updated_at before update on public.menu_items
  for each row execute procedure public.set_updated_at();

-- =============== RESTAURANT SETTINGS =======================
create table if not exists public.restaurant_settings (
  id int primary key default 1,
  is_open boolean not null default true,
  override_until timestamptz,
  popular_mode text not null default 'all_time' check (popular_mode in ('all_time','last_30_days')),
  opening_hours jsonb not null default '{"start":"11:45","end":"23:00"}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint singleton_check check (id = 1)
);

insert into public.restaurant_settings (id) values (1) on conflict (id) do nothing;

alter table public.restaurant_settings enable row level security;

drop policy if exists "Public read settings" on public.restaurant_settings;
create policy "Public read settings" on public.restaurant_settings for select using (true);

drop policy if exists "Public write settings" on public.restaurant_settings;
create policy "Public write settings" on public.restaurant_settings for all using (true) with check (true);

-- =============== ORDERS — additional cols =================
alter table public.orders add column if not exists user_id uuid;
alter table public.orders add column if not exists latitude numeric(10,6);
alter table public.orders add column if not exists longitude numeric(10,6);
alter table public.orders add column if not exists distance_km numeric(6,2);
alter table public.orders add column if not exists eta_minutes int;
alter table public.orders add column if not exists location_label text;

create index if not exists orders_user_id_idx on public.orders(user_id);

-- =============== STORAGE BUCKET menu-images ===============
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read menu-images" on storage.objects;
create policy "Public read menu-images" on storage.objects
  for select using (bucket_id = 'menu-images');

drop policy if exists "Public upload menu-images" on storage.objects;
create policy "Public upload menu-images" on storage.objects
  for insert with check (bucket_id = 'menu-images');

drop policy if exists "Public update menu-images" on storage.objects;
create policy "Public update menu-images" on storage.objects
  for update using (bucket_id = 'menu-images') with check (bucket_id = 'menu-images');

drop policy if exists "Public delete menu-images" on storage.objects;
create policy "Public delete menu-images" on storage.objects
  for delete using (bucket_id = 'menu-images');

-- Realtime
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.menu_items'; exception when others then null; end;
  begin execute 'alter publication supabase_realtime add table public.restaurant_settings'; exception when others then null; end;
end $$;
