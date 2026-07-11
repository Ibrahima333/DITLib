import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { utilisateursApi } from '../../api/utilisateursApi'
import UtilisateursTable from '../../components/utilisateurs/UtilisateursTable'
import UtilisateurForm from '../../components/utilisateurs/UtilisateurForm'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import ErrorBanner from '../../components/ui/ErrorBanner'
import { usePagination } from '../../hooks/usePagination'

export default function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUtilisateur, setEditingUtilisateur] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

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

  function openCreateModal() {
    setEditingUtilisateur(null)
    setModalOpen(true)
  }

  function openEditModal(utilisateur) {
    setEditingUtilisateur(utilisateur)
    setModalOpen(true)
  }

  async function handleSubmit(form) {
    setSubmitting(true)
    setError(null)
    try {
      if (editingUtilisateur) {
        await utilisateursApi.update(editingUtilisateur.id, form)
      } else {
        await utilisateursApi.create(form)
      }
      setModalOpen(false)
      loadUtilisateurs()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    try {
      await utilisateursApi.remove(deleteTarget.id)
      setDeleteTarget(null)
      loadUtilisateurs()
    } catch (err) {
      setError(err.message)
      setDeleteTarget(null)
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
          onClick={openCreateModal}
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
            <UtilisateursTable
              utilisateurs={pageItems}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editingUtilisateur ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}
          onClose={() => setModalOpen(false)}
        >
          <UtilisateurForm
            initialValue={editingUtilisateur}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            submitting={submitting}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer l'utilisateur"
          message={`Voulez-vous vraiment supprimer ${deleteTarget.prenom} ${deleteTarget.nom} ?`}
          confirmLabel="Supprimer"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
