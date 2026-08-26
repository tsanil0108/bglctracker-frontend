import axiosClient from './axiosClient'


function makeCrud(resourcePath) {

  return {

    getAll: () =>
      axiosClient
        .get(resourcePath)
        .then(
          (response) =>
            response.data
        ),


    getById: (id) =>
      axiosClient
        .get(
          `${resourcePath}/${id}`
        )
        .then(
          (response) =>
            response.data
        ),


    create: (payload) =>
      axiosClient
        .post(
          resourcePath,
          payload
        )
        .then(
          (response) =>
            response.data
        ),


    update: (
      id,
      payload
    ) =>
      axiosClient
        .put(
          `${resourcePath}/${id}`,
          payload
        )
        .then(
          (response) =>
            response.data
        ),


    remove: (id) =>
      axiosClient
        .delete(
          `${resourcePath}/${id}`
        )
        .then(
          (response) =>
            response.data
        ),
  }
}


/*
 * GROUP COMPANY
 *
 * Normal CRUD +
 * Connected ledger overview
 */
export const groupCompanyApi = {

  ...makeCrud(
    '/master/group-companies'
  ),

  getOverview: (id) =>
    axiosClient
      .get(
        `/master/group-companies/${id}/overview`
      )
      .then(
        (response) =>
          response.data
      ),
}


/*
 * BANK MASTER
 */
export const bankApi =
  makeCrud(
    '/master/banks'
  )


/*
 * CLIENT MASTER
 */
export const clientApi =
  makeCrud(
    '/master/clients'
  )


/*
 * VENDOR MASTER
 */
export const vendorApi =
  makeCrud(
    '/master/vendors'
  )


/*
 * GUARANTEE TYPE MASTER
 */
export const guaranteeTypeApi =
  makeCrud(
    '/master/guarantee-types'
  )