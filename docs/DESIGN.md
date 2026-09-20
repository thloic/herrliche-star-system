# Design System — Herrliche Stars

## Product Context
- **Quoi** : appli de gestion pour un club de basket (fiche d'inscription des enfants + suivi des paiements mensuels).
- **Pour qui** : le coach de Herrliche Stars, seul utilisateur, sur son téléphone.
- **Espace** : outils de gestion sportive (TeamSnap, SportsEngine, InstaTeam) — mais pensé mono-utilisateur, pas plateforme multi-rôles.
- **Type** : web app mobile-first, outil interne, PWA installable.
- **Memorable thing** : une appli qui ressemble à un vrai club de basket — pas à un SaaS générique ni à une appli de santé copiée-collée.

## Aesthetic Direction
- **Direction** : Industrial/Utilitarian avec énergie sportive — fonction d'abord (coach pressé, entre deux entraînements), un seul accent graphique fort qui vient du terrain.
- **Décoration** : intentionnelle — un motif récurrent unique (arc de cercle de terrain de basket, en fine bordure), jamais de blob/gradient décoratif générique.
- **Mood** : sérieux mais chaleureux — les familles doivent sentir un outil pro, pas froid ni administratif.
- **Références** : TeamSnap/SportsEngine/InstaTeam pour les patterns mobile-first coach ; recherche palette sport (orange terrain + bleu, contraste haut pour la lisibilité).

## Typography
- **Display/Hero** : Plus Jakarta Sans, poids 800 — confiant, sportif, un seul family à charger.
- **Body** : Plus Jakarta Sans, poids 400/500/600 — lisible, chaleureux, bon rendu des accents français.
- **Data/Tables** : Geist Mono (tabular-nums) — montants et dates alignés, lisibles d'un coup d'œil.
- **Code** : Geist Mono.
- **Loading** : `next/font/google` (`Plus_Jakarta_Sans`, `Geist_Mono`), self-hosté par Next — pas de CDN externe, robuste sur connexion lente. (Le preview HTML autonome utilise Google Fonts + JetBrains Mono, faute d'accès à next/font hors de l'app.)
- **Scale** : 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64 px.

## Color
- **Approche** : balanced — un primaire, un accent fort, des couleurs sémantiques nettes pour payé/en retard (cœur du produit).
- **Primary** : `#1B2A6B` (Bleu Herrliche / encre) — nav, boutons principaux, en-têtes, texte de marque. Hover/pressed : `#12204F`. Tint léger : `#3D4F9E`.
- **Accent** : `#FF6B1A` (Orange terrain) — actions fortes ("marquer payé"), montants, FAB, badges. Hover/pressed : `#E85A0A`.
- **Neutrals** : `#F7F8FB` (fond) → `#EEF0F6` (cartes/alt) → `#D8DCE8` (bordures) → `#6B7280` (texte secondaire) → `#14181F` (texte principal).
- **Semantic** : success `#16A34A` (payé), warning `#F59E0B` (à venir), error `#DC2626` (en retard/impayé), info `#2563EB`.
- **Dark mode** : non prioritaire (usage mono-device, coach connu) — pas de bascule automatique implémentée pour l'instant, tokens nommés pour ne pas bloquer plus tard.

## Spacing
- **Base** : 8px.
- **Densité** : confortable — cible pouce sur téléphone d'entrée de gamme, pas de densité "power user".
- **Scale** : 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64).

## Layout
- **Approche** : grid-disciplined — chaque écran a un job unique (fiche, liste, paiement, dashboard), alignement strict pour une lecture rapide.
- **Grid** : mobile = 1 colonne pleine largeur ; grilles de stats en 2 colonnes (dashboard).
- **Max content width** : 480px (contenu recentré sur desktop, l'app reste pensée mobile).
- **Border radius** : sm 8px (inputs, petits éléments), md 12px (cartes), lg 20px (grands panneaux), full 9999px (réservé aux boutons d'action, FAB, badges — jamais aux inputs/cartes).

## Motion
- **Approche** : intentionnel mais discret — feedback net sur les actions clés (ex. "marquer payé"), pas de chorégraphie complexe.
- **Easing** : enter(ease-out) exit(ease-in) move(ease-in-out).
- **Duration** : micro(100ms) court(200ms) moyen(300ms) long(500ms).

## Decisions Log
| Date | Décision | Rationale |
|------|----------|-----------|
| 2026-09-20 | Création initiale | /design — refonte demandée après retour "vraiment moche" sur l'écran de login copié d'un template santé générique (LifeLine). Direction Industrial/Utilitarian + accent orange terrain pour ancrer l'identité basket, abandon du pattern "bleu plein écran + blobs flous". |
