import os

import requests

LIVRES_SERVICE_URL = os.getenv("LIVRES_SERVICE_URL", "http://livres-service:8000")
UTILISATEURS_SERVICE_URL = os.getenv("UTILISATEURS_SERVICE_URL", "http://utilisateurs-service:8000")


def get_utilisateur(utilisateur_id: int) -> dict | None:
    response = requests.get(f"{UTILISATEURS_SERVICE_URL}/utilisateurs/{utilisateur_id}", timeout=5)
    if response.status_code == 404:
        return None
    response.raise_for_status()
    return response.json()


def get_livre(livre_id: int) -> dict | None:
    response = requests.get(f"{LIVRES_SERVICE_URL}/livres/{livre_id}", timeout=5)
    if response.status_code == 404:
        return None
    response.raise_for_status()
    return response.json()


def emprunter_livre(livre_id: int) -> dict:
    response = requests.post(f"{LIVRES_SERVICE_URL}/livres/{livre_id}/emprunter", timeout=5)
    response.raise_for_status()
    return response.json()


def retourner_livre(livre_id: int) -> dict:
    response = requests.post(f"{LIVRES_SERVICE_URL}/livres/{livre_id}/retourner", timeout=5)
    response.raise_for_status()
    return response.json()
