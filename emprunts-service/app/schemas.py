from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from .models import StatutEmprunt


class EmpruntCreate(BaseModel):
    livre_id: int
    utilisateur_id: int
    duree_jours: int = Field(default=14, ge=1, le=90)


class EmpruntOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    livre_id: int
    utilisateur_id: int
    date_emprunt: datetime
    date_retour_prevue: datetime
    date_retour_effective: datetime | None
    statut: StatutEmprunt
