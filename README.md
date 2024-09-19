# Livre Libre

Livre Libre est un logiciel libre de gestion de librairie.
Il permet de gérer les stocks, les ventes, les commandes, et fournit des statistiques sur les ventes.

<img src="./docs/screenshot_livrelibre.png" width="600" alt="Screenshot of LivreLibre" />

## Démo

Une [démo en ligne](https://livrelibre.vercel.app) est accessible.

Pour se connecter, utiliser les identifiants `admin/admin`

## Prérequis

Livre Libre nécessite [Node.js](https://nodejs.org) et [PostgreSQL](https://www.postgresql.org/) pour fonctionner.

## Installation

```
git clone https://github.com/poissoj/livrelibre.git
cd livrelibre
pnpm install
```

## Configuration

Générez un mot de passe pour COOKIE_PASSWORD.
Créez le fichier `.env.local` avec les infos suivantes:

```
POSTGRES_URI=postgres://user:password@localhost:5432/livrelibre
COOKIE_PASSWORD=pN2MLv2tEvY4wDeH3fKWh9Hwm1piff2T3m
```

## Base de données

Lancez `pnpm generate:db` pour générer le script sql qui va créer les tables. Exécutez le avec `psql`.

## Utilisateur

Installez [bun](https://bun.sh/) pour pouvoir exécuter le fichier .ts.

Lancez `bun src/cli/createUser.ts` pour créer un premier utilisateur.

## Build

```
pnpm build
```

## Lancement

Lancez la commande `pnpm start` pour lancer l'application. Par défaut, elle est accessible par navigateur sur http://localhost:3000.
