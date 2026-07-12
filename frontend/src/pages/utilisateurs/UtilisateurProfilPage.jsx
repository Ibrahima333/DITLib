import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { utilisateursApi } from '../../api/utilisateursApi'
import { empruntsApi } from '../../api/empruntsApi'
import { enrichEmprunts } from '../../utils/enrichEmprunts'
import { formatDate } from '../../utils/formatDate'
import { typeLabels } from '../../constants/utilisateurTypes'
import Spinner from '../../components/ui/Spinner'
import ErrorBanner from '../../components/ui/ErrorBanner'
import EmptyState from '../../components/ui/EmptyState'

export default function UtilisateurProfilPage() {
  const { id } = useParams()
  const [utilisateur, setUtilisateur] = useState(null)
  const [historique, setHistorique] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([utilisateursApi.getById(id), empruntsApi.historique(id)])
      .then(([utilisateurData, historiqueData]) =>
        enrichEmprunts(historiqueData, { includeUtilisateur: false }).then((enriched) => {
          setUtilisateur(utilisateurData)
          setHistorique(enriched)
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when id changes
  }, [id])

  if (loading) return <Spinner />

  return (
    <div>
      <Link
        to="/utilisateurs"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Retour aux utilisateurs
      </Link>

      <ErrorBanner message={error} />

      {utilisateur && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {utilisateur.prenom} {utilisateur.nom}
          </h1>
          <p className="mt-1 text-slate-500">{utilisateur.email}</p>
          <span className="mt-3 inline-block rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            {typeLabels[utilisateur.type_utilisateur] ?? utilisateur.type_utilisateur}
          </span>
        </div>
      )}

      <h2 className="mt-8 text-lg font-semibold text-slate-800">
        Historique des emprunts
      </h2>
      <div className="mt-3">
        {historique.length === 0 ? (
          <EmptyState title="Aucun emprunt" description="Cet utilisateur n'a encore rien emprunté." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Livre</th>
                  <th className="px-4 py-3 font-medium">Date d'emprunt</th>
                  <th className="px-4 py-3 font-medium">Date de retour</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historique.map((emprunt) => (
                  <tr key={emprunt.id}>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {emprunt.livreTitre ?? `Livre #${emprunt.livre_id}`}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(emprunt.date_emprunt)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(emprunt.date_retour_effective)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          emprunt.statut === 'RETOURNE'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {emprunt.statut === 'RETOURNE' ? 'Retourné' : 'En cours'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
