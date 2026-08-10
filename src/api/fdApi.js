import axiosClient from './axiosClient'

export const fdApi = {
  getAll: (status) =>
    axiosClient.get('/fd', { params: status ? { status } : {} }).then((r) => r.data),
  getById: (id) => axiosClient.get(`/fd/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post('/fd', payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/fd/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/fd/${id}`).then((r) => r.data),
}
