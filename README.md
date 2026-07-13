# Bibliotheque Numerique Microservices

Projet **Bibliotheque Numerique Microservices** (Examen Containers et Virtualisation,
L2 DIT) : 3 microservices backend FastAPI, une base de donnees PostgreSQL, un frontend React,
le tout conteneurise et orchestre avec Docker Compose.

## Architecture

```
                              ┌─────────────────────┐
                              │   frontend (React)   │  :8080
                              │   (appele depuis le   │
                              │       navigateur)     │
                              └───────┬───────┬───────┘
                         REST         │       │        REST
                    ┌──────────────────┘       └──────────────────┐
                    ▼                                              ▼
    ┌───────────────────┐                          ┌───────────────────────┐
    │  livres-service    │  :8011                   │  utilisateurs-service │  :8002
    └─────────┬──────────┘                          └───────────┬───────────┘
              │                    ┌─────────────────────┐       │
              │                    │   emprunts-service   │:8003 │
              │                    │  (orchestrateur des  │       │
              └───────────────────►│   emprunts, appelle  │◄──────┘
                                   │  les 2 autres en REST)│
                                   └───────────┬───────────┘
                                               ▼
                                      ┌─────────────────┐
                                      │   PostgreSQL 16  │  :5432
                                      │  bibliotheque_db │
                                      └─────────────────┘
```

Chaque microservice backend est une application **FastAPI** independante avec son
propre `Dockerfile`, exposee sur un port different, et communique avec les autres
services via des appels **API REST** (HTTP). Les 3 services partagent une meme
instance PostgreSQL mais chacun ne gere que ses propres tables (`livres`, `utilisateurs`,
`emprunts`). Le frontend est une SPA React servie par Nginx : elle tourne dans le
navigateur et appelle chaque microservice directement (pas via `emprunts-service`),
en resolvant elle-meme les titres de livres et noms d'utilisateurs pour l'affichage
des emprunts.

| Service | Port | Responsabilite |
|---|---|---|
| `frontend` | 8080 | Interface web React (Livres, Utilisateurs, Emprunts) |
| `livres-service` | 8011 | CRUD livres, recherche titre/auteur/ISBN, gestion du stock disponible |
| `utilisateurs-service` | 8002 | Creation/liste des utilisateurs, types (Etudiant, Professeur, Personnel administratif), profil |
| `emprunts-service` | 8003 | Emprunter/retourner un livre, historique des emprunts (appelle les 2 autres services) |

## Installation

Prerequis : Docker et Docker Compose installes.

```bash
cp .env.example .env
# ajuster les identifiants PostgreSQL dans .env si besoin
```

## Lancement avec Docker Compose

```bash
docker compose up --build
```

Cela demarre 5 conteneurs :
- `biblio-postgres` (PostgreSQL 16)
- `livres-service` sur http://localhost:8011
- `utilisateurs-service` sur http://localhost:8002
- `emprunts-service` sur http://localhost:8003
- `biblio-frontend` sur http://localhost:8080

Chaque microservice backend expose une documentation Swagger interactive sur
`/docs` (ex: http://localhost:8011/docs) et un endpoint de sante sur `/health`.

Pour arreter :

```bash
docker compose down
```

Pour tout arreter et supprimer les donnees PostgreSQL :

```bash
docker compose down -v
```

## Pipeline CI/CD (Jenkins)

Le pipeline est defini dans le `Jenkinsfile` a la racine. Il enchaine :

1. **Checkout** — recupere le code depuis le depot Git configure dans le job Jenkins.
2. **Backend Tests** — lance `pytest` en parallele pour `livres-service`,
   `utilisateurs-service` et `emprunts-service` (base SQLite en memoire via la
   variable d'environnement `TESTING=1`, aucune dependance a PostgreSQL). Les
   resultats sont publies dans Jenkins (JUnit).
3. **Frontend Lint & Build** — `npm ci`, `npm run lint` (oxlint), `npm run
   build`.
4. **Build Docker Images** — `docker compose --env-file "$ENV_FILE" build`
   pour les 5 services (le `.env` vient d'une credential Jenkins, jamais
   ecrit dans le workspace, voir plus bas).
5. **Deploy** — `docker compose down` puis `docker compose --env-file
   "$ENV_FILE" up -d` sur la machine qui heberge Jenkins.
6. **Smoke Test** — verifie `/health` sur les 3 backends et la racine du
   frontend, avec retry pendant ~60s avant d'echouer le build.

### Lancer Jenkins en local

Jenkins est defini dans `docker-compose.jenkins.yml`, un fichier compose
separe du principal (le pipeline fait `docker compose down`/`up` sur
`docker-compose.yml` pour deployer l'appli ; si Jenkins etait dans ce meme
fichier, ce `down` le couperait lui-meme en plein build).

```bash
docker compose up --build -d          # 1. l'appli d'abord (cree le reseau biblio-network)
docker compose -f docker-compose.jenkins.yml up --build -d   # 2. puis Jenkins
```

Jenkins est servi sur `http://localhost:8090`. Le compte admin est cree
automatiquement au demarrage via Configuration as Code (`jenkins/casc.yaml`,
`CASC_JENKINS_CONFIG`) : plus d'assistant de configuration initiale ni
d'installation manuelle des plugins (ils sont installes a l'image, voir
`jenkins/plugins.txt`). Identifiants pris dans `.env` a la racine
(`JENKINS_ADMIN_ID` / `JENKINS_ADMIN_PASSWORD`, voir `.env.example`) — a
definir avant le premier `docker compose -f docker-compose.jenkins.yml up`,
sinon le conteneur refuse de demarrer (`JENKINS_ADMIN_PASSWORD` obligatoire).

Cette commande fonctionne a l'identique sur Linux, macOS et Windows (Docker
Desktop) : le conteneur Jenkins rejoint le reseau `biblio-network` (declare
`external: true`, cree par le compose principal) et peut donc joindre les
autres services par leur nom (`http://livres-service:8000/health`, etc.),
comme le fait deja `emprunts-service` — c'est ce que fait le stage Smoke Test
du `Jenkinsfile`. Pas besoin de `--network host` (specifique a Linux et
inutile sous Docker Desktop) ni d'exposer les ports du conteneur pour ca.

