import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bglc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('bglc_token')
      localStorage.removeItem('bglc_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Backend's GlobalExceptionHandler returns { timestamp, status, error }
// or, for @Valid failures, { timestamp, status, error: "Validation failed", fieldErrors: {...} }.
export function extractErrorMessage(err, fallback) {
  const data = err?.response?.data
  if (!data) return fallback
  if (data.fieldErrors && Object.keys(data.fieldErrors).length) {
    return Object.values(data.fieldErrors)[0]
  }
  return data.error || fallback
}

export default axiosClient
