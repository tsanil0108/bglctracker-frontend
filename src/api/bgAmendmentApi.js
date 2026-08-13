import axiosClient from './axiosClient'

export const bgAmendmentApi = {
  add: (bgId, payload) => axiosClient.post(`/bg/${bgId}/amendments`, payload).then((r) => r.data),
  getByBgId: (bgId) => axiosClient.get(`/bg/${bgId}/amendments`).then((r) => r.data),
}
