import axiosClient from './axiosClient'

export const fdLinkApi = {
  create: (payload) => axiosClient.post('/fd-links', payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/fd-links/${id}`).then((r) => r.data),
  getByFd: (fdId) => axiosClient.get(`/fd-links/by-fd/${fdId}`).then((r) => r.data),
  getByBg: (bgId) => axiosClient.get(`/fd-links/by-bg/${bgId}`).then((r) => r.data),
  getByLc: (lcId) => axiosClient.get(`/fd-links/by-lc/${lcId}`).then((r) => r.data),
}
