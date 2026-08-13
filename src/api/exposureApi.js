import axiosClient from './axiosClient'

export const exposureApi = {
  getBankWise: () => axiosClient.get('/exposure/bank-wise').then((r) => r.data),
  getClientWise: () => axiosClient.get('/exposure/client-wise').then((r) => r.data),
}
