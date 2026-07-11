import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Integer

from .database import Base


class StatutEmprunt(str, enum.Enum):
    EN_COURS = "EN_COURS"
    RETOURNE = "RETOURNE"


class Emprunt(Base):
    __tablename__ = "emprunts"

    id = Column(Integer, primary_key=True, index=True)
    livre_id = Column(Integer, nullable=False, index=True)
    utilisateur_id = Column(Integer, nullable=False, index=True)
    date_emprunt = Column(DateTime, default=datetime.utcnow, nullable=False)
    date_retour_prevue = Column(DateTime, nullable=False)
    date_retour_effective = Column(DateTime, nullable=True)
    statut = Column(Enum(StatutEmprunt), default=StatutEmprunt.EN_COURS, nullable=False)
