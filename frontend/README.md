# DIT Bibliothèque — Frontend

Interface React de la plateforme de bibliothèque numérique du DIT (Examen Containers
et Virtualisation, L2 DIT). C'est une SPA (Single Page Application) qui ne fait que de
l'affichage et des appels API : toute la logique métier (validation stricte, accès
MySQL, règles d'emprunt) vit dans les 3 microservices backend. Le frontend consomme
directement leurs API REST, sans passerelle intermédiaire.

## Stack

- [Vite](https://vite.dev/) + React 19 (JavaScript, pas de TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com/) pour le style
- [React Router](https://reactrouter.com/) pour le routing (SPA, une page par module)
- [Axios](https://axios-http.com/) pour les appels HTTP
- [lucide-react](https://lucide.dev/) pour les icônes
- [oxlint](https://oxc.rs/) pour le lint

## Comment ça fonctionne

Il n'y a **pas de backend-for-frontend ni de gateway** : le navigateur appelle
directement chacun des 3 microservices avec 3 clients Axios distincts
(`src/api/client.js`), un par service (`livresClient`, `utilisateursClient`,
`empruntsClient`), chacun avec sa propre URL de base configurée via variable
d'environnement.

Conséquence directe du découpage microservices : le service `emprunts-service` ne
connaît que des `livre_id` / `utilisateur_id` numériques, jamais le titre du livre ni
le nom de l'utilisateur (il n'a pas accès à leurs tables). C'est donc le **frontend**
qui reconstitue l'affichage lisible : `src/utils/enrichEmprunts.js` prend une liste
d'emprunts, en déduit les identifiants uniques de livres/utilisateurs, va chercher
leurs infos (`GET /livres/{id}`, `GET /utilisateurs/{id}`) en parallèle, puis fusionne
tout ça avant de rendre le tableau. C'est utilisé à deux endroits : la liste globale
des emprunts et l'historique dans la page de profil utilisateur.

Chaque page suit le même schéma : `useState` pour les données/chargement/erreur,
`useEffect` pour charger au montage, un formulaire dans une `Modal` pour créer/éditer,
et une `ConfirmDialog` avant toute suppression. Il n'y a pas de state manager global
(Redux/Zustand) : chaque page gère son propre state et recharge ses données après
chaque mutation (pas de cache partagé, pas d'optimistic update).

## Installation

```bash
cd frontend
npm install
```

## Configuration

Les URLs des trois microservices backend sont définies dans `.env` :

```bash
VITE_LIVRES_API_URL=http://localhost:8011
VITE_UTILISATEURS_API_URL=http://localhost:8002
VITE_EMPRUNTS_API_URL=http://localhost:8003
```

Ce sont des URLs accessibles **depuis le navigateur** (pas depuis l'intérieur du
réseau Docker) : le SPA React tourne côté client et appelle ces services directement,
d'où l'usage de `localhost` et des ports publiés par Docker Compose plutôt que les
noms de conteneurs internes (`http://livres-service:8000` ne fonctionnerait pas
depuis un navigateur). Ces variables sont lues **au build** de Vite (via
`import.meta.env`) : toute modification nécessite de relancer `npm run dev` ou de
reconstruire l'image Docker — les changer dans un conteneur déjà buildé n'a aucun
effet.

## Développement

```bash
npm run dev
```

L'application est servie sur `http://localhost:5173` (ou le port suivant disponible).
Il faut que les 3 microservices backend tournent (localement ou via
`docker compose up` à la racine) pour que les pages affichent des données.

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

Le `Dockerfile` construit l'application en 2 étapes (multi-stage) :
1. **build** : image `node:22-alpine`, installe les dépendances, injecte les URLs
   d'API via `ARG`/`ENV`, lance `npm run build`
2. **serve** : image `nginx:1.27-alpine` qui sert uniquement le dossier `dist/`
   généré, avec `nginx.conf` configuré pour rediriger toutes les routes vers
   `index.html` (indispensable pour que React Router gère des URLs comme
   `/utilisateurs/3` en rechargement direct, sans ça Nginx renverrait une 404)

```bash
docker build \
  --build-arg VITE_LIVRES_API_URL=http://localhost:8011 \
  --build-arg VITE_UTILISATEURS_API_URL=http://localhost:8002 \
  --build-arg VITE_EMPRUNTS_API_URL=http://localhost:8003 \
  -t ditlib-frontend .

docker run -p 8080:80 ditlib-frontend
```

L'application est alors accessible sur `http://localhost:8080`.

Ce service est aussi déclaré dans le `docker-compose.yml` racine : un
`docker compose up --build` à la racine du projet démarre MySQL, les 3
microservices backend et ce frontend ensemble (5 conteneurs), le frontend
étant exposé sur le port 8080.

## Structure du projet

```
src/
  api/
    client.js                    3 instances Axios (une par microservice), intercepteur
                                  qui normalise les erreurs (err.response.data.message)
    livresApi.js                 getAll, getById, search(q), create, update, remove
    utilisateursApi.js           getAll(type?), getById, create   (pas d'update/remove :
                                                                    le backend ne les expose pas)
    empruntsApi.js                getAll(utilisateurId?), emprunter, retourner, historique
  components/
    layout/
      Sidebar.jsx                 Navigation (Tableau de bord, Livres, Utilisateurs, Emprunts)
      Layout.jsx                  Sidebar + <Outlet /> de React Router
    livres/
      LivreForm.jsx                Champs titre/auteur/isbn/quantite_totale + validation
      LivresTable.jsx              Colonnes Titre/Auteur/ISBN/Disponible/Total + actions
    utilisateurs/
      UtilisateurForm.jsx          Champs prenom/nom/email/type_utilisateur (création only)
      UtilisateursTable.jsx        Liste + lien vers le profil (pas d'édition/suppression)
    emprunts/
      EmpruntForm.jsx               Sélection livre (désactive ceux à 0 disponible)
                                    + utilisateur + durée en jours
      EmpruntsTable.jsx             Liste enrichie (titre/nom résolus) + bouton Retourner
    ui/
      Modal.jsx                    Boîte de dialogue générique
      ConfirmDialog.jsx             Modal de confirmation (utilisée avant suppression)
      Pagination.jsx                Boutons précédent/suivant, cachée si 1 seule page
      Spinner.jsx / EmptyState.jsx / ErrorBanner.jsx   états de chargement/vide/erreur
  constants/
    utilisateurTypes.js            Libellés FR des types (ETUDIANT, PROFESSEUR,
                                    PERSONNEL_ADMINISTRATIF) — les clés matchent
                                    exactement l'enum Python du backend
  hooks/
    usePagination.js                Pagination côté client (10 éléments/page)
  utils/
    enrichEmprunts.js                Résout livre_id/utilisateur_id en titres/noms
    formatDate.js                    Formate les dates ISO du backend en fr-FR
  pages/
    DashboardPage.jsx                Compteurs (nb livres, utilisateurs, emprunts en cours)
    livres/LivresPage.jsx             Liste + recherche + CRUD complet
    utilisateurs/UtilisateursPage.jsx  Liste + création
    utilisateurs/UtilisateurProfilPage.jsx  Détail + historique des emprunts
    emprunts/EmpruntsPage.jsx          Liste + nouvel emprunt + retour
  App.jsx                            Déclaration des routes (React Router)
  main.jsx                           Point d'entrée React
```

## Détail des 3 modules

### Livres (`/livres`)

- Liste paginée (10/page), recherche par titre/auteur/ISBN via `GET /livres?q=...`
  (le backend filtre côté serveur)
- Ajout/modification via un formulaire dans une modale : titre, auteur, ISBN
  (validé côté frontend avec une regex simple, 10 à 17 chiffres/tirets), quantité
  totale
- Suppression avec confirmation (`ConfirmDialog`)
- Le tableau affiche à la fois `quantite_disponible` (badge vert/rouge selon qu'il
  reste des exemplaires) et `quantite_totale` — ces deux champs viennent tels quels
  du backend, le frontend ne fait aucun calcul de stock lui-même

### Utilisateurs (`/utilisateurs`)

- Liste paginée, création (prénom, nom, email, type)
- **Pas de modification ni suppression** : `utilisateurs-service` n'expose que
  `POST /utilisateurs`, `GET /utilisateurs`, `GET /utilisateurs/{id}` — il n'y a donc
  rien à appeler côté frontend pour ces actions, elles ont été volontairement
  retirées de l'UI plutôt que d'afficher des boutons qui échoueraient
- Page de profil (`/utilisateurs/:id`) : infos + historique complet de ses emprunts
  (enrichi avec les titres de livres via `enrichEmprunts`)

### Emprunts (`/emprunts`)

- Liste de tous les emprunts (tous utilisateurs confondus), enrichie pour afficher
  titre du livre + nom de l'utilisateur au lieu des identifiants bruts
- Nouvel emprunt : sélection d'un livre (ceux à 0 exemplaire disponible sont
  désactivés dans le menu déroulant) + d'un utilisateur + durée en jours (14 par
  défaut, 1 à 90, comme validé côté backend)
- Retour d'un livre en un clic (`POST /emprunts/{id}/retour`), le statut passe
  visuellement de "En cours" à "Retourné"

## Limitations connues

- Pas d'authentification/autorisation (hors périmètre de l'examen)
- Pagination uniquement côté client (le backend renvoie toute la liste, le
  découpage en pages se fait dans le navigateur) — pourrait devenir un problème
  de performance avec un très grand catalogue, mais suffisant pour ce projet
- Pas de tests automatisés (unitaires ou end-to-end)
