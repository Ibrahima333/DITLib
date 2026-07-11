import { useEffect, useState } from 'react'
import { BookOpen, Users, ArrowLeftRight } from 'lucide-react'
import { livresApi } from '../api/livresApi'
import { utilisateursApi } from '../api/utilisateursApi'
import { empruntsApi } from '../api/empruntsApi'

const cards = [
  { key: 'livres', label: 'Livres', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'utilisateurs', label: 'Utilisateurs', icon: Users, color: 'text-sky-600 bg-sky-50' },
  { key: 'emprunts', label: 'Emprunts en cours', icon: ArrowLeftRight, color: 'text-amber-600 bg-amber-50' },
]

export default function DashboardPage() {
  const [counts, setCounts] = useState({ livres: null, utilisateurs: null, emprunts: null })

  useEffect(() => {
    livresApi
      .getAll()
      .then((data) => setCounts((c) => ({ ...c, livres: data.length })))
      .catch(() => setCounts((c) => ({ ...c, livres: '—' })))

    utilisateursApi
      .getAll()
      .then((data) => setCounts((c) => ({ ...c, utilisateurs: data.length })))
      .catch(() => setCounts((c) => ({ ...c, utilisateurs: '—' })))

    empruntsApi
      .getAll()
      .then((data) => setCounts((c) => ({ ...c, emprunts: data.length })))
      .catch(() => setCounts((c) => ({ ...c, emprunts: '—' })))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
      <p className="mt-1 text-slate-500">
        Vue d'ensemble de la bibliothèque numérique du DIT.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, color }) => (
          <div
            key={key}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className={`rounded-lg p-3 ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {counts[key] ?? '…'}
              </p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
