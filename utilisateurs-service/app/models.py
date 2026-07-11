import enum

from sqlalchemy import Column, Enum, Integer, String

from .database import Base


class TypeUtilisateur(str, enum.Enum):
    ETUDIANT = "ETUDIANT"
    PROFESSEUR = "PROFESSEUR"
    PERSONNEL_ADMINISTRATIF = "PERSONNEL_ADMINISTRATIF"


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    prenom = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    type_utilisateur = Column(Enum(TypeUtilisateur), nullable=False)