Le socket Docker de l'hote est monte dans le conteneur (`/var/run/docker.sock`)
pour que Jenkins puisse piloter `docker compose build/up/down` ; le service
tourne en `user: root` pour eviter d'avoir a faire correspondre le GID du
socket (`stat -c '%g' ...` n'existe pas sous Windows) a un utilisateur du
conteneur.

### Configuration du job (une seule fois)

1. Ajouter une credential **Secret file** nommee exactement `ditlib-env-file`
   contenant le `.env` du projet (Manage Jenkins → Credentials).
2. Creer un item **Pipeline** nomme `ditlib`, "Pipeline script from SCM",
   pointer vers le depot GitHub et la branche a builder, Script Path =
   `Jenkinsfile`.
   - Pour tester en local sans pousser sur GitHub : decommenter le bind
     mount et la variable `JAVA_OPTS` dans `docker-compose.jenkins.yml`,
     puis utiliser l'URL `file:///workspace/DITLib` (Jenkins refuse les
     checkouts Git locaux par defaut, par securite, d'ou `JAVA_OPTS`).
3. "Build Now" pour declencher un run.

Jenkins tourne sur la meme machine que le deploiement : le socket Docker de
l'hote est monte dans le conteneur Jenkins, ce qui lui permet d'executer
`docker compose build/up/down` directement sur cette machine, sans agent
distant ni SSH.

## Structure du projet

```
DITLib/
├── docker-compose.yml
├── docker-compose.jenkins.yml   # Jenkins, separe du compose principal (voir plus haut)
├── Jenkinsfile                  # pipeline declaratif (test, build, deploy, smoke test)
├── jenkins/                     # image Jenkins locale (Dockerfile, plugins.txt, casc.yaml)
├── .env.example
├── frontend/                # SPA React (voir frontend/README.md)
├── livres-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── tests/               # pytest (base SQLite en memoire, TESTING=1)
│   └── app/
│       ├── main.py         # routes FastAPI
│       ├── database.py     # connexion SQLAlchemy / PostgreSQL
│       ├── models.py       # modele ORM Livre
│       └── schemas.py      # schemas Pydantic
├── utilisateurs-service/
│   └── ...                 # meme structure (modele Utilisateur)
└── emprunts-service/
    ├── tests/
    └── app/
        ├── main.py
        ├── clients.py       # appels REST vers livres-service / utilisateurs-service
        ├── database.py
        ├── models.py        # modele ORM Emprunt
        └── schemas.py
```

## Principaux endpoints

### livres-service (`:8011`)
- `POST /livres` - ajouter un livre
- `GET /livres?q=...` - lister / rechercher par titre, auteur ou ISBN
- `GET /livres/{id}` - detail d'un livre
- `PUT /livres/{id}` - modifier un livre
- `DELETE /livres/{id}` - supprimer un livre

### utilisateurs-service (`:8002`)
- `POST /utilisateurs` - creer un utilisateur
- `GET /utilisateurs?type_utilisateur=...` - lister les utilisateurs
- `GET /utilisateurs/{id}` - profil d'un utilisateur

### emprunts-service (`:8003`)
- `POST /emprunts` - emprunter un livre (verifie livre + utilisateur, decremente le stock)
- `POST /emprunts/{id}/retour` - retourner un livre
- `GET /emprunts?utilisateur_id=...` - historique des emprunts
- `GET /emprunts/{id}` - detail d'un emprunt

> **Note sur l'integration frontend** : par design microservices, chaque service ne
> connait que ses propres donnees. Un emprunt renvoie uniquement `livre_id` et
> `utilisateur_id` (pas le titre du livre ni le nom de l'utilisateur). Le frontend
> appelle `livres-service` et `utilisateurs-service` separement (`GET /livres/{id}`,
> `GET /utilisateurs/{id}`) pour resoudre ces identifiants et assembler l'affichage
> cote client (voir `frontend/src/utils/enrichEmprunts.js`).
