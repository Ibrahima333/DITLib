from pydantic import BaseModel, ConfigDict, EmailStr

from .models import TypeUtilisateur


class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    type_utilisateur: TypeUtilisateur


class UtilisateurCreate(UtilisateurBase):
    pass


class UtilisateurOut(UtilisateurBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
