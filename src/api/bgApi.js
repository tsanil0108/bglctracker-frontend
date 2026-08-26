import axiosClient from './axiosClient'


export const bgApi = {

  getAll: (
    status
  ) =>

    axiosClient
      .get(
        '/bg',
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
        `/bg/${id}`
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
        '/bg',
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
        `/bg/${id}`,
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
        `/bg/${id}`
      )
      .then(
        (response) =>
          response.data
      ),
}