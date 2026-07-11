import { utilisateursClient } from './client'

export const utilisateursApi = {
  getAll: () =>
    utilisateursClient.get('/utilisateurs').then((res) => res.data),

  getById: (id) =>
    utilisateursClient.get(`/utilisateurs/${id}`).then((res) => res.data),

  create: (utilisateur) =>
    utilisateursClient
      .post('/utilisateurs', utilisateur)
      .then((res) => res.data),

  update: (id, utilisateur) =>
    utilisateursClient
      .put(`/utilisateurs/${id}`, utilisateur)
      .then((res) => res.data),

  remove: (id) =>
    utilisateursClient.delete(`/utilisateurs/${id}`).then((res) => res.data),
}
