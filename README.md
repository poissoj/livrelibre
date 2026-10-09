# Livre Libre

[![CI](https://github.com/poissoj/livrelibre/actions/workflows/ci.yml/badge.svg)](https://github.com/poissoj/livrelibre/actions/workflows/ci.yml)

Livre Libre est un logiciel libre de gestion de librairie.
Il permet de gérer les stocks, les ventes, les commandes, et fournit des statistiques sur les ventes.

<img src="./docs/screenshots/panier.png" width="600" alt="Screenshot of LivreLibre" />

## Démo

Une [démo en ligne](https://livrelibre.onrender.com/) est accessible.

Pour se connecter, utiliser les identifiants `admin/admin`

## Rôles

- **`admin`** : accès complet
- **`cashier`** : gère la caisse du jour. Toutes les opérations sont autorisées, sauf
  l'accès aux ventes passées : la page Ventes et la suppression d'une vente sont
  limités à la journée en cours.

## Guide utilisateur

Le détail des parcours (recherche, caisse, client⋅es, commandes, ventes,
statistiques, import/export) est décrit dans
[docs/GUIDE_UTILISATEUR.md](docs/GUIDE_UTILISATEUR.md).

## Développement

Vous êtes développeur ou vous hébergez Livre Libre ? Consultez le guide
[docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).
