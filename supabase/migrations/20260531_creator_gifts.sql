-- Creator gifting system — fans send tokens to creators as appreciation.

create table if not exists public.creator_gifts (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid references public.profiles(id) on delete set null,
  creator_id   uuid not null references public.profiles(id) on delete cascade,
  amount_tokens int not null check (amount_tokens > 0),
  message      text check (char_length(message) <= 200),
  created_at   timestamptz not null default now()
);

create index if not exists creator_gifts_creator_idx on public.creator_gifts(creator_id, created_at desc);
create index if not exists creator_gifts_sender_idx  on public.creator_gifts(sender_id, created_at desc);

alter table public.creator_gifts enable row level security;

drop policy if exists "creator read own gifts"      on public.creator_gifts;
create policy "creator read own gifts" on public.creator_gifts
  for select using (auth.uid() = creator_id);

drop policy if exists "sender read own gifts sent"  on public.creator_gifts;
create policy "sender read own gifts sent" on public.creator_gifts
  for select using (auth.uid() = sender_id);

grant select on public.creator_gifts to authenticated;
grant select, insert, update, delete on public.creator_gifts to service_role;
