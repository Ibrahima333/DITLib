import { Pencil, Trash2 } from 'lucide-react'
import EmptyState from '../ui/EmptyState'

export default function LivresTable({ livres, onEdit, onDelete }) {
  if (livres.length === 0) {
    return (
      <EmptyState
        title="Aucun livre trouvé"
        description="Ajoutez un livre ou modifiez votre recherche."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Titre</th>
            <th className="px-4 py-3 font-medium">Auteur</th>
            <th className="px-4 py-3 font-medium">ISBN</th>
            <th className="px-4 py-3 font-medium">Quantité</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {livres.map((livre) => (
            <tr key={livre.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-800">{livre.titre}</td>
              <td className="px-4 py-3 text-slate-600">{livre.auteur}</td>
              <td className="px-4 py-3 text-slate-600">{livre.isbn}</td>
              <td className="px-4 py-3 text-slate-600">{livre.quantite}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(livre)}
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600"
                    aria-label="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(livre)}
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
