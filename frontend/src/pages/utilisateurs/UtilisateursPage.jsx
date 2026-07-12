import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { utilisateursApi } from '../../api/utilisateursApi'
import UtilisateursTable from '../../components/utilisateurs/UtilisateursTable'
import UtilisateurForm from '../../components/utilisateurs/UtilisateurForm'
import Modal from '../../components/ui/Modal'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import ErrorBanner from '../../components/ui/ErrorBanner'
import { usePagination } from '../../hooks/usePagination'

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { page, totalPages, setPage, pageItems, resetPage } = usePagination(utilisateurs)

  function loadUtilisateurs() {
    setLoading(true)
    setError(null)
    utilisateursApi
      .getAll()
      .then((data) => {
        setUtilisateurs(data)
        resetPage()
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUtilisateurs()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, [])

  async function handleSubmit(form) {
    setSubmitting(true)
    setError(null)
    try {
      await utilisateursApi.create(form)
      setModalOpen(false)
      loadUtilisateurs()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Utilisateurs</h1>
          <p className="mt-1 text-slate-500">
            Étudiants, professeurs et personnel administratif.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Ajouter un utilisateur
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <ErrorBanner message={error} />
        {loading ? (
          <Spinner />
        ) : (
          <>
            <UtilisateursTable utilisateurs={pageItems} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {modalOpen && (
        <Modal title="Ajouter un utilisateur" onClose={() => setModalOpen(false)}>
          <UtilisateurForm
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            submitting={submitting}
          />
        </Modal>
      )}
    </div>
  )
}
