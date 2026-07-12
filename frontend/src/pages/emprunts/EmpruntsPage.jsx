import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { empruntsApi } from '../../api/empruntsApi'
import { enrichEmprunts } from '../../utils/enrichEmprunts'
import EmpruntsTable from '../../components/emprunts/EmpruntsTable'
import EmpruntForm from '../../components/emprunts/EmpruntForm'
import Modal from '../../components/ui/Modal'
import Spinner from '../../components/ui/Spinner'
import ErrorBanner from '../../components/ui/ErrorBanner'

export default function EmpruntsPage() {
  const [emprunts, setEmprunts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function loadEmprunts() {
    setLoading(true)
    setError(null)
    empruntsApi
      .getAll()
      .then((data) => enrichEmprunts(data))
      .then(setEmprunts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadEmprunts()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, [])

  async function handleSubmit(form) {
    setSubmitting(true)
    setError(null)
    try {
      await empruntsApi.emprunter(form)
      setModalOpen(false)
      loadEmprunts()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRetourner(emprunt) {
    try {
      await empruntsApi.retourner(emprunt.id)
      loadEmprunts()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Emprunts</h1>
          <p className="mt-1 text-slate-500">
            Suivi des emprunts et retours de livres.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Nouvel emprunt
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <ErrorBanner message={error} />
        {loading ? (
          <Spinner />
        ) : (
          <EmpruntsTable emprunts={emprunts} onRetourner={handleRetourner} />
        )}
      </div>

      {modalOpen && (
        <Modal title="Nouvel emprunt" onClose={() => setModalOpen(false)}>
          <EmpruntForm
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            submitting={submitting}
          />
        </Modal>
      )}
    </div>
  )
}
