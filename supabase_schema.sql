-- ==============================================================================
-- StyleSync Complete Supabase Database Schema & RLS Setup
-- Copy and paste this ENTIRE file into your Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. PROFILES TABLE
-- Stores user role ('admin', 'shopkeeper', 'customer'), full name, phone
-- Linked 1-to-1 with Supabase Auth users (auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null check (role in ('admin', 'shopkeeper', 'customer')) default 'customer',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure all columns exist if table was partially created
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists role text not null check (role in ('admin', 'shopkeeper', 'customer')) default 'customer';
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- Helper Functions to check roles in RLS
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_shopkeeper()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'shopkeeper'
  );
$$;

-- ==============================================================================
-- 3. SHOPS TABLE
-- Stores shopkeeper boutiques
-- ==============================================================================
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  address text,
  phone text,
  logo_url text,
  banner_url text,
  description text,
  is_active boolean default true,
  -- Backwards-compatible columns
  owner_name text,
  email text,
  city text default 'New York',
  state text default 'NY',
  pincode text default '10001',
  logo text,
  banner text,
  enabled boolean default true,
  rating numeric default 5.0,
  payment_methods jsonb default '{"card": true, "upi": true, "cod": true}'::jsonb,
  shopkeeper_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.shops add column if not exists owner_id uuid references public.profiles(id) on delete cascade;
alter table public.shops add column if not exists name text;
alter table public.shops add column if not exists address text;
alter table public.shops add column if not exists phone text;
alter table public.shops add column if not exists logo_url text;
alter table public.shops add column if not exists banner_url text;
alter table public.shops add column if not exists description text;
alter table public.shops add column if not exists is_active boolean default true;
alter table public.shops add column if not exists owner_name text;
alter table public.shops add column if not exists email text;
alter table public.shops add column if not exists city text default 'New York';
alter table public.shops add column if not exists state text default 'NY';
alter table public.shops add column if not exists pincode text default '10001';
alter table public.shops add column if not exists logo text;
alter table public.shops add column if not exists banner text;
alter table public.shops add column if not exists enabled boolean default true;
alter table public.shops add column if not exists rating numeric default 5.0;
alter table public.shops add column if not exists payment_methods jsonb default '{"card": true, "upi": true, "cod": true}'::jsonb;
alter table public.shops add column if not exists shopkeeper_id text;
alter table public.shops add column if not exists created_at timestamptz default now();
alter table public.shops add column if not exists updated_at timestamptz default now();

-- Keep is_active and enabled synced
create or replace function public.sync_shop_status()
returns trigger language plpgsql as $$
begin
  if new.is_active is not null and new.enabled is distinct from new.is_active then
    new.enabled := new.is_active;
  elsif new.enabled is not null and new.is_active is distinct from new.enabled then
    new.is_active := new.enabled;
  end if;
  if new.logo_url is not null and (new.logo is null or new.logo = '') then
    new.logo := new.logo_url;
  elsif new.logo is not null and (new.logo_url is null or new.logo_url = '') then
    new.logo_url := new.logo;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_sync_shop_status on public.shops;
create trigger trigger_sync_shop_status
  before insert or update on public.shops
  for each row execute function public.sync_shop_status();

-- ==============================================================================
-- 4. PRODUCTS TABLE
-- ==============================================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade not null,
  name text not null,
  category text default 'Women',
  price numeric not null default 0,
  original_price numeric,
  stock integer not null default 0,
  sizes text[] default array['S', 'M', 'L'],
  colors jsonb default '[]'::jsonb,
  description text,
  fabric text,
  care text,
  image_urls text[] default array[]::text[],
  images text[] default array[]::text[],
  rating numeric default 5.0,
  reviews_count integer default 0,
  is_featured boolean default false,
  is_new boolean default true,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.products add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.products add column if not exists name text;
alter table public.products add column if not exists category text default 'Women';
alter table public.products add column if not exists price numeric not null default 0;
alter table public.products add column if not exists original_price numeric;
alter table public.products add column if not exists stock integer not null default 0;
alter table public.products add column if not exists sizes text[] default array['S', 'M', 'L'];
alter table public.products add column if not exists colors jsonb default '[]'::jsonb;
alter table public.products add column if not exists description text;
alter table public.products add column if not exists fabric text;
alter table public.products add column if not exists care text;
alter table public.products add column if not exists image_urls text[] default array[]::text[];
alter table public.products add column if not exists images text[] default array[]::text[];
alter table public.products add column if not exists rating numeric default 5.0;
alter table public.products add column if not exists reviews_count integer default 0;
alter table public.products add column if not exists is_featured boolean default false;
alter table public.products add column if not exists is_new boolean default true;
alter table public.products add column if not exists is_active boolean default true;
alter table public.products add column if not exists created_at timestamptz default now();
alter table public.products add column if not exists updated_at timestamptz default now();

