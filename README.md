# OSMIA

Moteur de recommandation de parfums par IA. OSMIA apprend votre profil
olfactif via un quiz, calcule une compatibilité pour chaque parfum, explique
chaque recommandation, et affiche la meilleure offre disponible.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres, Auth, Row Level Security)
- Recharts (radar chart de l'empreinte olfactive)

## Démarrer en local

1. Installez les dépendances :

   ```bash
   npm install
   ```

2. Créez un projet [Supabase](https://supabase.com), puis copiez `.env.local.example`
   vers `.env.local` et renseignez `NEXT_PUBLIC_SUPABASE_URL` et
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API). Pour le tableau
   de bord admin (`/admin`), renseignez aussi `SUPABASE_SERVICE_ROLE_KEY`
   (même page, section `service_role` — à ne jamais exposer côté client) et
   `ADMIN_EMAILS` (liste d'e-mails autorisés, séparés par des virgules).

3. Appliquez le schéma et les données de démonstration, soit via le Supabase
   CLI (`supabase db push` après avoir lié le projet), soit en collant le
   contenu des fichiers suivants dans l'éditeur SQL du dashboard Supabase,
   dans cet ordre :

   - `supabase/migrations/0001_init.sql` — schéma + RLS
   - `supabase/seed.sql` — 18 parfums, 4 revendeurs, offres et historique de prix fictifs

   Le fichier `supabase/seed.sql` est généré depuis `supabase/generate-seed.mjs` ;
   relancez `node supabase/generate-seed.mjs > supabase/seed.sql` si vous modifiez
   le jeu de données source.

4. Lancez le serveur de développement :

   ```bash
   npm run dev
   ```

   Ouvrez [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app` — routes App Router (pages + routes API)
- `src/components` — composants UI (design system maison + shadcn-like primitives)
- `src/lib` — logique métier partagée : scoring, données de référence, clients Supabase
- `supabase/` — migrations SQL et données de seed

## Logique de scoring

Implémentée dans `src/lib/scoring.ts`, réutilisée par la route API
`/api/recommendations` et par la page `/resultats` (rendu serveur). Voir les
commentaires du fichier pour le détail des pondérations (familles, styles,
occasions, notes aimées/évitées, budget) et la génération des phrases
d'explication en français.

## Statut des phases

- **Phase 1 — Fondations** : auth, quiz en 7 étapes, scoring, résultats,
  radar chart, offres + tracking de clic affilié. ✅
- **Phase 2 — Fiche parfum et collection** : page détail, alternatives,
  collection à 6 statuts, recherche en langage naturel. ✅
- **Phase 3 — Prix avancé et découverte** : page de découverte à filtres
  combinables, historique de prix, alertes de prix (création, sans envoi
  d'e-mail automatisé), tableau de bord admin. ✅ (l'intégration d'un vrai
  flux d'affiliation et l'envoi d'e-mails d'alerte nécessitent des services
  externes à configurer en production — voir le code pour les points
  d'extension).
