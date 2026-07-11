# DIT Bibliothèque — Frontend

Interface React de la plateforme de bibliothèque numérique du DIT. Consomme les
API REST des trois microservices backend : Livres, Utilisateurs, Emprunts.

## Stack

- [Vite](https://vite.dev/) + React
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

## Installation

```bash
cd frontend
npm install
```

## Configuration

Les URLs des trois microservices backend sont définies dans `.env` :

```bash
VITE_LIVRES_API_URL=http://localhost:8081/api
VITE_UTILISATEURS_API_URL=http://localhost:8082/api
VITE_EMPRUNTS_API_URL=http://localhost:8083/api
```

Adapter ces valeurs selon l'adresse réelle de tes services (ex. noms des
conteneurs Docker Compose : `http://livres-service:8081/api`). Ces variables
sont lues au build de Vite : toute modification nécessite de relancer
`npm run dev` ou de reconstruire l'image Docker.

## Développement

```bash
npm run dev
```

L'application est servie sur `http://localhost:5173` (ou le port suivant
disponible).

## Build de production

```bash
npm run build
```

Génère les fichiers statiques dans `dist/`.

## Lint

```bash
npm run lint
```

## Docker

Le `Dockerfile` construit l'application avec Node puis la sert avec Nginx
(routing SPA géré via `nginx.conf`).

```bash
docker build \
  --build-arg VITE_LIVRES_API_URL=http://localhost:8081/api \
  --build-arg VITE_UTILISATEURS_API_URL=http://localhost:8082/api \
  --build-arg VITE_EMPRUNTS_API_URL=http://localhost:8083/api \
  -t ditlib-frontend .

docker run -p 8080:80 ditlib-frontend
```

L'application est alors accessible sur `http://localhost:8080`.

## Structure du projet

```
src/
  api/            Client Axios par microservice + fonctions d'appel REST
  components/
    layout/       Sidebar et Layout général
    livres/       Formulaire et tableau du module Livres
    utilisateurs/ Formulaire et tableau du module Utilisateurs
    emprunts/     Formulaire et tableau du module Emprunts
    ui/           Composants réutilisables (Modal, ConfirmDialog, Pagination, ...)
  constants/      Constantes partagées (types d'utilisateurs)
  hooks/          Hooks réutilisables (pagination)
  pages/          Pages routées (une par module + tableau de bord)
  App.jsx         Déclaration des routes
  main.jsx        Point d'entrée React
```

## Fonctionnalités

- **Livres** : liste, recherche (titre/auteur/ISBN), ajout, modification, suppression
- **Utilisateurs** : liste, ajout, modification, suppression, profil avec historique d'emprunts
- **Emprunts** : liste, nouvel emprunt, retour de livre
