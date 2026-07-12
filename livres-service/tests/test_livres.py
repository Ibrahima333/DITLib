def test_create_livre(client):
    response = client.post(
        "/livres",
        json={
            "titre": "1984",
            "auteur": "George Orwell",
            "isbn": "978-0-452-28423-4",
            "quantite_totale": 3,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["titre"] == "1984"
    assert data["quantite_totale"] == 3
    assert data["quantite_disponible"] == 3


def test_create_livre_isbn_duplique(client):
    payload = {
        "titre": "1984",
        "auteur": "George Orwell",
        "isbn": "978-0-452-28423-4",
        "quantite_totale": 1,
    }
    client.post("/livres", json=payload)
    response = client.post("/livres", json=payload)
    assert response.status_code == 400


def test_recherche_par_titre(client):
    client.post(
        "/livres",
        json={"titre": "1984", "auteur": "George Orwell", "isbn": "isbn-1", "quantite_totale": 1},
    )
    client.post(
        "/livres",
        json={"titre": "Le Petit Prince", "auteur": "Saint-Exupery", "isbn": "isbn-2", "quantite_totale": 1},
    )

    response = client.get("/livres", params={"q": "1984"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["titre"] == "1984"


def test_recherche_par_auteur(client):
    client.post(
        "/livres",
        json={"titre": "1984", "auteur": "George Orwell", "isbn": "isbn-1", "quantite_totale": 1},
    )
    response = client.get("/livres", params={"q": "Orwell"})
    assert len(response.json()) == 1


def test_recherche_par_isbn(client):
    client.post(
        "/livres",
        json={"titre": "1984", "auteur": "George Orwell", "isbn": "isbn-unique", "quantite_totale": 1},
    )
    response = client.get("/livres", params={"q": "isbn-unique"})
    assert len(response.json()) == 1


def test_get_livre_introuvable(client):
    response = client.get("/livres/9999")
    assert response.status_code == 404


def test_update_livre_ajuste_stock_disponible(client):
    create = client.post(
        "/livres",
        json={"titre": "1984", "auteur": "Orwell", "isbn": "isbn-1", "quantite_totale": 5},
    )
    livre_id = create.json()["id"]

    response = client.put(f"/livres/{livre_id}", json={"quantite_totale": 3})
    assert response.status_code == 200
    data = response.json()
    assert data["quantite_totale"] == 3
    assert data["quantite_disponible"] == 3


def test_emprunter_decrement_stock(client):
    create = client.post(
        "/livres",
        json={"titre": "1984", "auteur": "Orwell", "isbn": "isbn-1", "quantite_totale": 2},
    )
    livre_id = create.json()["id"]

    response = client.post(f"/livres/{livre_id}/emprunter")
    assert response.status_code == 200
    assert response.json()["quantite_disponible"] == 1


def test_emprunter_stock_epuise(client):
    create = client.post(
        "/livres",
        json={"titre": "1984", "auteur": "Orwell", "isbn": "isbn-1", "quantite_totale": 1},
    )
    livre_id = create.json()["id"]

    client.post(f"/livres/{livre_id}/emprunter")
    response = client.post(f"/livres/{livre_id}/emprunter")
    assert response.status_code == 409


def test_retourner_incremente_stock(client):
    create = client.post(
        "/livres",
        json={"titre": "1984", "auteur": "Orwell", "isbn": "isbn-1", "quantite_totale": 2},
    )
    livre_id = create.json()["id"]

    client.post(f"/livres/{livre_id}/emprunter")
    response = client.post(f"/livres/{livre_id}/retourner")
    assert response.status_code == 200
    assert response.json()["quantite_disponible"] == 2


def test_delete_livre(client):
    create = client.post(
        "/livres",
        json={"titre": "1984", "auteur": "Orwell", "isbn": "isbn-1", "quantite_totale": 1},
    )
    livre_id = create.json()["id"]

    response = client.delete(f"/livres/{livre_id}")
    assert response.status_code == 204
    assert client.get(f"/livres/{livre_id}").status_code == 404
