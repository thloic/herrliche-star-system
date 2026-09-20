@AGENTS.md

# Herrliche Stars — appli de gestion de club de basket

## Contexte

Herrliche Stars est un club de basket (Lomé, Togo). Cette appli est destinée
**au coach** (utilisateur unique, pas de gestion de rôles multiples prévue) et
remplace un formulaire papier/mobile existant pour l'inscription des enfants
et le suivi des paiements mensuels.

Un exemple du formulaire papier actuel est dans `public/WhatsApp Image
2026-09-19 at 18.13.58.jpeg` — sert de référence pour les champs et la mise en
page de la fiche joueur (ne pas garder ce fichier dans `public/` une fois
l'interface construite, il n'a qu'une valeur de référence).

**Cible utilisateur : non technique.** L'interface doit être mobile-first,
simple et intuitive avant tout — pas de jargon, pas d'écrans à choix multiples
inutiles, actions évidentes en un coup d'œil.

**Pas de relance automatique aux parents.** Le dashboard signale au coach qui
n'a pas payé ce mois-ci ; c'est lui qui relance manuellement (téléphone/
WhatsApp). Aucun envoi d'email/SMS depuis l'appli.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript — **version non conventionnelle,
  voir AGENTS.md ci-dessus : lire `node_modules/next/dist/docs/` avant d'écrire
  du code**.
- Tailwind CSS v4
- lucide-react pour les icônes
- GSAP pour les animations (discrètes : transitions, feedback d'action — pas
  de sur-animation)
- Supabase : base de données (Postgres), stockage des photos (Storage), et
  authentification du coach (login simple, un seul compte). Identifiants déjà
  dans `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
- PWA (manifest + service worker) pour que le coach puisse installer l'appli
  sur son téléphone comme une app native
- Vitest + React Testing Library pour les tests unitaires
- **sonner** pour les notifications toast (succès/erreur des actions)

## Charte visuelle

**Voir `docs/DESIGN.md` pour le système complet (couleurs, typo, spacing,
radius, motion) — c'est la référence, ne pas la redériver.** Résumé rapide :

- **Bleu Herrliche** `#1B2A6B` (marque, nav, texte) + **Orange terrain**
  `#FF6B1A` (actions fortes, montants, FAB) — tokens Tailwind `bg-brand`,
  `bg-accent`, etc. dans `app/globals.css`. Ne jamais utiliser `blue-600`
  générique.
- Typo : Plus Jakarta Sans (texte) + Geist Mono (montants/dates, tabular-nums),
  chargées via `next/font/google` — un seul family principal, pensé pour
  Android d'entrée de gamme / connexion lente à Lomé.
- Radius disciplinés : sm 8px (inputs), md 12px (cartes), lg 20px (grands
  panneaux), full réservé aux boutons d'action/FAB/badges — jamais aux
  inputs/cartes ("pas de bubble partout").
- Décoration : un seul motif récurrent (arc de cercle façon terrain de
  basket, en fine bordure) — jamais de blob/gradient flou générique.
- Preview de référence : `docs/design-preview.html` (mockup dashboard,
  spécimen typo, palette, composants).

## Modules fonctionnels

### 1. Centre de formation (fiche joueur)

Formulaire d'inscription d'un enfant :
- Photo
- Nom et prénom de l'enfant
- Date de naissance
- Lieu de naissance
- Téléphone (contact de l'enfant/famille)
- Résidence / adresse
- Nom et prénom du parent ou tuteur
- Téléphone du parent ou tuteur

Une fois soumis :
- **Liste** de tous les enfants inscrits (recherche par nom).
- **Page individuelle** par enfant : toutes les infos + historique de paiement.

### 2. Mensualités

- **Montant mensuel unique** pour tous les enfants, réglable par le coach
  (écran paramètres).
- **Historique complet** conservé par enfant, visible sur sa page.
- On enregistre seulement **la date du paiement** (pas de mode de paiement).
- Le coach marque un paiement comme effectué pour un enfant + un mois donné.

### 3. Dashboard (accueil)

Vue d'ensemble en un coup d'œil :
- Nombre total d'enfants inscrits
- Paiements du mois en cours : combien ont payé / combien sont en attente
- Montant collecté ce mois vs montant attendu
- Liste des enfants en attente de paiement ce mois, avec accès direct à leur
  fiche pour marquer le paiement (= la seule forme de « relance », visuelle,
  pour que le coach agisse lui-même)

## Notes Next.js 16 (breaking changes vérifiées dans `node_modules/next/dist/docs/`)

- `middleware.ts` est renommé **`proxy.ts`** (export `proxy`, pas `middleware`).
  Voir `proxy.ts` à la racine.
- **Cache Components** (`cacheComponents: true` dans `next.config.ts`) n'est
  **pas activé** — décision volontaire : l'appli est quasi entièrement
  dynamique (session coach sur toutes les pages), le modèle de caching
  précédent (celui d'avant Next 16) est plus simple ici et évite d'ajouter des
  `<Suspense>` partout pour rien. Ne pas activer ce flag sans revoir toutes
  les pages.

## Architecture technique

```
app/
  (auth)/
    login/page.tsx
  (app)/                       -- routes protégées (coach connecté)
    layout.tsx                 -- vérifie la session, nav mobile-first
    dashboard/page.tsx
    joueurs/
      page.tsx                 -- liste + recherche
      nouveau/page.tsx         -- formulaire d'inscription
      [id]/page.tsx            -- fiche + historique paiements
    parametres/page.tsx        -- montant mensuel
  layout.tsx
  manifest.ts (ou manifest.json) -- PWA
lib/
  supabase/
    client.ts                  -- client navigateur (supabase-js)
    server.ts                  -- client serveur (Server Components/Actions)
  payments.ts                  -- logique "mois courant", statut payé/en attente
  types.ts                     -- types générés/alignés sur le schéma DB
components/
  ui/                          -- Button, Card, Badge, etc. (Tailwind + lucide)
  players/                     -- PlayerForm, PlayerCard, PlayerList
  payments/                    -- PaymentStatusBadge, MarkPaidButton
  dashboard/                   -- StatCard, UnpaidList
```

- **Auth** : Supabase Auth, compte coach créé manuellement dans le dashboard
  Supabase (pas d'inscription self-service dans l'appli).
- **RLS** : activé sur toutes les tables ; policies simples réservées au rôle
  `authenticated` (un seul utilisateur possible de toute façon).
- **Photos** : bucket Storage `player-photos`, **privé** (photos de mineurs —
  pas d'URL publique). Upload client via supabase-js depuis le formulaire
  d'inscription ; affichage via URL signée générée côté serveur
  (`createSignedUrl`), pas de `photo_url` public stocké en base.
- **Mutations** : Server Actions Next.js (pas de routes API séparées, sauf
  besoin spécifique).

## Schéma Supabase (SQL)

```sql
create table players (
  id uuid primary key default gen_random_uuid(),
  photo_path text, -- chemin dans le bucket Storage privé `player-photos`
  nom_prenom text not null,
  date_naissance date not null,
  lieu_naissance text not null,
  telephone text,
  adresse text,
  parent_nom text not null,
  parent_telephone text not null,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  mois date not null,              -- toujours le 1er du mois couvert
  date_paiement date not null,
  created_at timestamptz not null default now(),
  unique (player_id, mois)
);

create table settings (
  id int primary key default 1,
  montant_mensuel numeric not null,
  constraint settings_singleton check (id = 1)
);

alter table players enable row level security;
alter table payments enable row level security;
alter table settings enable row level security;

create policy "authenticated full access" on players
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on payments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "authenticated full access" on settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

## Stratégie de tests

- **Vitest + React Testing Library**, tests colocalisés (`*.test.ts(x)`).
- Priorité à la logique pure et aux composants à risque de régression :
  - calcul du "mois en cours" et du statut payé/en attente par joueur
    (`lib/payments.ts`)
  - agrégats du dashboard (montant collecté vs attendu, compteurs)
  - validation du formulaire d'inscription
  - `PaymentStatusBadge` / `UnpaidList` (rendu selon les données)
- Pas d'E2E pour l'instant (Playwright) — à ajouter plus tard si besoin, hors
  scope de ce plan.
- Chaque phase ci-dessous inclut ses propres tests avant de passer à la
  suivante.

## Plan d'implémentation (phases livrables indépendamment)

**Avancement : les 7 phases du plan initial sont terminées** (Setup, Auth
coach, Fiche joueur, Mensualités, Dashboard, PWA, Finitions). Connexion
vérifiée en conditions réelles par l'utilisateur. Design system appliqué (voir
`docs/DESIGN.md`). L'appli couvre le scope du cadrage initial — la suite
(nouvelles features, ajustements) se fera au fil des demandes.

Phase 7 : contenu recentré à 480px max sur desktop (nav, header, main) —
mobile reste la cible, desktop un bonus, mais plus rien ne s'étire de façon
cassée. Bouton flottant "+" repositionné (chevauchait la nav du bas — bug
réel, corrigé). États vides distincts (aucun enfant inscrit vs recherche sans
résultat) avec CTA vers l'inscription, sur la liste joueurs et le dashboard.
`loading.tsx` sur dashboard/joueurs/fiche joueur/réglages. `error.tsx` au
niveau `(app)` avec `retry()` (nouveau nom de la prop dans Next 16, avant
`reset`). `not-found.tsx` stylé. Panne réseau sur la vérification de session
dans `(app)/layout.tsx` traitée comme "non connecté" plutôt que de planter
(un `error.tsx` de segment ne couvre pas sa propre layout — vérifié dans les
docs locales). Lien "Retour" ajouté sur les écrans qui n'ont pas de barre
d'adresse pour y revenir (mode PWA standalone).

Phase 6 : `app/manifest.ts` (icônes générées par `scripts/generate-icons.mjs`
via sharp — badge "HS" orange, cohérent avec le login), `app/icon.png` /
`app/apple-icon.png` (conventions Next, auto-injectées dans le `<head>`),
`viewport.themeColor` + `metadata.appleWebApp`, service worker minimal
(`public/sw.js`, cache uniquement `/_next/static/` et `/icons/`, jamais les
pages ni les appels Supabase — enregistré seulement en prod via
`ServiceWorkerRegister`). Vérifié en conditions réelles (`next build` +
`next start`) : `<head>` correct (manifest, theme-color, icônes), manifest et
sw.js servis avec succès. **Reste à tester manuellement** : l'installation
"Ajouter à l'écran d'accueil" sur le téléphone du coach (Android/Chrome).

Phase 5 : `lib/dashboard.ts` (agrégats testés en isolation), page d'accueil
avec bandeau bleu de marque + arc décoratif, 4 stat cards (enfants inscrits,
payés ce mois, en attente, collecté/attendu) animées en fondu/décalage via
GSAP (`AnimatedGrid`, seul usage GSAP du dashboard), liste "À relancer" liée
aux fiches joueurs.

Phase 4 : écran Réglages (montant mensuel, seedé à 0 — **le coach doit y
aller pour renseigner le vrai montant**), action "marquer payé" (un tap pour
le mois en cours, formulaire dépliable pour un autre mois/backfill),
historique complet sur la fiche joueur.

1. **Setup** — lire `node_modules/next/dist/docs/` (breaking changes Next 16),
   créer les tables/policies Supabase ci-dessus + bucket `player-photos`,
   installer lucide-react / gsap / vitest / @testing-library/react, config
   Tailwind, squelette `lib/supabase/{client,server}.ts`.
2. **Auth coach** — page login, layout protégé `(app)/layout.tsx`, redirection
   si non connecté. Tests : redirection, état de session.
3. **Fiche joueur** — formulaire d'inscription (+ upload photo), liste avec
   recherche, page détail. Tests : validation formulaire, rendu liste/fiche.
4. **Mensualités** — écran paramètres (montant mensuel), action "marquer payé"
   (joueur + mois + date), historique sur la page joueur. Tests :
   `lib/payments.ts` (statut par mois), action de paiement.
5. **Dashboard** — indicateurs clés + liste des impayés du mois, cartes
   mobile-first, micro-animations GSAP. Tests : agrégats du dashboard.
6. **PWA** — manifest, icônes, service worker minimal (cache des assets),
   test d'installation "Ajouter à l'écran d'accueil" sur mobile.
7. **Finitions** — responsive complet, états vides/chargement/erreur, passage
   en revue sur le téléphone du coach.

**Ce plan ne démarre pas tout seul** : implémentation phase par phase,
validation de chaque phase (fonctionnelle + tests) avant de passer à la
suivante.

## Conventions

- Interface en français.
- Pas d'abstraction/role-based access prématurée : un seul utilisateur (le
  coach).
- Mobile-first partout ; desktop est un bonus.
