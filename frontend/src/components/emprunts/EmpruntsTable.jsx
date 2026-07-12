import { Undo2 } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import { formatDate } from '../../utils/formatDate'

export default function EmpruntsTable({ emprunts, onRetourner }) {
  if (emprunts.length === 0) {
    return (
      <EmptyState
        title="Aucun emprunt"
        description="Enregistrez un nouvel emprunt pour commencer."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Livre</th>
            <th className="px-4 py-3 font-medium">Utilisateur</th>
            <th className="px-4 py-3 font-medium">Date d'emprunt</th>
            <th className="px-4 py-3 font-medium">Retour prévu</th>
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {emprunts.map((emprunt) => (
            <tr key={emprunt.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">
                {emprunt.livreTitre ?? `Livre #${emprunt.livre_id}`}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {emprunt.utilisateurNom ?? `Utilisateur #${emprunt.utilisateur_id}`}
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(emprunt.date_emprunt)}</td>
              <td className="px-4 py-3 text-slate-600">
                {formatDate(emprunt.date_retour_prevue)}
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
              <td className="px-4 py-3 text-right">
                {emprunt.statut !== 'RETOURNE' && (
                  <button
                    onClick={() => onRetourner(emprunt)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                    aria-label="Retourner"
                  >
                    <Undo2 size={16} />
                    Retourner
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
