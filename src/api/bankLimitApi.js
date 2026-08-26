import axiosClient from './axiosClient'


export const bankLimitApi = {

  getAll: () =>

    axiosClient
      .get(
        '/bank-limits'
      )
      .then(
        (response) =>
          response.data
      ),


  getById: (
    id
  ) =>

    axiosClient
      .get(
        `/bank-limits/${id}`
      )
      .then(
        (response) =>
          response.data
      ),


  create: (
    payload
  ) =>

    axiosClient
      .post(
        '/bank-limits',
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
        `/bank-limits/${id}`,
        payload
      )
      .then(
        (response) =>
          response.data
      ),


  remove: (
    id
  ) =>

    axiosClient
      .delete(
        `/bank-limits/${id}`
      )
      .then(
        (response) =>
          response.data
      ),
}