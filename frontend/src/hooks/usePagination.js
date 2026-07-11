import { useMemo, useState } from 'react'

const PAGE_SIZE = 10

export function usePagination(items) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, currentPage])

  return { page: currentPage, totalPages, setPage, pageItems, resetPage: () => setPage(1) }
}
