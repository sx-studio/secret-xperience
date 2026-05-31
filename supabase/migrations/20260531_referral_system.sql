-- Referral system: persistent per-user codes + conversion tracking + auto-reward.
-- Applied to project duwuzaelmggldhkgoebn via MCP on 2026-05-31; kept here for version control.

-- Persistent per-user referral code
create table if not exists public.referral_codes (
  user_id    uuid primary key references public.profiles(id) on delete cascade,
  code       text unique not null,
  created_at timestamptz not null default now()
);

-- One row per referred signup
create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references public.profiles(id) on delete cascade,
  referred_id    uuid references public.profiles(id) on delete set null,
  referred_email text,
  status         text not null default 'pending',  -- pending | qualified
  reward_tokens  int  not null default 0,
  created_at     timestamptz not null default now(),
  qualified_at   timestamptz,
  unique(referred_id)
);

create index if not exists referrals_referrer_idx on public.referrals(referrer_id);

alter table public.referral_codes enable row level security;
alter table public.referrals       enable row level security;

drop policy if exists "own referral code select" on public.referral_codes;
create policy "own referral code select" on public.referral_codes
  for select using (auth.uid() = user_id);

drop policy if exists "own referrals select" on public.referrals;
create policy "own referrals select" on public.referrals
  for select using (auth.uid() = referrer_id);

grant select, insert, update, delete on public.referral_codes to service_role;
grant select, insert, update, delete on public.referrals       to service_role;
grant select on public.referral_codes to authenticated;
grant select on public.referrals       to authenticated;

-- Reward: when a referred provider creates their FIRST listing, the pending
-- referral qualifies and the referrer is credited tokens. Subsequent listings
-- find no pending row, so the reward fires exactly once.
create or replace function public.grant_referral_reward()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reward_amt int := 75;
  v_ref      record;
  v_balance  int;
begin
  select * into v_ref
    from public.referrals
   where referred_id = NEW.profile_id
     and status = 'pending'
   limit 1;

  if not found then
    return NEW;
  end if;

  insert into public.user_wallets (user_id, balance, total_purchased, total_spent)
  values (v_ref.referrer_id, 0, 0, 0)
  on conflict (user_id) do nothing;

  update public.user_wallets
     set balance = balance + reward_amt,
         updated_at = now()
   where user_id = v_ref.referrer_id
   returning balance into v_balance;

  insert into public.token_ledger (user_id, amount, balance_after, type, description, reference_id)
  values (v_ref.referrer_id, reward_amt, v_balance, 'bonus',
          'Referral reward — a provider you invited published their first listing', v_ref.id::text);

  update public.referrals
     set status = 'qualified',
         qualified_at = now(),
         reward_tokens = reward_amt
   where id = v_ref.id;

  return NEW;
end;
$$;

drop trigger if exists trg_grant_referral_reward on public.listings;
create trigger trg_grant_referral_reward
  after insert on public.listings
  for each row execute function public.grant_referral_reward();
