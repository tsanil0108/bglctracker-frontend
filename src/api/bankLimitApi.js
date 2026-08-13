import axiosClient from './axiosClient'

export const bankLimitApi = {
  getAll: () => axiosClient.get('/bank-limits').then((r) => r.data),
  getById: (id) => axiosClient.get(`/bank-limits/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post('/bank-limits', payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/bank-limits/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/bank-limits/${id}`).then((r) => r.data),
  check: (bankId, facilityType, amount) =>
    axiosClient.get(`/bank-limits/check`, { params: { bankId, facilityType, amount } }).then((r) => r.data),
}
