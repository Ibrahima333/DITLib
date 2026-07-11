import { useState } from 'react'

const emptyForm = { titre: '', auteur: '', isbn: '', quantite: 1 }

function validate(form) {
  const errors = {}
  if (!form.titre.trim()) errors.titre = 'Le titre est obligatoire.'
  if (!form.auteur.trim()) errors.auteur = "L'auteur est obligatoire."
  if (!/^[0-9-]{10,17}$/.test(form.isbn.trim())) {
    errors.isbn = 'ISBN invalide (10 à 13 chiffres, tirets autorisés).'
  }
  if (!Number.isInteger(form.quantite) || form.quantite < 0) {
    errors.quantite = 'La quantité doit être un entier positif.'
  }
  return errors
}

export default function LivreForm({ initialValue, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initialValue ?? emptyForm)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: name === 'quantite' ? Number(value) : value }))
    setErrors((errs) => ({ ...errs, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Titre</label>
        <input
          name="titre"
          value={form.titre}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.titre && <p className="mt-1 text-xs text-red-600">{errors.titre}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Auteur</label>
        <input
          name="auteur"
          value={form.auteur}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.auteur && <p className="mt-1 text-xs text-red-600">{errors.auteur}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">ISBN</label>
        <input
          name="isbn"
          value={form.isbn}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.isbn && <p className="mt-1 text-xs text-red-600">{errors.isbn}</p>}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Quantité
        </label>
        <input
          type="number"
          min="0"
          name="quantite"
          value={form.quantite}
          onChange={handleChange}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        {errors.quantite && <p className="mt-1 text-xs text-red-600">{errors.quantite}</p>}
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
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  )
}
