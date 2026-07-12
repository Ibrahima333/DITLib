import { livresClient } from './client'

export const livresApi = {
  getAll: () => livresClient.get('/livres').then((res) => res.data),

  getById: (id) => livresClient.get(`/livres/${id}`).then((res) => res.data),

  search: (query) =>
    livresClient.get('/livres', { params: { q: query } }).then((res) => res.data),

  create: (livre) => livresClient.post('/livres', livre).then((res) => res.data),

  update: (id, livre) =>
    livresClient.put(`/livres/${id}`, livre).then((res) => res.data),

  remove: (id) => livresClient.delete(`/livres/${id}`).then((res) => res.data),
}
