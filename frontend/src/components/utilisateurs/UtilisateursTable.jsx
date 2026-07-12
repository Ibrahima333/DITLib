import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import { typeLabels } from '../../constants/utilisateurTypes'

export default function UtilisateursTable({ utilisateurs }) {
  if (utilisateurs.length === 0) {
    return (
      <EmptyState
        title="Aucun utilisateur"
        description="Ajoutez un utilisateur pour commencer."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Nom</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {utilisateurs.map((utilisateur) => (
            <tr key={utilisateur.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">
                {utilisateur.prenom} {utilisateur.nom}
              </td>
              <td className="px-4 py-3 text-slate-600">{utilisateur.email}</td>
              <td className="px-4 py-3 text-slate-600">
                {typeLabels[utilisateur.type_utilisateur] ?? utilisateur.type_utilisateur}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/utilisateurs/${utilisateur.id}`}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-sky-600"
                    aria-label="Voir le profil"
                  >
                    <Eye size={16} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
