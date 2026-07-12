import { livresApi } from '../api/livresApi'
import { utilisateursApi } from '../api/utilisateursApi'

// Le service emprunts ne renvoie que livre_id / utilisateur_id (design microservices).
// On resout les titres/noms cote frontend en appelant les 2 autres services.
export async function enrichEmprunts(emprunts, { includeUtilisateur = true } = {}) {
  const livreIds = [...new Set(emprunts.map((e) => e.livre_id))]
  const utilisateurIds = includeUtilisateur
    ? [...new Set(emprunts.map((e) => e.utilisateur_id))]
    : []

  const [livres, utilisateurs] = await Promise.all([
    Promise.all(livreIds.map((id) => livresApi.getById(id).catch(() => null))),
    Promise.all(utilisateurIds.map((id) => utilisateursApi.getById(id).catch(() => null))),
  ])

  const livreMap = new Map(livres.filter(Boolean).map((l) => [l.id, l]))
  const utilisateurMap = new Map(utilisateurs.filter(Boolean).map((u) => [u.id, u]))

  return emprunts.map((emprunt) => {
    const utilisateur = utilisateurMap.get(emprunt.utilisateur_id)
    return {
      ...emprunt,
      livreTitre: livreMap.get(emprunt.livre_id)?.titre,
      utilisateurNom: utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : undefined,
    }
  })
}
