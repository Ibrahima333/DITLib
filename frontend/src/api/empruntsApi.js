import { empruntsClient } from './client'

export const empruntsApi = {
  getAll: () => empruntsClient.get('/emprunts').then((res) => res.data),

  emprunter: (data) =>
    empruntsClient.post('/emprunts', data).then((res) => res.data),

  retourner: (id) =>
    empruntsClient
      .put(`/emprunts/${id}/retour`)
      .then((res) => res.data),

  historique: (utilisateurId) =>
    empruntsClient
      .get(`/emprunts/historique/${utilisateurId}`)
      .then((res) => res.data),
}
