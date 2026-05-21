create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  listing_id  uuid references public.listings(id) on delete set null,
  body        text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "users see own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "users send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "receivers mark read"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- Enable real-time for this table
alter publication supabase_realtime add table public.messages;

create index if not exists messages_sender_receiver_idx on public.messages (sender_id, receiver_id);
create index if not exists messages_receiver_unread_idx on public.messages (receiver_id, read) where read = false;
create index if not exists messages_created_at_idx      on public.messages (created_at desc);
