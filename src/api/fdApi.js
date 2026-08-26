import axiosClient from './axiosClient'


export const fdApi = {

  getAll: (
    status
  ) =>

    axiosClient
      .get(
        '/fd',
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
        `/fd/${id}`
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
        '/fd',
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
        `/fd/${id}`,
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
        `/fd/${id}`
      )
      .then(
        (response) =>
          response.data
      ),
}