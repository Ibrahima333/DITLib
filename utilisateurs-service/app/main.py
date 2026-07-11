from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

# Cree les tables dans MySQL au demarrage si elles n'existent pas encore
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Utilisateurs Service",
    description="Microservice de gestion des utilisateurs - Bibliotheque Numerique DIT",
    version="1.0.0",
)

# Autorise le frontend (sur un autre port/domaine) a appeler cette API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "utilisateurs-service"}


@app.post("/utilisateurs", response_model=schemas.UtilisateurOut, status_code=201)
def create_utilisateur(payload: schemas.UtilisateurCreate, db: Session = Depends(get_db)):
    utilisateur_existant = db.query(models.Utilisateur).filter(models.Utilisateur.email == payload.email).first()
    if utilisateur_existant:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe deja")

    utilisateur = models.Utilisateur(
        nom=payload.nom,
        prenom=payload.prenom,
        email=payload.email,
        type_utilisateur=payload.type_utilisateur,
    )
    db.add(utilisateur)
    db.commit()
    db.refresh(utilisateur)
    return utilisateur


@app.get("/utilisateurs", response_model=list[schemas.UtilisateurOut])
def list_utilisateurs(
    type_utilisateur: models.TypeUtilisateur | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Utilisateur)
    if type_utilisateur:
        query = query.filter(models.Utilisateur.type_utilisateur == type_utilisateur)
    return query.all()


@app.get("/utilisateurs/{utilisateur_id}", response_model=schemas.UtilisateurOut)
def get_utilisateur(utilisateur_id: int, db: Session = Depends(get_db)):
    utilisateur = db.query(models.Utilisateur).filter(models.Utilisateur.id == utilisateur_id).first()
    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    return utilisateur
