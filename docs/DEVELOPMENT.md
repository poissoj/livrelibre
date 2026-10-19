# Développement

Ce document s'adresse aux développeurs et aux personnes qui hébergent Livre
Libre. Pour une présentation générale, voir le [README](../README.md) ; pour les
parcours fonctionnels, voir le [guide utilisateur](./GUIDE_UTILISATEUR.md).

## Prérequis

Livre Libre nécessite [Node.js](https://nodejs.org) 22, [pnpm](https://pnpm.io) 11
et [PostgreSQL](https://www.postgresql.org/).

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

Variables serveur optionnelles (voir `apps/server/.env.example`) :

- `PORT` — port d'écoute (défaut : `3001`)
- `LOG_LEVEL` — `error`, `warn`, `info`, `http`, `verbose`, `debug` ou `silly`
  (défaut : `info`)
- `NODE_ENV` — `development`, `test` ou `production` (défaut : `development`)
- `TIMEZONE` — fuseau utilisé pour les dates et statistiques, en nom IANA
  (défaut : `Europe/Paris`)
- `ISBN_SEARCH_URL` — service externe de recherche des informations par ISBN
- `DB_POOL_MAX` (défaut : `5`), `DB_IDLE_TIMEOUT` (défaut : `30` secondes),
  `DB_CONNECT_TIMEOUT` (défaut : `5` secondes) et `DB_MAX_LIFETIME`
  (défaut : `0`, illimité) — réglages du pool PostgreSQL

Variables réservées aux commandes CLI :

- `SHOP_ID` — identifiant de la librairie, requis par l'export Place des
  Libraires
- `FTP_HOST`, `FTP_USER`, `FTP_PASSWORD` — destination FTP optionnelle de cet
  export

**Web** — les valeurs par défaut sont versionnées dans `apps/web/.env`. Pour les
surcharger en local, créez `apps/web/.env.local` (gitignoré) à partir de
`apps/web/.env.example` :

```
VITE_APP_NAME=Livre Libre
# VITE_FAVICON=/mon-logo.png
```

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

## Démo

Pour initialiser une base locale avec des données de démonstration (articles,
clients, ventes et types d'article), lancez :

```
pnpm seed
```

Le seed crée un administrateur `admin/admin` par défaut. Les identifiants
peuvent être changés avec `SEED_ADMIN_NAME` et `SEED_ADMIN_PASSWORD`.

**Ne pas utiliser le seed sur une base de production** : il insère des données
fictives et ne doit servir qu'à la démonstration.

Le `Dockerfile`, `docker-entrypoint.sh` et `render.yaml` servent uniquement à
héberger la démonstration publique. Ils ne constituent pas une configuration de
production supportée.

## Utilisateur

Créez un premier utilisateur :

```
pnpm --filter @livrelibre/server exec tsx src/cli/createUser.ts
```

## Export Place des Libraires

Exporter le stock pour Place des Libraires (à exécuter une fois par jour via
cron) :

```
pnpm --filter @livrelibre/server exec tsx src/cli/exportPlaceDesLibraires.ts
```

Cette commande nécessite `SHOP_ID` et utilise `FTP_HOST`, `FTP_USER` et
`FTP_PASSWORD` si elles sont définies ; sinon, elle écrit seulement le fichier
local.

## Développement

```
pnpm dev
```

Cette commande lance le serveur Hono (API) sur http://localhost:3001 et le front Vite sur http://localhost:5174.

Pour les lancer séparément : `pnpm dev:server` et `pnpm dev:web`.

## Build & lancement (production)

```
pnpm build
pnpm start
```

`pnpm start` lance le serveur Hono qui sert à la fois l'API et l'application sur http://localhost:3001.

## Mise à jour

Pour mettre à jour une installation existante, récupérez la nouvelle version,
mettez à jour les dépendances, appliquez les migrations puis reconstruisez et
redémarrez :

```
git pull
pnpm install
pnpm migrate:db
pnpm build
pnpm start
```

Avant d'appliquer les migrations, sauvegardez votre base (voir
[Sauvegarde et restauration](#sauvegarde-et-restauration)).

Si l'application tourne via un gestionnaire de services (systemd, PM2…),
redémarrez-le à la dernière étape au lieu de relancer `pnpm start` à la main.

## Sauvegarde et restauration

Sauvegarder la base :

```
pg_dump livrelibre > livrelibre-$(date +%F).sql
```

Pour restaurer une sauvegarde, arrêtez l'application, utilisez une base vide
puis importez le fichier :

```
# Remplacer par le fichier de sauvegarde souhaité
SAUVEGARDE=livrelibre-AAAA-MM-JJ.sql

createdb livrelibre
psql livrelibre < "$SAUVEGARDE"
```

Remplacez `AAAA-MM-JJ` par la date de la sauvegarde, puis vérifiez que
l'application démarre et que les données sont présentes.

## Tests

Les tests sont regroupés dans le package `@livrelibre/tests`. Ils utilisent une
base dédiée : créez `tests/.env.test` (voir `tests/.env.test.example`) pointant
vers une base de test, **différente** du `POSTGRES_URI` de
`apps/server/.env.local` :

```
POSTGRES_URI=postgres://user:password@localhost:5432/livrelibre_test
```

La variable d'environnement `POSTGRES_URI` peut remplacer ce fichier (utile en
intégration continue) ; le fichier sert de valeur de repli.

Si `tests/.env.test` est absent ou pointe vers la même base que
`apps/server/.env.local`, les tests échouent immédiatement (ils vident les
tables et appliquent les migrations).

Aucun `apps/server/.env.local` n'est nécessaire pour lancer les tests : les
variables non liées à la base (`SESSION_SECRET`, `ISBN_SEARCH_URL`) sont
fournies par la configuration de test.

Commandes disponibles :

- `pnpm test` — tests unitaires et d'intégration
- `pnpm test:unit` — tests unitaires uniquement
- `pnpm test:integration` — tests d'intégration (base de test requise)
- `pnpm test:e2e` — tests de bout en bout (Playwright, Chromium uniquement)
- `pnpm test:e2e:all` — tests e2e sur Chromium et Firefox
- `pnpm test-ui` — interface graphique Playwright

Les tests e2e nécessitent l'installation préalable du navigateur Chromium :

```
pnpm --filter @livrelibre/tests exec playwright install chromium
```

Pour lancer un fichier précis :

```
pnpm --filter @livrelibre/tests exec vitest run unit/date.test.ts
pnpm --filter @livrelibre/tests exec vitest run --config vitest.integration.config.mts integration/cart.test.ts
pnpm --filter @livrelibre/tests exec playwright test cart.spec.ts
```

## Outils

- `pnpm typecheck` — vérification des types
- `pnpm lint` — lint
- `pnpm check` — lint + typecheck
- `pnpm format` — formatage (oxfmt)
- `pnpm format:check` — vérification du formatage (oxfmt)
