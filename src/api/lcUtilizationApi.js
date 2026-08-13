import axiosClient from './axiosClient'

export const lcUtilizationApi = {
  create: (lcId, payload) => axiosClient.post(`/lc/${lcId}/utilizations`, payload).then((r) => r.data),
  getByLcId: (lcId) => axiosClient.get(`/lc/${lcId}/utilizations`).then((r) => r.data),
  getSummary: (lcId) => axiosClient.get(`/lc/${lcId}/utilization-summary`).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/lc-utilizations/${id}`).then((r) => r.data),
}
