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
        `/fd-links/by-bg/${bgId}`
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
        `/fd-links/by-lc/${lcId}`
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
        `/fd-links/by-fd/${fdId}`
      )
      .then(
        (response) =>
          response.data
      ),
}