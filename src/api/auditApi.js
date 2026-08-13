import axiosClient from './axiosClient'

export const auditApi = {
  getForRecord: (module, recordId) => axiosClient.get('/audit', { params: { module, recordId } }).then((r) => r.data),
  getByModule: (module) => axiosClient.get('/audit', { params: { module } }).then((r) => r.data),
  getRecent: () => axiosClient.get('/audit').then((r) => r.data),
}
