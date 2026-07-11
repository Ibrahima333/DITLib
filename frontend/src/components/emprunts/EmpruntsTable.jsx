import { Undo2 } from 'lucide-react'
import EmptyState from '../ui/EmptyState'

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
            <th className="px-4 py-3 font-medium">Statut</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {emprunts.map((emprunt) => (
            <tr key={emprunt.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">
                {emprunt.livreTitre ?? emprunt.livreId}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {emprunt.utilisateurNom ?? emprunt.utilisateurId}
              </td>
              <td className="px-4 py-3 text-slate-600">{emprunt.dateEmprunt}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    emprunt.dateRetour
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {emprunt.dateRetour ? 'Retourné' : 'En cours'}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {!emprunt.dateRetour && (
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
