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

```bash
docker build -t ditlib-jenkins ./jenkins
docker volume create jenkins_home
docker run -d --name ditlib-jenkins \
  --network host \
  -e JENKINS_OPTS="--httpPort=8090" \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add "$(stat -c '%g' /var/run/docker.sock)" \
  ditlib-jenkins
```

Jenkins est servi sur `http://localhost:8090` (le port 8080 est deja pris par
le frontend). Mot de passe initial :
`docker exec ditlib-jenkins cat /var/jenkins_home/secrets/initialAdminPassword`.

**`--network host` est indispensable** : Jenkins tourne dans un conteneur qui
pilote le Docker de l'hote via le socket monte (`/var/run/docker.sock`), mais
les conteneurs de l'application (`docker compose up`) sont alors des
conteneurs *freres*, pas des enfants de Jenkins — ils publient leurs ports sur
l'hote, pas dans le namespace reseau du conteneur Jenkins. Sans
`--network host`, le stage Smoke Test (qui fait `curl http://localhost:8011/...`
depuis l'interieur du conteneur Jenkins) ne peut pas les joindre. Avec
`--network host`, `-p` n'a plus d'effet, d'ou le port HTTP de Jenkins
reconfigure via `JENKINS_OPTS="--httpPort=8090"` plutot qu'un mapping `-p`.

### Configuration du job (une seule fois)

1. Ajouter une credential **Secret file** nommee exactement `ditlib-env-file`
   contenant le `.env` du projet (Manage Jenkins → Credentials).
2. Creer un item **Pipeline** nomme `ditlib`, "Pipeline script from SCM",
   pointer vers le depot GitHub et la branche a builder, Script Path =
   `Jenkinsfile`.
   - Pour tester en local sans pousser sur GitHub : monter le repo dans le
     conteneur Jenkins (`-v "$(pwd)":/workspace/DITLib:ro`), utiliser l'URL
     `file:///workspace/DITLib`, et ajouter
     `-e JAVA_OPTS="-Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true"`
     au lancement du conteneur (Jenkins refuse les checkouts Git locaux par
     defaut, par securite).
3. "Build Now" pour declencher un run.

Jenkins tourne sur la meme machine que le deploiement : le socket Docker de
l'hote est monte dans le conteneur Jenkins, ce qui lui permet d'executer
`docker compose build/up/down` directement sur cette machine, sans agent
distant ni SSH.

## Structure du projet

```
DITLib/
├── docker-compose.yml
├── .env.example
├── frontend/                # SPA React (voir frontend/README.md)
├── livres-service/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py         # routes FastAPI
│       ├── database.py     # connexion SQLAlchemy / PostgreSQL
│       ├── models.py       # modele ORM Livre
│       └── schemas.py      # schemas Pydantic
├── utilisateurs-service/
│   └── ...                 # meme structure (modele Utilisateur)
└── emprunts-service/
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

> **Note sur l'integration frontend** : par design microservices, chaque service ne
> connait que ses propres donnees. Un emprunt renvoie uniquement `livre_id` et
> `utilisateur_id` (pas le titre du livre ni le nom de l'utilisateur). Le frontend
> appelle `livres-service` et `utilisateurs-service` separement (`GET /livres/{id}`,
> `GET /utilisateurs/{id}`) pour resoudre ces identifiants et assembler l'affichage
> cote client (voir `frontend/src/utils/enrichEmprunts.js`).
