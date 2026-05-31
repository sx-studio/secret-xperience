-- Pillar #4 (Creators & Content) + Pillar #7 (Webshop).
-- Applied to project duwuzaelmggldhkgoebn.

-- ── Creators ──
alter table public.profiles add column if not exists external_links jsonb not null default '[]'::jsonb;

create table if not exists public.creator_posts (
  id         uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  caption    text,
  media_url  text,
  media_type text not null default 'image',
  active     boolean not null default true,
  like_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists creator_posts_creator_idx on public.creator_posts(creator_id, created_at desc);

create table if not exists public.creator_follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  creator_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, creator_id)
);
create index if not exists creator_follows_creator_idx on public.creator_follows(creator_id);

alter table public.creator_posts   enable row level security;
alter table public.creator_follows enable row level security;

drop policy if exists "public read active posts" on public.creator_posts;
create policy "public read active posts" on public.creator_posts for select using (active = true);
drop policy if exists "creator manage own posts" on public.creator_posts;
create policy "creator manage own posts" on public.creator_posts for all using (auth.uid() = creator_id) with check (auth.uid() = creator_id);

drop policy if exists "public read follows" on public.creator_follows;
create policy "public read follows" on public.creator_follows for select using (true);
drop policy if exists "user manage own follows" on public.creator_follows;
create policy "user manage own follows" on public.creator_follows for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

grant select, insert, update, delete on public.creator_posts   to authenticated, service_role;
grant select, insert, update, delete on public.creator_follows to authenticated, service_role;

-- ── Webshop ──
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid references public.profiles(id) on delete set null,
  name         text not null,
  description  text,
  price_cents  int,
  currency     text not null default 'EUR',
  images       text[] default '{}',
  category     text,
  brand        text,
  fulfillment  text not null default 'stripe',  -- 'stripe' | 'affiliate'
  external_url text,
  affiliate_network text,
  in_stock     boolean not null default true,
  featured     boolean not null default false,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index if not exists products_active_idx on public.products(active, featured, created_at desc);

create table if not exists public.shop_orders (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references public.products(id) on delete set null,
  buyer_id    uuid references public.profiles(id) on delete set null,
  amount_cents int not null,
  currency    text not null default 'EUR',
  status      text not null default 'pending',
  stripe_session_id text,
  created_at  timestamptz not null default now()
);
create index if not exists shop_orders_buyer_idx on public.shop_orders(buyer_id, created_at desc);

alter table public.products    enable row level security;
alter table public.shop_orders enable row level security;

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active = true);
drop policy if exists "seller manage own products" on public.products;
create policy "seller manage own products" on public.products for all using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists "buyer read own orders" on public.shop_orders;
create policy "buyer read own orders" on public.shop_orders for select using (auth.uid() = buyer_id);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated, service_role;
grant select, insert, update, delete on public.products    to service_role;
grant select on public.shop_orders to authenticated;
grant select, insert, update, delete on public.shop_orders to service_role;
