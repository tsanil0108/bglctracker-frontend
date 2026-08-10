import axiosClient from './axiosClient'

export const bgApi = {
  getAll: (status) =>
    axiosClient.get('/bg', { params: status ? { status } : {} }).then((r) => r.data),
  getById: (id) => axiosClient.get(`/bg/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post('/bg', payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/bg/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/bg/${id}`).then((r) => r.data),
}
