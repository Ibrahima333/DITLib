from sqlalchemy import Column, Integer, String

from .database import Base


class Livre(Base):
    __tablename__ = "livres"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(255), nullable=False, index=True)
    auteur = Column(String(255), nullable=False, index=True)
    isbn = Column(String(20), unique=True, nullable=False, index=True)
    quantite_totale = Column(Integer, nullable=False, default=1)
    quantite_disponible = Column(Integer, nullable=False, default=1)
