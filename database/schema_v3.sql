-- ============================================================
-- Hot Spot Pizza - Migration v3 (Shop info, categories, statuses)
-- Run AFTER schema_v2.sql in Supabase Dashboard → SQL Editor
-- ============================================================

-- ===== Extend restaurant_settings =====
alter table public.restaurant_settings add column if not exists shop_name text;
alter table public.restaurant_settings add column if not exists address text;
alter table public.restaurant_settings add column if not exists shop_latitude numeric(10,6);
alter table public.restaurant_settings add column if not exists shop_longitude numeric(10,6);
alter table public.restaurant_settings add column if not exists contact_number text;
alter table public.restaurant_settings add column if not exists num_tables int not null default 20;
alter table public.restaurant_settings add column if not exists min_order_amount numeric(10,2) not null default 200;
alter table public.restaurant_settings add column if not exists delivery_radius_km numeric(6,2) not null default 3;
alter table public.restaurant_settings add column if not exists admin_display_name text;

update public.restaurant_settings
set shop_name = coalesce(shop_name, 'Hotspot Pizza'),
    address = coalesce(address, 'G16A, Block G, Sector 23, Sanjay Nagar, Ghaziabad, Uttar Pradesh 201017'),
    shop_latitude = coalesce(shop_latitude, 28.690931),
    shop_longitude = coalesce(shop_longitude, 77.454294),
    contact_number = coalesce(contact_number, '+91 98XXXXXXXX')
where id = 1;

-- ===== Categories =====
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
drop policy if exists "Public access categories" on public.categories;
create policy "Public access categories" on public.categories for all using (true) with check (true);

insert into public.categories (name, sort_order) values
('Combos', 0), ('Snacks', 1), ('Desserts', 2), ('Garlic Bread', 3),
('Shakes', 4), ('Simple Veg Pizza', 5), ('Veg Special', 6),
('Veg Treat', 7), ('Feast Special', 8), ('Hot Pizza Special', 9),
('Burgers', 10)
on conflict (name) do nothing;

-- ===== menu_items: discount price =====
alter table public.menu_items add column if not exists discount_price numeric(10,2);

-- ===== orders: new statuses + rejection =====
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('Accepted','Preparing','Out For Delivery','Delivered','Rejected','Received','Ready','Done'));
alter table public.orders add column if not exists rejection_reason text;

-- ===== Realtime =====
do $$
begin
  begin execute 'alter publication supabase_realtime add table public.categories'; exception when others then null; end;
end $$;
