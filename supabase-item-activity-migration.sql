-- Wishboard activity analytics (safe additive migration)
-- Run this once in Supabase SQL Editor after reviewing it.
-- Does not alter or delete existing items, tabs, or user data.

create table if not exists public.item_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null,
  event_type text not null check (event_type in ('item_view', 'checkout_intent', 'purchase_confirmed')),
  item_title text not null,
  amount numeric not null default 0 check (amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists item_activity_user_created_idx
  on public.item_activity (user_id, created_at desc);
create index if not exists item_activity_user_item_type_idx
  on public.item_activity (user_id, item_id, event_type);

alter table public.item_activity enable row level security;

-- Users can only read their own activity.
drop policy if exists "select own item activity" on public.item_activity;
create policy "select own item activity"
  on public.item_activity for select to authenticated
  using (auth.uid() = user_id);

-- Users can only create activity events for themselves.
drop policy if exists "insert own item activity" on public.item_activity;
create policy "insert own item activity"
  on public.item_activity for insert to authenticated
  with check (auth.uid() = user_id);

-- Intentionally no UPDATE or DELETE policies: event history is append-only
-- from the client, and users cannot alter another account's activity.

grant select, insert on public.item_activity to authenticated;
revoke all on public.item_activity from anon;
