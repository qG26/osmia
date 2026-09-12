# AdsLens

AdsLens analyse vos exports CSV Google Ads pour repérer les dépenses
publicitaires inutiles : termes de recherche hors zone ou sans conversion,
produits Shopping/PMax qui dépensent sans jamais convertir.

**Tout le traitement se fait localement, dans votre navigateur.** Aucun
fichier, aucune donnée n'est envoyée à un serveur ou à un service tiers —
il n'y a d'ailleurs pas de backend du tout.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- React Router
- PapaParse pour le parsing CSV
- Vitest pour les tests unitaires de la logique métier (`src/lib`)

## Installation et développement

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173).

## Tests

```bash
npm run test
```

Les tests couvrent `src/lib` : détection de l'en-tête au milieu des
métadonnées, exclusion des lignes de synthèse (« Total », « Autres
termes »), parsing des nombres au format européen, détection géographique
sur mots entiers, classification zombie/ROAS, dédoublonnage à l'export.

Des fichiers CSV d'exemple, reproduisant la structure réelle des exports
Google Ads (métadonnées + lignes de synthèse), sont dans `fixtures/`.

## Build

```bash
npm run build
```

Génère le site statique dans `dist/`.

## Déploiement (Netlify)

Le dépôt contient un `netlify.toml` prêt à l'emploi :

- Commande de build : `npm run build`
- Dossier publié : `dist`
- Redirection SPA : toutes les routes renvoient vers `index.html`

Il suffit de connecter le dépôt à Netlify (ou de glisser `dist/` sur
[app.netlify.com/drop](https://app.netlify.com/drop)) — aucune variable
d'environnement n'est nécessaire, l'application n'a pas de backend.

## Structure

```
src/
  pages/            Home, SearchAnalyzer, ShoppingAnalyzer
  components/       Header, Footer, FileDropzone, StatCard, ExportMenu,
                     ExportPreviewModal, Guide, BackupBanner
  lib/              Logique métier pure, testée, sans dépendance à React :
                     csvCore, searchParser, shoppingParser, cities,
                     negatives, classification, exporters, storage
  types.ts          Types partagés
fixtures/           CSV d'exemple pour les tests
```

## Confidentialité

Les fichiers CSV Google Ads contiennent des données commerciales
confidentielles. AdsLens ne fait aucun appel réseau sortant pendant
l'analyse : pas de télémétrie, pas d'API, pas de compte utilisateur. C'est
une contrainte de conception, pas une option désactivable.

---

Logiciel propriétaire. Tous droits réservés. Ce n'est pas un logiciel
open source ; aucune licence d'utilisation, de modification ou de
redistribution n'est accordée.
