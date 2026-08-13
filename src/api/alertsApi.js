import axiosClient from './axiosClient'

export const alertsApi = {
  getAll: () => axiosClient.get('/alerts').then((r) => r.data),
  getSummary: () => axiosClient.get('/alerts/summary').then((r) => r.data),
}
