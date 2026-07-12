# Bibliotheque Numerique Microservices

Projet **Bibliotheque Numerique Microservices** (Examen Containers et Virtualisation,
L2 DIT) : 3 microservices backend FastAPI, une base de donnees MySQL, un frontend React,
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
                                      │   MySQL 8.0      │  :3306
                                      │  bibliotheque_db │
                                      └─────────────────┘
```

Chaque microservice backend est une application **FastAPI** independante avec son
propre `Dockerfile`, exposee sur un port different, et communique avec les autres
services via des appels **API REST** (HTTP). Les 3 services partagent une meme
instance MySQL mais chacun ne gere que ses propres tables (`livres`, `utilisateurs`,
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
# ajuster les identifiants MySQL dans .env si besoin
```

## Lancement avec Docker Compose

```bash
docker compose up --build
```

Cela demarre 5 conteneurs :
- `biblio-mysql` (MySQL 8.0)
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

Pour tout arreter et supprimer les donnees MySQL :

```bash
docker compose down -v
```

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
│       ├── database.py     # connexion SQLAlchemy / MySQL
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
