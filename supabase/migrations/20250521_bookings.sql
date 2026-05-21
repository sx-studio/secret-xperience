create table if not exists public.bookings (
  id                    uuid primary key default gen_random_uuid(),
  listing_id            uuid references public.listings(id) on delete cascade,
  client_id             uuid references public.profiles(id) on delete cascade,
  provider_id           uuid references public.profiles(id) on delete cascade,
  date                  date,
  time                  text,
  duration_hours        integer not null default 1,
  total_amount          numeric(10,2) not null default 0,
  currency              text not null default 'EUR',
  status                text not null default 'pending'
                          check (status in ('pending','confirmed','completed','cancelled')),
  notes                 text,
  meet_type             text,
  stripe_payment_intent text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.bookings enable row level security;

create policy "users see own bookings"
  on public.bookings for select
  using (auth.uid() = client_id or auth.uid() = provider_id);

create policy "clients create bookings"
  on public.bookings for insert
  with check (auth.uid() = client_id);

create policy "participants update bookings"
  on public.bookings for update
  using (auth.uid() = provider_id or auth.uid() = client_id);

create index if not exists bookings_client_id_idx   on public.bookings (client_id);
create index if not exists bookings_provider_id_idx on public.bookings (provider_id);
create index if not exists bookings_status_idx      on public.bookings (status);
