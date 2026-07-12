import { empruntsClient } from './client'

export const empruntsApi = {
  getAll: (utilisateurId) =>
    empruntsClient
      .get('/emprunts', { params: { utilisateur_id: utilisateurId } })
      .then((res) => res.data),

  emprunter: ({ livreId, utilisateurId, dureeJours }) =>
    empruntsClient
      .post('/emprunts', {
        livre_id: livreId,
        utilisateur_id: utilisateurId,
        duree_jours: dureeJours ?? 14,
      })
      .then((res) => res.data),

  retourner: (id) =>
    empruntsClient.post(`/emprunts/${id}/retour`).then((res) => res.data),

  historique: (utilisateurId) =>
    empruntsClient
      .get('/emprunts', { params: { utilisateur_id: utilisateurId } })
      .then((res) => res.data),
}
