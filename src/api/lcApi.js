import axiosClient from './axiosClient'


export const lcApi = {

  getAll: (
    status
  ) =>

    axiosClient
      .get(
        '/lc',
        {
          params:
            status
              ? {
                  status,
                }
              : undefined,
        }
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
        `/lc/${id}`
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
        '/lc',
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
        `/lc/${id}`,
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
        `/lc/${id}`
      )
      .then(
        (response) =>
          response.data
      ),
}