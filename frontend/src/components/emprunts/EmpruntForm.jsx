import { useEffect, useState } from 'react'
import { livresApi } from '../../api/livresApi'
import { utilisateursApi } from '../../api/utilisateursApi'

export default function EmpruntForm({ onSubmit, onCancel, submitting }) {
  const [livres, setLivres] = useState([])
  const [utilisateurs, setUtilisateurs] = useState([])
  const [livreId, setLivreId] = useState('')
  const [utilisateurId, setUtilisateurId] = useState('')
  const [dureeJours, setDureeJours] = useState(14)

  useEffect(() => {
    livresApi.getAll().then(setLivres).catch(() => setLivres([]))
    utilisateursApi.getAll().then(setUtilisateurs).catch(() => setUtilisateurs([]))
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      livreId: Number(livreId),
      utilisateurId: Number(utilisateurId),
      dureeJours: Number(dureeJours),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Livre</label>
        <select
          value={livreId}
          onChange={(e) => setLivreId(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="" disabled>
            Sélectionner un livre
          </option>
          {livres.map((livre) => (
            <option key={livre.id} value={livre.id} disabled={livre.quantite_disponible < 1}>
              {livre.titre} — {livre.auteur} ({livre.quantite_disponible} disponible
              {livre.quantite_disponible > 1 ? 's' : ''})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Utilisateur
        </label>
        <select
          value={utilisateurId}
          onChange={(e) => setUtilisateurId(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="" disabled>
            Sélectionner un utilisateur
          </option>
          {utilisateurs.map((utilisateur) => (
            <option key={utilisateur.id} value={utilisateur.id}>
              {utilisateur.prenom} {utilisateur.nom}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Durée (jours)
        </label>
        <input
          type="number"
          min="1"
          max="90"
          value={dureeJours}
          onChange={(e) => setDureeJours(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? 'Enregistrement...' : 'Emprunter'}
        </button>
      </div>
    </form>
  )
}
