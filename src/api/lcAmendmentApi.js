import axiosClient from './axiosClient'

export const lcAmendmentApi = {
  add: (lcId, payload) => axiosClient.post(`/lc/${lcId}/amendments`, payload).then((r) => r.data),
  getByLcId: (lcId) => axiosClient.get(`/lc/${lcId}/amendments`).then((r) => r.data),
}
