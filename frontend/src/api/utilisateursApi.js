import { utilisateursClient } from './client'

export const utilisateursApi = {
  getAll: (typeUtilisateur) =>
    utilisateursClient
      .get('/utilisateurs', { params: { type_utilisateur: typeUtilisateur } })
      .then((res) => res.data),

  getById: (id) =>
    utilisateursClient.get(`/utilisateurs/${id}`).then((res) => res.data),

  create: (utilisateur) =>
    utilisateursClient
      .post('/utilisateurs', utilisateur)
      .then((res) => res.data),
}
