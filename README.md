# Livre Libre

Livre Libre est un logiciel libre de gestion de librairie.
Il permet de gérer les stocks, les ventes, les commandes, et fournit des statistiques sur les ventes.

<img src="./docs/screenshot_livrelibre.png" width="600" alt="Screenshot of LivreLibre" />

## Démo

Une [démo en ligne](https://livrelibre.vercel.app) est accessible.

Pour se connecter, utiliser les identifiants `admin/admin`

## Prérequis

Livre Libre nécessite [Node.js](https://nodejs.org) (20+), [pnpm](https://pnpm.io) et [PostgreSQL](https://www.postgresql.org/).

## Installation

```
git clone https://github.com/poissoj/livrelibre.git
cd livrelibre
pnpm install
```

## Configuration

Chaque application a son propre fichier d'environnement (copiez l'exemple
correspondant).

**Serveur** — `apps/server/.env.local` (voir `apps/server/.env.example`) :

```
SESSION_SECRET=...   # min 32 caractères, ex. : openssl rand -base64 32
POSTGRES_URI=postgres://user:password@localhost:5432/livrelibre
```

La session est valable **7 jours** ; passé ce délai, la connexion est requise à
nouveau. Modifier `SESSION_SECRET` invalide immédiatement toutes les sessions.

**Web** — `apps/web/.env.local` (voir `apps/web/.env.example`) :

```
VITE_APP_NAME=Livre Libre
# VITE_FAVICON=/mon-logo.png
```

## Tests

Les tests sont regroupés dans le package `@livrelibre/tests`. Ils utilisent une
base dédiée : créez `tests/.env.test` (voir `tests/.env.test.example`) pointant
vers une base de test, **différente** du `POSTGRES_URI` de
`apps/server/.env.local` :

```
POSTGRES_URI=postgres://user:password@localhost:5432/livrelibre_test
```

Si `tests/.env.test` est absent ou pointe vers la même base que
`apps/server/.env.local`, les tests échouent immédiatement (ils vident les
tables et appliquent les migrations).

## Base de données

Créez la base de données (si elle n'existe pas encore) :

```
createdb livrelibre
```

Puis appliquez les migrations :

```
pnpm migrate:db
```

Pour générer une nouvelle migration après avoir modifié le schéma, utilisez `pnpm generate:db`.

## Utilisateur

Créez un premier utilisateur :

```
pnpm --filter @livrelibre/server exec tsx src/cli/createUser.ts
```

## Développement

```
pnpm dev
```

Cette commande lance le serveur Hono (API) sur http://localhost:3001 et le front Vite sur http://localhost:5173.

Pour les lancer séparément : `pnpm dev:server` et `pnpm dev:web`.

## Build & lancement (production)

```
pnpm build
pnpm start
```

`pnpm start` lance le serveur Hono qui sert à la fois l'API et l'application sur http://localhost:3001.

## Tests & outils

- `pnpm test` — tests unitaires et d'intégration
- `pnpm test:e2e` — tests de bout en bout (Playwright)
- `pnpm typecheck` — vérification des types
- `pnpm lint` — lint
- `pnpm check` — lint + typecheck
- `pnpm format` — formatage (Prettier)
