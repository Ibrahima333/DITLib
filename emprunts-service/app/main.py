from datetime import datetime, timedelta

import requests
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import clients, models, schemas
from .database import Base, engine, get_db

# Cree les tables dans MySQL au demarrage si elles n'existent pas encore
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Emprunts Service",
    description="Microservice de gestion des emprunts - Bibliotheque Numerique DIT",
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
    return {"status": "ok", "service": "emprunts-service"}


@app.post("/emprunts", response_model=schemas.EmpruntOut, status_code=201)
def creer_emprunt(payload: schemas.EmpruntCreate, db: Session = Depends(get_db)):
    # On verifie d'abord que le livre et l'utilisateur existent bien,
    # en appelant les 2 autres microservices en REST
    try:
        utilisateur = clients.get_utilisateur(payload.utilisateur_id)
        livre = clients.get_livre(payload.livre_id)
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Service indisponible, reessayez plus tard")

    if not utilisateur:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")

    # On demande a livres-service de decrementer le stock disponible
    try:
        clients.emprunter_livre(payload.livre_id)
    except requests.HTTPError as erreur:
        if erreur.response is not None and erreur.response.status_code == 409:
            raise HTTPException(status_code=409, detail="Aucun exemplaire disponible")
        raise HTTPException(status_code=503, detail="Service livres indisponible")
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Service livres indisponible")

    emprunt = models.Emprunt(
        livre_id=payload.livre_id,
        utilisateur_id=payload.utilisateur_id,
        date_retour_prevue=datetime.utcnow() + timedelta(days=payload.duree_jours),
    )
    db.add(emprunt)
    db.commit()
    db.refresh(emprunt)
    return emprunt


@app.post("/emprunts/{emprunt_id}/retour", response_model=schemas.EmpruntOut)
def retourner_emprunt(emprunt_id: int, db: Session = Depends(get_db)):
    emprunt = db.query(models.Emprunt).filter(models.Emprunt.id == emprunt_id).first()
    if not emprunt:
        raise HTTPException(status_code=404, detail="Emprunt introuvable")
    if emprunt.statut == models.StatutEmprunt.RETOURNE:
        raise HTTPException(status_code=400, detail="Ce livre a deja ete retourne")

    # On demande a livres-service de re-incrementer le stock disponible
    try:
        clients.retourner_livre(emprunt.livre_id)
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Service livres indisponible")

    emprunt.statut = models.StatutEmprunt.RETOURNE
    emprunt.date_retour_effective = datetime.utcnow()
    db.commit()
    db.refresh(emprunt)
    return emprunt


@app.get("/emprunts", response_model=list[schemas.EmpruntOut])
def historique(utilisateur_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Emprunt)
    if utilisateur_id is not None:
        query = query.filter(models.Emprunt.utilisateur_id == utilisateur_id)
    return query.order_by(models.Emprunt.date_emprunt.desc()).all()


@app.get("/emprunts/{emprunt_id}", response_model=schemas.EmpruntOut)
def get_emprunt(emprunt_id: int, db: Session = Depends(get_db)):
    emprunt = db.query(models.Emprunt).filter(models.Emprunt.id == emprunt_id).first()
    if not emprunt:
        raise HTTPException(status_code=404, detail="Emprunt introuvable")
    return emprunt