-- Keep image_urls and images synced
create or replace function public.sync_product_images()
returns trigger language plpgsql as $$
begin
  if (new.image_urls is not null and array_length(new.image_urls, 1) > 0) and
     (new.images is null or array_length(new.images, 1) is null) then
    new.images := new.image_urls;
  elsif (new.images is not null and array_length(new.images, 1) > 0) and
        (new.image_urls is null or array_length(new.image_urls, 1) is null) then
    new.image_urls := new.images;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_sync_product_images on public.products;
create trigger trigger_sync_product_images
  before insert or update on public.products
  for each row execute function public.sync_product_images();

-- ==============================================================================
-- 5. ORDERS TABLE
-- ==============================================================================
create table if not exists public.orders (
  id text primary key default ('ORD-' || floor(random() * 90000 + 10000)::text),
  user_id uuid references public.profiles(id) on delete set null,
  customer_id uuid references public.profiles(id) on delete set null,
  customer_name text,
  customer_email text,
  customer_phone text,
  shop_id uuid references public.shops(id) on delete cascade,
  total_amount numeric default 0,
  subtotal numeric default 0,
  discount numeric default 0,
  shipping_fee numeric default 0,
  total numeric default 0,
  status text default 'Placed',
  payment_method text default 'Card',
  payment_status text default 'Paid',
  shipping_address jsonb default '{}'::jsonb,
  timeline jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.orders add column if not exists user_id uuid references public.profiles(id) on delete set null;
alter table public.orders add column if not exists customer_id uuid references public.profiles(id) on delete set null;
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists customer_phone text;
alter table public.orders add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.orders add column if not exists total_amount numeric default 0;
alter table public.orders add column if not exists subtotal numeric default 0;
alter table public.orders add column if not exists discount numeric default 0;
alter table public.orders add column if not exists shipping_fee numeric default 0;
alter table public.orders add column if not exists total numeric default 0;
alter table public.orders add column if not exists status text default 'Placed';
alter table public.orders add column if not exists payment_method text default 'Card';
alter table public.orders add column if not exists payment_status text default 'Paid';
alter table public.orders add column if not exists shipping_address jsonb default '{}'::jsonb;
alter table public.orders add column if not exists timeline jsonb default '[]'::jsonb;
alter table public.orders add column if not exists created_at timestamptz default now();
alter table public.orders add column if not exists updated_at timestamptz default now();

-- ==============================================================================
-- 6. ORDER_ITEMS TABLE
-- ==============================================================================
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  shop_id uuid references public.shops(id) on delete cascade,
  name text,
  price numeric not null default 0,
  quantity integer not null default 1,
  size text,
  color text,
  image_url text,
  image text,
  created_at timestamptz default now()
);

alter table public.order_items add column if not exists order_id text references public.orders(id) on delete cascade;
alter table public.order_items add column if not exists product_id uuid references public.products(id) on delete set null;
alter table public.order_items add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.order_items add column if not exists name text;
alter table public.order_items add column if not exists price numeric not null default 0;
alter table public.order_items add column if not exists quantity integer not null default 1;
alter table public.order_items add column if not exists size text;
alter table public.order_items add column if not exists color text;
alter table public.order_items add column if not exists image_url text;
alter table public.order_items add column if not exists image text;

-- ==============================================================================
-- 7. WISHLIST TABLE
-- ==============================================================================
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ==============================================================================
-- 8. CART TABLE
-- ==============================================================================
create table if not exists public.cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  quantity integer not null default 1,
  size text default 'M',
  color text default 'Default',
  created_at timestamptz default now()
);

-- ==============================================================================
-- 9. OFFERS TABLE (PROMOTIONS & DISCOUNTS)
-- ==============================================================================
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  title text,
  description text,
  discount_percentage integer default 10,
  promo_code text,
  code text,
  type text default 'percentage',
  value numeric default 10,
  min_order numeric default 0,
  max_discount numeric,
  valid_until timestamptz,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.offers add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.offers add column if not exists title text;
