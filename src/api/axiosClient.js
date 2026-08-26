import axios from 'axios'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  '/api'

const axiosClient =
  axios.create({
    baseURL: BASE_URL,
  })


axiosClient.interceptors.request.use(
  (config) => {

    const token =
      localStorage.getItem(
        'bglc_token'
      )

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`
    }


    /*
     * IMPORTANT:
     *
     * FormData upload ke time
     * Content-Type manually set nahi karna.
     *
     * Browser automatically:
     * multipart/form-data; boundary=...
     * set karega.
     */
    if (
      config.data instanceof FormData
    ) {

      delete config.headers[
        'Content-Type'
      ]

    } else {

      config.headers[
        'Content-Type'
      ] =
        'application/json'
    }


    return config
  },

  (error) =>
    Promise.reject(error)
)


axiosClient.interceptors.response.use(

  (response) =>
    response,

  (error) => {

    if (
      error?.response?.status ===
      401
    ) {

      localStorage.removeItem(
        'bglc_token'
      )

      localStorage.removeItem(
        'bglc_user'
      )


      if (
        !window.location.pathname
          .startsWith('/login')
      ) {

        window.location.href =
          '/login'
      }
    }


    return Promise.reject(
      error
    )
  }
)


export function extractErrorMessage(
  err,
  fallback = 'Something went wrong.'
) {

  const data =
    err?.response?.data


  if (!data) {
    return fallback
  }


  if (
    data.fieldErrors &&
    Object.keys(
      data.fieldErrors
    ).length
  ) {

    return Object.values(
      data.fieldErrors
    )[0]
  }


  return (
    data.message ||
    data.error ||
    fallback
  )
}


export default axiosClient