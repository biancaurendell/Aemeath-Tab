create table if not exists public.newtab_sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  device_id text not null,
  device_name text not null,
  version bigint not null default 0,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.newtab_sync enable row level security;

create policy "Users can read their own new tab sync data"
on public.newtab_sync
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own new tab sync data"
on public.newtab_sync
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own new tab sync data"
on public.newtab_sync
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
