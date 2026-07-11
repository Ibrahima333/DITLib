import { NavLink } from 'react-router-dom'
import { BookOpen, LayoutDashboard, Users, ArrowLeftRight } from 'lucide-react'

const links = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/livres', label: 'Livres', icon: BookOpen },
  { to: '/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/emprunts', label: 'Emprunts', icon: ArrowLeftRight },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-lg font-bold text-slate-800">DIT Bibliothèque</p>
        <p className="text-xs text-slate-400">Gestion numérique</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
