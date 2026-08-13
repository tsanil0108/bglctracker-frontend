import axiosClient from './axiosClient'

export const documentApi = {
  list: (entityType, entityId) =>
    axiosClient.get('/documents', { params: { entityType, entityId } }).then((r) => r.data),
  upload: (entityType, entityId, documentType, file, remarks) => {
    const formData = new FormData()
    formData.append('entityType', entityType)
    formData.append('entityId', entityId)
    formData.append('documentType', documentType)
    if (remarks) formData.append('remarks', remarks)
    formData.append('file', file)
    return axiosClient
      .post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data)
  },
  download: (id) =>
    axiosClient.get(`/documents/${id}/download`, { responseType: 'blob' }).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/documents/${id}`).then((r) => r.data),
}