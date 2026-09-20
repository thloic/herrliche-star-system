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
`docs/DESIGN.md`).

## Ajustements post-Plan 2

- **Graphique de comparaison** (`MonthlyComparisonChart`) : barres empilées
  payés (vert, bas) / en attente (ambre, haut) par mois, période 3/6/12 mois
  comme le graphique de tendance. `computeMonthlyComparison` exclut les
  enfants pas encore inscrits à l'époque d'un mois passé (via `created_at`),
  pour ne pas les compter comme "en attente" avant leur inscription.
- **Modal d'installation Android** (`InstallPrompt`, dans le layout racine) :
  écoute `beforeinstallprompt` (Chrome/Edge Android uniquement — n'existe pas
  sur iOS/Firefox, le composant n'affiche rien là-bas) et propose un vrai
  bouton "Installer" plutôt que de compter sur le bandeau automatique de
  Chrome, peu fiable/tardif. Un refus est mémorisé 7 jours (`localStorage`).
- **Lieu de naissance retiré** de la fiche joueur (formulaire, affichage,
  colonne DB — migration `0003_drop_lieu_naissance.sql`, **à exécuter par
  l'utilisateur**). La 2e ligne de la liste des joueurs affiche maintenant la
  date de naissance au lieu du lieu de naissance.
- **Photo obligatoire à l'inscription** (validée aussi côté serveur, pas
  seulement `required` côté navigateur) — reste optionnelle en modification
  puisque le joueur en a déjà une.
- **Dashboard** : le sélecteur de mois est un `<input type="month">` natif
  (n'importe quel mois, pas seulement les 12 derniers dans une liste) — les 4
  cartes + la liste "à relancer/n'ont pas payé" se recalculent pour le mois
  choisi via `?mois=YYYY-MM-01`. Le mini graphique de tendance reste
  indépendant (toujours 12 mois glissants).
- **Réglages** redessiné : chaque section (Montant, Apparence, Accès rapide)
  dans une carte avec icône, cohérent avec le style des cartes du dashboard.
- **Bug corrigé** : hydratation React sur `<html data-theme>` — le script
  bloquant du thème pose l'attribut avant que React n'hydrate, il faut
  `suppressHydrationWarning` sur `<html>` (le correctif documenté par React
  pour ce cas précis, pas un contournement).

## Plan 2 — Liste mobile, échéances, thème, PIN

**Terminé** (les 5 étapes + un ajout hors-plan). Un deuxième plan avait été
validé pour enrichir l'appli au-delà du cadrage initial, dans l'ordre :
(1) tableau joueurs mobile + menu Voir/Modifier/Supprimer, (2) tags de
paiement avec échéance, (3) thème clair/sombre, (4) PIN d'accès rapide,
(5) vérifications finales — plus un ajout demandé en cours de route : mini
graphique du montant collecté par mois sur le dashboard, avec période
3/6/12 mois. **Fait dans ce worktree (main)** — un autre worktree
(`../herrliche-stars-joueurs-pin`, branche `feat/joueurs-reglages-pin`) avait
commencé le même chantier en parallèle sur une base plus ancienne (avant
PWA/finitions) ; à considérer comme obsolète, sauf récupération explicite de
code utile.

**⚠️ Migrations en attente** — je n'ai pas d'accès direct à la base depuis cet
environnement, à exécuter dans l'éditeur SQL Supabase :
- `supabase/migrations/0002_pin_locks.sql` — sans elle, activer un code PIN
  dans Réglages échoue.
- `supabase/migrations/0003_drop_lieu_naissance.sql` — sans elle, inscrire un
  nouvel enfant échoue (le formulaire n'envoie plus `lieu_naissance`, encore
  `not null` en base tant que la migration n'est pas passée).

Mini graphique dashboard : `lib/payments.ts` (`lastNMonths`,
`formatShortAmount`, `shortMonthLabel`), `lib/dashboard.ts`
(`computeMonthlyCollections`), `MonthlyChart` (barres simples, valeurs
affichées directement sur chaque barre plutôt qu'un axe ou un survol — plus
lisible pour un coach non technique sur téléphone, où le survol n'existe pas
vraiment). Skill `dataviz` suivi : une seule teinte de marque pour une série
unique (pas de palette catégorielle à valider), pas de double axe. Même
approximation que le reste du dashboard : le montant historique est calculé
avec le tarif *actuel*, pas un montant réellement encaissé à l'époque (le
schéma ne stocke pas de montant par paiement) — cohérent avec l'existant, pas
une nouvelle limite introduite par le graphique.

Vérifié en conditions réelles (serveur dev) : toutes les routes protégées
redirigent vers `/login` sans session, `hs_device_id` posé dès la première
requête, manifest/service worker toujours servis après tous ces changements.
Pas de compte coach ni de session réelle disponible dans cet environnement
pour cliquer à travers le flux PIN/thème complet — à valider par
l'utilisateur.

**Décision clé (échéance de paiement)** : pas de jour d'échéance commun
réglable dans Réglages. L'échéance est **individuelle par enfant**, calculée
à partir du jour du mois de son **dernier paiement** (ex. payé le 8 le mois
dernier → échéance le 8 ce mois-ci) ; si l'enfant n'a jamais payé, on utilise
le jour d'inscription (`created_at`) comme ancre. Un jour absent du mois
courant (ex. 31 en février) est ramené au dernier jour du mois.

Phase 4 (PIN) : accès rapide par code à 6 chiffres, **par appareil**
(`hs_device_id`, cookie httpOnly longue durée posé par `proxy.ts`), table
`pin_locks` (migration `0002_pin_locks.sql`, RLS `auth.uid() = user_id` — **à
exécuter par l'utilisateur**, je n'ai pas d'accès direct à la base). Hash
scrypt + comparaison `timingSafeEqual` (`lib/pin.ts`, Node natif, pas de
dépendance ajoutée), jamais de PIN en clair stocké. Le verrou est posé **côté
serveur** dans `(app)/layout.tsx` : si l'appareil a un PIN configuré et pas de
cookie `hs_unlocked` valide, `{children}` n'est ni récupéré ni rendu —
`PinUnlockScreen` s'affiche à la place (pas un simple overlay qui masquerait
des données déjà chargées). Blocage 5 minutes après 5 essais échoués. "PIN
oublié" déconnecte et supprime le PIN de cet appareil (`forgotPin`), obligeant
une reconnexion complète par mot de passe. Modifier/désactiver le PIN exige de
resaisir le code actuel. Réglages : activer/modifier/désactiver + bouton
"Verrouiller maintenant" (`app/(app)/parametres/PinSettings.tsx`).

Phase 3 (thème) : clair/sombre/système, préférence en `localStorage`
(`lib/theme.ts`, `app/ThemeProvider.tsx`), appliquée via un attribut
`data-theme` sur `<html>` + variante Tailwind custom
(`@custom-variant dark (&:where([data-theme="dark"], ...))` dans
`globals.css` — pas la stratégie media-query par défaut, puisqu'un choix
explicite doit pouvoir contredire l'OS). Script bloquant dans `<head>`
(`getThemeInitScript`) pour éviter le flash au chargement. Toutes les couleurs
neutres de l'appli ont une variante `dark:` (grep-vérifié) ; le bleu/orange du
club restent identiques dans les deux thèmes. Sonner (`ToasterWithTheme`) suit
le thème résolu. Écran de login volontairement non concerné (couleur de
marque fixe, voir docs/DESIGN.md).

Phase 2 (échéances) : `lib/payments.ts` (`computeAnchorDay`, `dueDateForMonth`,
`computeDueStatus`, `formatDueStatus`). Le tag de statut devient cliquable
(`StatusTag` accepte `onClick`, devient un `<button>`) et ouvre
`PaymentStatusPanel` (payé → date ; sinon → "à payer dans N jours" / "à payer
aujourd'hui" / badge rouge "-N" + "N jours de retard", puis bouton
"Enregistrer le paiement" qui appelle `markPaid` directement, sans formulaire
— revalidation `/joueurs` ajoutée à cette action). Même logique reprise sur la
fiche joueur (`PaymentSection`) pour rester cohérent entre liste et détail.

Phase 1 (tableau joueurs mobile) : `PlayerRow` (photo+nom sur le composant,
infos secondaires sur une 2e ligne, jamais de scroll horizontal — pas de
`truncate`, `min-w-0` + wrap naturel), `StatusTag` (Payé=vert, En
attente=ambre — le rouge reste réservé au retard réel, Phase 2), `RowMenu`
(Voir/Modifier/Supprimer), `DeletePlayerDialog` (confirmation, mentionne la
suppression en cascade de l'historique — déjà garantie côté DB via `on delete
cascade`), filtres Tous/Payés/En attente, mois affiché au-dessus du tableau.
`PlayerForm` généralisé création/édition (`mode: "create" | "edit"`), nouvelle
route `/joueurs/[id]/modifier`. `updatePlayer`/`deletePlayer` dans
`joueurs/actions.ts` (suppression de la photo Storage en best-effort).

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
