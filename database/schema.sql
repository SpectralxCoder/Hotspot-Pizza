-- ============================================================
-- Hot Spot Pizza - Supabase Schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- Enable required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- =============== ORDERS =====================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text,
  address text,
  table_number int,
  mode text not null check (mode in ('dine_in','delivery')),
  status text not null default 'Received'
    check (status in ('Received','Preparing','Ready','Delivered','Done')),
  total_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- =============== ORDER ITEMS ================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  item_name text not null,
  size text,
  quantity int not null default 1,
  price numeric(10,2) not null
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- =============== ARCHIVED ORDERS ============================
create table if not exists public.archived_orders (
  id uuid primary key default gen_random_uuid(),
  original_order_id uuid,
  customer_name text not null,
  order_data jsonb not null,
  completed_at timestamptz not null default now()
);

create index if not exists archived_orders_completed_at_idx
  on public.archived_orders(completed_at desc);

-- =============== AUTO UPDATE TRIGGER ========================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();

-- =============== RLS POLICIES (MVP: PUBLIC) =================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.archived_orders enable row level security;

drop policy if exists "Public access orders" on public.orders;
create policy "Public access orders" on public.orders
  for all using (true) with check (true);

drop policy if exists "Public access order_items" on public.order_items;
create policy "Public access order_items" on public.order_items
  for all using (true) with check (true);

drop policy if exists "Public access archived_orders" on public.archived_orders;
create policy "Public access archived_orders" on public.archived_orders
  for all using (true) with check (true);

-- =============== REALTIME ===================================
-- Enable realtime broadcasts for the tables
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table public.orders';
  exception when others then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.order_items';
  exception when others then null;
  end;
  begin
    execute 'alter publication supabase_realtime add table public.archived_orders';
  exception when others then null;
  end;
end $$;