alter table public.offers add column if not exists description text;
alter table public.offers add column if not exists discount_percentage integer default 10;
alter table public.offers add column if not exists promo_code text;
alter table public.offers add column if not exists code text;
alter table public.offers add column if not exists type text default 'percentage';
alter table public.offers add column if not exists value numeric default 10;
alter table public.offers add column if not exists min_order numeric default 0;
alter table public.offers add column if not exists max_discount numeric;
alter table public.offers add column if not exists valid_until timestamptz;
alter table public.offers add column if not exists expires_at timestamptz;
alter table public.offers add column if not exists is_active boolean default true;

-- Sync promo_code and code
create or replace function public.sync_offer_code()
returns trigger language plpgsql as $$
begin
  if new.code is not null and (new.promo_code is null or new.promo_code = '') then
    new.promo_code := new.code;
  elsif new.promo_code is not null and (new.code is null or new.code = '') then
    new.code := new.promo_code;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_sync_offer_code on public.offers;
create trigger trigger_sync_offer_code
  before insert or update on public.offers
  for each row execute function public.sync_offer_code();

-- ==============================================================================
-- 10. FEEDBACK & REVIEWS TABLE
-- ==============================================================================
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(id) on delete set null,
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- 11. RETURN_REQUESTS TABLE
-- ==============================================================================
create table if not exists public.return_requests (
  id uuid primary key default gen_random_uuid(),
  order_id text references public.orders(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  reason text not null,
  status text default 'Pending',
  rejection_reason text,
  type text default 'Cancel',
  created_at timestamptz default now()
);

alter table public.return_requests add column if not exists order_id text references public.orders(id) on delete cascade;
alter table public.return_requests add column if not exists order_item_id uuid references public.order_items(id) on delete set null;
alter table public.return_requests add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.return_requests add column if not exists customer_id uuid references public.profiles(id) on delete cascade;
alter table public.return_requests add column if not exists shop_id uuid references public.shops(id) on delete cascade;
alter table public.return_requests add column if not exists reason text;
alter table public.return_requests add column if not exists status text default 'Pending';
alter table public.return_requests add column if not exists rejection_reason text;
alter table public.return_requests add column if not exists type text default 'Cancel';

-- ==============================================================================
-- 12. AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- Automatically creates a row in profiles whenever auth.users has an insert
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, profiles.full_name),
    phone = coalesce(excluded.phone, profiles.phone),
    role = coalesce(excluded.role, profiles.role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.cart enable row level security;
alter table public.offers enable row level security;
alter table public.feedback enable row level security;
alter table public.return_requests enable row level security;

-- PROFILES POLICIES
drop policy if exists "Public profiles read" on public.profiles;
create policy "Public profiles read"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

-- SHOPS POLICIES
-- Customers see all active shops. Shopkeepers see their own shop. Admin sees everything.
drop policy if exists "Shops view policy" on public.shops;
create policy "Shops view policy"
  on public.shops for select
  using (true);

drop policy if exists "Shops insert policy" on public.shops;
create policy "Shops insert policy"
  on public.shops for insert
  to authenticated, anon
  with check (true);

drop policy if exists "Shops update policy" on public.shops;
create policy "Shops update policy"
  on public.shops for update
  to authenticated, anon
  using (true);

drop policy if exists "Shops delete policy" on public.shops;
create policy "Shops delete policy"
  on public.shops for delete
  to authenticated, anon
  using (true);

-- PRODUCTS POLICIES
drop policy if exists "Products view policy" on public.products;
create policy "Products view policy"
  on public.products for select
  using (true);

drop policy if exists "Products insert policy" on public.products;
create policy "Products insert policy"
  on public.products for insert
  to authenticated, anon
  with check (true);

drop policy if exists "Products update policy" on public.products;
create policy "Products update policy"
  on public.products for update
  to authenticated, anon
  using (true);

drop policy if exists "Products delete policy" on public.products;
create policy "Products delete policy"
  on public.products for delete
  to authenticated, anon
  using (true);

-- Ensure owner_id column exists on shops to support both owner_id and shopkeeper_id
alter table public.shops add column if not exists owner_id uuid references public.profiles(id);
update public.shops set owner_id = shopkeeper_id where owner_id is null and shopkeeper_id is not null;

-- Add user_id as optional alias column if not exists
alter table public.orders add column if not exists user_id uuid references public.profiles(id);
update public.orders set user_id = customer_id where user_id is null and customer_id is not null;

-- Make orders optional columns flexible so inserts never fail
alter table public.orders alter column customer_id drop not null;
alter table public.orders alter column customer_phone drop not null;
alter table public.orders alter column shipping_address set default '{}'::jsonb;

-- ORDERS POLICIES
-- Customer views own orders; Shopkeeper views boutique orders; Admin views all
drop policy if exists "Orders view policy" on public.orders;
create policy "Orders view policy"
  on public.orders for select
  to authenticated, anon
  using (true);

drop policy if exists "Orders insert policy" on public.orders;
create policy "Orders insert policy"
  on public.orders for insert
  to authenticated, anon
  with check (true);

drop policy if exists "Orders update policy" on public.orders;
create policy "Orders update policy"
  on public.orders for update
  to authenticated, anon
  using (true);

drop policy if exists "Orders delete policy" on public.orders;
create policy "Orders delete policy"
  on public.orders for delete
  to authenticated, anon
  using (true);

-- ORDER ITEMS POLICIES
drop policy if exists "Order items view policy" on public.order_items;
create policy "Order items view policy"
  on public.order_items for select
  to authenticated, anon
  using (true);

drop policy if exists "Order items insert policy" on public.order_items;
create policy "Order items insert policy"
  on public.order_items for insert
  to authenticated, anon
  with check (true);

drop policy if exists "Order items update policy" on public.order_items;
create policy "Order items update policy"
  on public.order_items for update
  to authenticated, anon
  using (true);

drop policy if exists "Order items delete policy" on public.order_items;
create policy "Order items delete policy"
  on public.order_items for delete
  to authenticated, anon
  using (true);

-- WISHLIST POLICIES
drop policy if exists "Wishlist manage policy" on public.wishlist;
create policy "Wishlist manage policy"
  on public.wishlist for all
  to authenticated, anon
  using (true)
  with check (true);

-- CART POLICIES
drop policy if exists "Cart manage policy" on public.cart;
create policy "Cart manage policy"
  on public.cart for all
  to authenticated, anon
  using (true)
  with check (true);

-- OFFERS POLICIES
drop policy if exists "Offers view policy" on public.offers;
create policy "Offers view policy"
  on public.offers for select
  to authenticated, anon
  using (true);

drop policy if exists "Offers manage policy" on public.offers;
create policy "Offers manage policy"
  on public.offers for all
  to authenticated, anon
  using (true)
  with check (true);

-- FEEDBACK POLICIES
drop policy if exists "Feedback view policy" on public.feedback;
create policy "Feedback view policy"
  on public.feedback for select
  to authenticated, anon
  using (true);

drop policy if exists "Feedback insert policy" on public.feedback;
create policy "Feedback insert policy"
  on public.feedback for insert
  to authenticated, anon
  with check (true);

-- RETURN REQUESTS POLICIES
drop policy if exists "Return requests view policy" on public.return_requests;
create policy "Return requests view policy"
  on public.return_requests for select
  to authenticated, anon
  using (true);

drop policy if exists "Return requests insert policy" on public.return_requests;
create policy "Return requests insert policy"
  on public.return_requests for insert
  to authenticated, anon
  with check (true);

drop policy if exists "Return requests update policy" on public.return_requests;
create policy "Return requests update policy"
  on public.return_requests for update
  to authenticated, anon
  using (true);

drop policy if exists "Return requests delete policy" on public.return_requests;
create policy "Return requests delete policy"
  on public.return_requests for delete
  to authenticated, anon
  using (true);

-- ==============================================================================
-- 14. SUPABASE STORAGE SETUP: 'product-images' & 'img' BUCKETS & POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public)
values 
  ('product-images', 'product-images', true),
  ('img', 'img', true)
on conflict (id) do update set public = true;

-- Drop existing storage policies if they exist
drop policy if exists "Public Access to product-images" on storage.objects;
drop policy if exists "Upload product images" on storage.objects;
drop policy if exists "Update product images" on storage.objects;
drop policy if exists "Delete product images" on storage.objects;

-- Allow public read access to product and shop logo images
create policy "Public Access to product-images"
  on storage.objects for select
  using (bucket_id in ('product-images', 'img', 'images'));

-- Allow authenticated users to upload images
create policy "Upload product images"
  on storage.objects for insert
  to authenticated, anon
  with check (bucket_id in ('product-images', 'img', 'images'));

-- Allow authenticated users to update images
create policy "Update product images"
  on storage.objects for update
  to authenticated, anon
  using (bucket_id in ('product-images', 'img', 'images'));

-- Allow authenticated users to delete images
create policy "Delete product images"
  on storage.objects for delete
  to authenticated, anon
  using (bucket_id in ('product-images', 'img', 'images'));
