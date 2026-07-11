import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DashboardPage from './pages/DashboardPage'
import LivresPage from './pages/livres/LivresPage'
import UtilisateursPage from './pages/utilisateurs/UtilisateursPage'
import UtilisateurProfilPage from './pages/utilisateurs/UtilisateurProfilPage'
import EmpruntsPage from './pages/emprunts/EmpruntsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="livres" element={<LivresPage />} />
          <Route path="utilisateurs" element={<UtilisateursPage />} />
          <Route path="utilisateurs/:id" element={<UtilisateurProfilPage />} />
          <Route path="emprunts" element={<EmpruntsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
