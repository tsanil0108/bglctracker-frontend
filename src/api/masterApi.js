import axiosClient from './axiosClient'

function makeCrud(resourcePath) {
  return {
    getAll: () => axiosClient.get(resourcePath).then((r) => r.data),
    getById: (id) => axiosClient.get(`${resourcePath}/${id}`).then((r) => r.data),
    create: (payload) => axiosClient.post(resourcePath, payload).then((r) => r.data),
    update: (id, payload) => axiosClient.put(`${resourcePath}/${id}`, payload).then((r) => r.data),
    remove: (id) => axiosClient.delete(`${resourcePath}/${id}`).then((r) => r.data),
  }
}

export const groupCompanyApi = makeCrud('/master/group-companies')
export const bankApi = makeCrud('/master/banks')
export const clientApi = makeCrud('/master/clients')
export const vendorApi = makeCrud('/master/vendors')
export const guaranteeTypeApi = makeCrud('/master/guarantee-types')
