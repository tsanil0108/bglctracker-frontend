import axiosClient from './axiosClient'


export const documentApi = {

  // =========================================================
  // LIST
  // GET /api/documents?entityType=BG&entityId=3
  // =========================================================

  list: (
    entityType,
    entityId
  ) =>

    axiosClient
      .get(
        '/documents',
        {
          params: {
            entityType,
            entityId,
          },
        }
      )
      .then(
        (response) =>
          response.data
      ),


  // =========================================================
  // UPLOAD
  // POST /api/documents
  // =========================================================

  upload: (
    entityType,
    entityId,
    documentType,
    file,
    remarks = ''
  ) => {

    const formData =
      new FormData()


    formData.append(
      'entityType',
      entityType
    )


    formData.append(
      'entityId',
      String(entityId)
    )


    formData.append(
      'documentType',
      documentType
    )


    if (
      remarks &&
      remarks.trim()
    ) {

      formData.append(
        'remarks',
        remarks.trim()
      )
    }


    formData.append(
      'file',
      file
    )


    return axiosClient
      .post(
        '/documents',
        formData
      )
      .then(
        (response) =>
          response.data
      )
  },


  // =========================================================
  // VIEW
  // GET /api/documents/{id}/view
  // =========================================================

  view: (
    id
  ) =>

    axiosClient
      .get(
        `/documents/${id}/view`,
        {
          responseType:
            'blob',
        }
      )
      .then(
        (response) => ({
          blob:
            response.data,

          contentType:
            response.headers[
              'content-type'
            ],
        })
      ),


  // =========================================================
  // DOWNLOAD
  // GET /api/documents/{id}/download
  // =========================================================

  download: (
    id
  ) =>

    axiosClient
      .get(
        `/documents/${id}/download`,
        {
          responseType:
            'blob',
        }
      )
      .then(
        (response) => ({
          blob:
            response.data,

          contentType:
            response.headers[
              'content-type'
            ],
        })
      ),


  // =========================================================
  // DELETE
  // =========================================================

  remove: (
    id
  ) =>

    axiosClient
      .delete(
        `/documents/${id}`
      )
}