import axiosClient from './axiosClient'


export const fdLinkApi = {

  create: (
    payload
  ) =>

    axiosClient
      .post(
        '/fd-links',
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
        `/fd-links/${id}`
      )
      .then(
        (response) =>
          response.data
      ),


  getByBg: (
    bgId
  ) =>

    axiosClient
      .get(
        `/fd-links/bg/${bgId}`
      )
      .then(
        (response) =>
          response.data
      ),


  getByLc: (
    lcId
  ) =>

    axiosClient
      .get(
        `/fd-links/lc/${lcId}`
      )
      .then(
        (response) =>
          response.data
      ),


  getByFd: (
    fdId
  ) =>

    axiosClient
      .get(
        `/fd-links/fd/${fdId}`
      )
      .then(
        (response) =>
          response.data
      ),
}