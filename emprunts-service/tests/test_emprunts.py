def _utilisateur_fake(utilisateur_id=1):
    return {
        "id": utilisateur_id,
        "nom": "Diop",
        "prenom": "Awa",
        "email": "awa@example.com",
        "type_utilisateur": "ETUDIANT",
    }


def _livre_fake(livre_id=1, disponible=True):
    return {
        "id": livre_id,
        "titre": "1984",
        "auteur": "Orwell",
        "isbn": "isbn-1",
        "quantite_totale": 2,
        "quantite_disponible": 1 if disponible else 0,
    }


def test_creer_emprunt(client, monkeypatch):
    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: _utilisateur_fake(uid))
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: _livre_fake(lid))
    monkeypatch.setattr("app.main.clients.emprunter_livre", lambda lid: _livre_fake(lid, disponible=False))

    response = client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1, "duree_jours": 14})
    assert response.status_code == 201
    data = response.json()
    assert data["livre_id"] == 1
    assert data["utilisateur_id"] == 1
    assert data["statut"] == "EN_COURS"


def test_creer_emprunt_duree_par_defaut(client, monkeypatch):
    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: _utilisateur_fake(uid))
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: _livre_fake(lid))
    monkeypatch.setattr("app.main.clients.emprunter_livre", lambda lid: _livre_fake(lid, disponible=False))

    response = client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1})
    assert response.status_code == 201


def test_creer_emprunt_utilisateur_introuvable(client, monkeypatch):
    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: None)
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: _livre_fake(lid))

    response = client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1})
    assert response.status_code == 404


def test_creer_emprunt_livre_introuvable(client, monkeypatch):
    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: _utilisateur_fake(uid))
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: None)

    response = client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1})
    assert response.status_code == 404


def test_creer_emprunt_stock_epuise(client, monkeypatch):
    import requests

    def _emprunter_leve_409(lid):
        fake_response = requests.Response()
        fake_response.status_code = 409
        raise requests.HTTPError(response=fake_response)

    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: _utilisateur_fake(uid))
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: _livre_fake(lid, disponible=False))
    monkeypatch.setattr("app.main.clients.emprunter_livre", _emprunter_leve_409)

    response = client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1})
    assert response.status_code == 409


def test_retourner_emprunt(client, monkeypatch):
    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: _utilisateur_fake(uid))
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: _livre_fake(lid))
    monkeypatch.setattr("app.main.clients.emprunter_livre", lambda lid: _livre_fake(lid, disponible=False))
    monkeypatch.setattr("app.main.clients.retourner_livre", lambda lid: _livre_fake(lid, disponible=True))

    creation = client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1})
    emprunt_id = creation.json()["id"]

    response = client.post(f"/emprunts/{emprunt_id}/retour")
    assert response.status_code == 200
    assert response.json()["statut"] == "RETOURNE"


def test_retourner_emprunt_deja_retourne(client, monkeypatch):
    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: _utilisateur_fake(uid))
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: _livre_fake(lid))
    monkeypatch.setattr("app.main.clients.emprunter_livre", lambda lid: _livre_fake(lid, disponible=False))
    monkeypatch.setattr("app.main.clients.retourner_livre", lambda lid: _livre_fake(lid, disponible=True))

    creation = client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1})
    emprunt_id = creation.json()["id"]
    client.post(f"/emprunts/{emprunt_id}/retour")

    response = client.post(f"/emprunts/{emprunt_id}/retour")
    assert response.status_code == 400


def test_retourner_emprunt_introuvable(client):
    response = client.post("/emprunts/9999/retour")
    assert response.status_code == 404


def test_historique_filtre_par_utilisateur(client, monkeypatch):
    monkeypatch.setattr("app.main.clients.get_utilisateur", lambda uid: _utilisateur_fake(uid))
    monkeypatch.setattr("app.main.clients.get_livre", lambda lid: _livre_fake(lid))
    monkeypatch.setattr("app.main.clients.emprunter_livre", lambda lid: _livre_fake(lid, disponible=False))

    client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 1})
    client.post("/emprunts", json={"livre_id": 1, "utilisateur_id": 2})

    response = client.get("/emprunts", params={"utilisateur_id": 1})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["utilisateur_id"] == 1
