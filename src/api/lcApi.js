import axiosClient from './axiosClient'

export const lcApi = {
  getAll: (status) =>
    axiosClient.get('/lc', { params: status ? { status } : {} }).then((r) => r.data),
  getById: (id) => axiosClient.get(`/lc/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post('/lc', payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/lc/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/lc/${id}`).then((r) => r.data),
}
