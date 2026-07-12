def test_create_utilisateur(client):
    response = client.post(
        "/utilisateurs",
        json={
            "nom": "Diop",
            "prenom": "Awa",
            "email": "awa.diop@example.com",
            "type_utilisateur": "ETUDIANT",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "awa.diop@example.com"
    assert data["type_utilisateur"] == "ETUDIANT"
    assert "id" in data


def test_create_utilisateur_email_duplique(client):
    payload = {
        "nom": "Diop",
        "prenom": "Awa",
        "email": "awa.diop@example.com",
        "type_utilisateur": "ETUDIANT",
    }
    client.post("/utilisateurs", json=payload)
    response = client.post("/utilisateurs", json=payload)
    assert response.status_code == 400


def test_create_utilisateur_email_invalide(client):
    response = client.post(
        "/utilisateurs",
        json={
            "nom": "Diop",
            "prenom": "Awa",
            "email": "pas-un-email",
            "type_utilisateur": "ETUDIANT",
        },
    )
    assert response.status_code == 422


def test_liste_tous_les_utilisateurs(client):
    client.post(
        "/utilisateurs",
        json={"nom": "Diop", "prenom": "Awa", "email": "a@example.com", "type_utilisateur": "ETUDIANT"},
    )
    client.post(
        "/utilisateurs",
        json={"nom": "Sow", "prenom": "Ibrahima", "email": "i@example.com", "type_utilisateur": "PROFESSEUR"},
    )

    response = client.get("/utilisateurs")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_filtrage_par_type(client):
    client.post(
        "/utilisateurs",
        json={"nom": "Diop", "prenom": "Awa", "email": "a@example.com", "type_utilisateur": "ETUDIANT"},
    )
    client.post(
        "/utilisateurs",
        json={"nom": "Sow", "prenom": "Ibrahima", "email": "i@example.com", "type_utilisateur": "PROFESSEUR"},
    )

    response = client.get("/utilisateurs", params={"type_utilisateur": "PROFESSEUR"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["email"] == "i@example.com"


def test_get_utilisateur_profil(client):
    create = client.post(
        "/utilisateurs",
        json={"nom": "Diop", "prenom": "Awa", "email": "a@example.com", "type_utilisateur": "ETUDIANT"},
    )
    utilisateur_id = create.json()["id"]

    response = client.get(f"/utilisateurs/{utilisateur_id}")
    assert response.status_code == 200
    assert response.json()["nom"] == "Diop"


def test_get_utilisateur_introuvable(client):
    response = client.get("/utilisateurs/9999")
    assert response.status_code == 404
