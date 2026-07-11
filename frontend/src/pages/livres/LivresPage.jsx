import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { livresApi } from '../../api/livresApi'
import LivresTable from '../../components/livres/LivresTable'
import LivreForm from '../../components/livres/LivreForm'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'
import Spinner from '../../components/ui/Spinner'
import ErrorBanner from '../../components/ui/ErrorBanner'
import { usePagination } from '../../hooks/usePagination'

export default function LivresPage() {
  const [livres, setLivres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLivre, setEditingLivre] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { page, totalPages, setPage, pageItems, resetPage } = usePagination(livres)

  function loadLivres(searchQuery) {
    setLoading(true)
    setError(null)
    const request = searchQuery ? livresApi.search(searchQuery) : livresApi.getAll()
    request
      .then((data) => {
        setLivres(data)
        resetPage()
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadLivres()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only
  }, [])

  function handleSearchSubmit(e) {
    e.preventDefault()
    loadLivres(query)
  }

  function openCreateModal() {
    setEditingLivre(null)
    setModalOpen(true)
  }

  function openEditModal(livre) {
    setEditingLivre(livre)
    setModalOpen(true)
  }

  async function handleSubmit(form) {
    setSubmitting(true)
    setError(null)
    try {
      if (editingLivre) {
        await livresApi.update(editingLivre.id, form)
      } else {
        await livresApi.create(form)
      }
      setModalOpen(false)
      loadLivres(query)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleConfirmDelete() {
    try {
      await livresApi.remove(deleteTarget.id)
      setDeleteTarget(null)
      loadLivres(query)
    } catch (err) {
      setError(err.message)
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Livres</h1>
          <p className="mt-1 text-slate-500">
            Gérez le catalogue de la bibliothèque.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus size={16} />
          Ajouter un livre
        </button>
      </div>

      <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par titre, auteur ou ISBN"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Rechercher
        </button>
      </form>

      <div className="mt-4 space-y-4">
        <ErrorBanner message={error} />
        {loading ? (
          <Spinner />
        ) : (
          <>
            <LivresTable
              livres={pageItems}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editingLivre ? 'Modifier le livre' : 'Ajouter un livre'}
          onClose={() => setModalOpen(false)}
        >
          <LivreForm
            initialValue={editingLivre}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            submitting={submitting}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Supprimer le livre"
          message={`Voulez-vous vraiment supprimer "${deleteTarget.titre}" ?`}
          confirmLabel="Supprimer"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
