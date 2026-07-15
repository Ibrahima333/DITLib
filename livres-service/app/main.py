from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, engine, get_db

# Cree les tables dans PostgreSQL au demarrage si elles n'existent pas encore
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Livres Service",
    description="Microservice de gestion des livres - Bibliotheque Numerique DIT",
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
    return {"status": "ok", "service": "livres-service"}


@app.post("/livres", response_model=schemas.LivreOut, status_code=201)
def create_livre(livre: schemas.LivreCreate, db: Session = Depends(get_db)):
    livre_existant = db.query(models.Livre).filter(models.Livre.isbn == livre.isbn).first()
    if livre_existant:
        raise HTTPException(status_code=400, detail="Un livre avec cet ISBN existe deja")

    # Au depart, tous les exemplaires sont disponibles.
    nouveau_livre = models.Livre(
        titre=livre.titre,
        auteur=livre.auteur,
        isbn=livre.isbn,
        quantite_totale=livre.quantite_totale,
        quantite_disponible=livre.quantite_totale,
    )
    db.add(nouveau_livre)
    db.commit()
    db.refresh(nouveau_livre)
    return nouveau_livre


@app.get("/livres", response_model=list[schemas.LivreOut])
def list_livres(
    q: str | None = Query(default=None, description="Recherche par titre, auteur ou ISBN"),
    db: Session = Depends(get_db),
):
    query = db.query(models.Livre)

    if q:
        mot_cle = f"%{q}%"
        query = query.filter(
            models.Livre.titre.like(mot_cle)
            | models.Livre.auteur.like(mot_cle)
            | models.Livre.isbn.like(mot_cle)
        )

    return query.all()


@app.get("/livres/{livre_id}", response_model=schemas.LivreOut)
def get_livre(livre_id: int, db: Session = Depends(get_db)):
    livre = db.query(models.Livre).filter(models.Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    return livre


@app.put("/livres/{livre_id}", response_model=schemas.LivreOut)
def update_livre(livre_id: int, payload: schemas.LivreUpdate, db: Session = Depends(get_db)):
    livre = db.query(models.Livre).filter(models.Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")

    # On ne met a jour que les champs envoyes par le client
    if payload.titre is not None:
        livre.titre = payload.titre
    if payload.auteur is not None:
        livre.auteur = payload.auteur
    if payload.isbn is not None:
        livre.isbn = payload.isbn
    if payload.quantite_totale is not None:
        # On ajuste le stock disponible du meme montant que le changement de quantite totale
        difference = payload.quantite_totale - livre.quantite_totale
        livre.quantite_disponible = max(0, livre.quantite_disponible + difference)
        livre.quantite_totale = payload.quantite_totale

    db.commit()
    db.refresh(livre)
    return livre


@app.delete("/livres/{livre_id}", status_code=204)
def delete_livre(livre_id: int, db: Session = Depends(get_db)):
    livre = db.query(models.Livre).filter(models.Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    db.delete(livre)
    db.commit()


# Ces deux routes sont appelees par emprunts-service (pas directement par le frontend)
@app.post("/livres/{livre_id}/emprunter", response_model=schemas.LivreOut)
def emprunter_livre(livre_id: int, db: Session = Depends(get_db)):
    livre = db.query(models.Livre).filter(models.Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")
    if livre.quantite_disponible < 1:
        raise HTTPException(status_code=409, detail="Aucun exemplaire disponible")

    livre.quantite_disponible -= 1
    db.commit()
    db.refresh(livre)
    return livre


@app.post("/livres/{livre_id}/retourner", response_model=schemas.LivreOut)
def retourner_livre(livre_id: int, db: Session = Depends(get_db)):
    livre = db.query(models.Livre).filter(models.Livre.id == livre_id).first()
    if not livre:
        raise HTTPException(status_code=404, detail="Livre introuvable")

    livre.quantite_disponible = min(livre.quantite_totale, livre.quantite_disponible + 1)
    db.commit()
    db.refresh(livre)
    return livre
