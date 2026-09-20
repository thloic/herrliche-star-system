-- Accès rapide par code PIN (par appareil). À exécuter dans l'éditeur SQL du
-- dashboard Supabase, comme la migration 0001.

create table if not exists pin_locks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  pin_hash text not null,
  failed_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, device_id)
);

alter table pin_locks enable row level security;

create policy "authenticated own rows" on pin_locks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
