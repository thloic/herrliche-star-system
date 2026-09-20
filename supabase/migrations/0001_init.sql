-- Schéma initial Herrliche Stars : joueurs, paiements, paramètres.
-- À exécuter dans l'éditeur SQL du dashboard Supabase (ou via `supabase db push`
-- si le CLI est configuré) — aucun accès direct à la base n'est configuré
-- dans cet environnement.

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  photo_path text, -- chemin dans le bucket Storage `player-photos`, pas une URL publique
  nom_prenom text not null,
  date_naissance date not null,
  lieu_naissance text not null,
  telephone text,
  adresse text,
  parent_nom text not null,
  parent_telephone text not null,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  mois date not null, -- toujours le 1er du mois couvert
  date_paiement date not null,
  created_at timestamptz not null default now(),
  unique (player_id, mois)
);

create table if not exists settings (
  id int primary key default 1,
  montant_mensuel numeric not null default 0,
  constraint settings_singleton check (id = 1)
);

insert into settings (id, montant_mensuel) values (1, 0)
on conflict (id) do nothing;

alter table players enable row level security;
alter table payments enable row level security;
alter table settings enable row level security;

create policy "authenticated full access" on players
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on payments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Bucket photos des enfants : privé (mineurs), accès via URL signée générée
-- côté serveur (pas d'URL publique directe).
insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', false)
on conflict (id) do nothing;

create policy "authenticated full access on player-photos" on storage.objects
  for all
  using (bucket_id = 'player-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'player-photos' and auth.role() = 'authenticated');
