from pydantic import BaseModel, ConfigDict


# Champs communs a un livre
class LivreBase(BaseModel):
    titre: str
    auteur: str
    isbn: str
    quantite_totale: int = 1


# Ce qu'on recoit pour creer un livre
class LivreCreate(LivreBase):
    pass


# Ce qu'on recoit pour modifier un livre (tous les champs sont optionnels)
class LivreUpdate(BaseModel):
    titre: str | None = None
    auteur: str | None = None
    isbn: str | None = None
    quantite_totale: int | None = None


# Ce qu'on renvoie au client (avec l'id et le stock disponible)
class LivreOut(LivreBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quantite_disponible: int
