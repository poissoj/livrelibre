# Livre Libre

[![CI](https://github.com/poissoj/livrelibre/actions/workflows/ci.yml/badge.svg)](https://github.com/poissoj/livrelibre/actions/workflows/ci.yml)

Livre Libre est un logiciel libre de gestion de librairie, conçu pour les
librairies indépendantes. Il permet de gérer les stocks, les ventes, les
commandes et les client⋅es, et fournit des statistiques sur l'activité.

<img src="./docs/screenshots/panier.png" width="600" alt="Capture d'écran du panier de Livre Libre" />

## Fonctionnalités

- Gestion des articles et du stock (ISBN, TVA, types d'article configurables)
- Caisse : panier, ajout par ISBN, association d'un⋅e client⋅e, remise fidélité
  et moyens de paiement configurables
- Gestion des client⋅es et de leur total d'achats
- Commandes fournisseurs et suivi de leur état
- Ventes, statistiques et meilleures ventes
- Import de fichiers DILICOM et export du stock au format CSV
- Comptes utilisateurs avec rôles administrateur et caissier⋅ère

## Démo

Une [démo en ligne](https://livrelibre.onrender.com/) est accessible.

Pour se connecter, utiliser les identifiants `admin/admin`.

## Stack

- **Web** : Vue 3, TypeScript, Vite, TanStack Query et Tailwind CSS
- **API** : Hono et tRPC
- **Base de données** : PostgreSQL avec Drizzle ORM
- **Tests** : Vitest et Playwright
- **Monorepo** : pnpm

## Démarrage rapide

Prérequis : [Node.js](https://nodejs.org) 22, [pnpm](https://pnpm.io) 11 et
[PostgreSQL](https://www.postgresql.org/).

```bash
git clone https://github.com/poissoj/livrelibre.git
cd livrelibre
pnpm install
cp apps/server/.env.example apps/server/.env.local
# Renseigner SESSION_SECRET et POSTGRES_URI dans apps/server/.env.local
createdb livrelibre
pnpm migrate:db
pnpm --filter @livrelibre/server exec tsx src/cli/createUser.ts
pnpm dev
```

L'application est alors accessible sur http://localhost:5174 et l'API sur
http://localhost:3001.

Pour les variables d'environnement, les tests, le déploiement et les autres
commandes, voir [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Documentation

- [Guide utilisateur](docs/GUIDE_UTILISATEUR.md) — parcours fonctionnels
- [Développement](docs/DEVELOPMENT.md) — installation, configuration, tests,
  build et mise à jour
- [Licence MIT](LICENSE.md)
