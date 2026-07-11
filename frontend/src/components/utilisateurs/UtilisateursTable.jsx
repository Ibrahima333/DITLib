import { Link } from 'react-router-dom'
import { Pencil, Trash2, Eye } from 'lucide-react'
import EmptyState from '../ui/EmptyState'
import { typeLabels } from '../../constants/utilisateurTypes'

export default function UtilisateursTable({ utilisateurs, onEdit, onDelete }) {
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
                {typeLabels[utilisateur.type] ?? utilisateur.type}
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
                  <button
                    onClick={() => onEdit(utilisateur)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                    aria-label="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(utilisateur)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
