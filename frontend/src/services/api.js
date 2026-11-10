import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
const REQUEST_TIMEOUT_MS = 15000
const SESSION_REQUEST_TIMEOUT_MS = 30000
export const SESSION_EXPIRED_EVENT = 'fashionstore:session-expired'
let csrfToken = null
let csrfTokenRequest = null
let refreshRequest = null

export const hasSessionHint = () => (
  typeof document !== 'undefined'
  && document.cookie.split('; ').some((cookie) => cookie.startsWith('SESSION_HINT=1'))
)

if (typeof window !== 'undefined') {
  window.localStorage.removeItem('access_token')
  window.localStorage.removeItem('refresh_token')
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const getCsrfToken = () => {
  if (!csrfTokenRequest) {
    csrfTokenRequest = axios.get(`${API_BASE_URL}/auth/csrf/`, {
      timeout: SESSION_REQUEST_TIMEOUT_MS,
      withCredentials: true,
    }).then(({ data }) => {
      csrfToken = data.csrfToken
      return csrfToken
    }).finally(() => {
      csrfTokenRequest = null
    })
  }

  return csrfTokenRequest
}

api.interceptors.request.use(async (config) => {
  if (!['get', 'head', 'options'].includes((config.method || 'get').toLowerCase())) {
    config.headers['X-CSRF-Token'] = csrfToken || await getCsrfToken()
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthRequest = /\/auth\/(login|refresh|logout|csrf)\/?$/.test(originalRequest?.url || '')
    if (
      error.response?.status === 401
      && hasSessionHint()
      && originalRequest
      && !originalRequest._retry
      && !isAuthRequest
    ) {
      originalRequest._retry = true
      try {
        if (!refreshRequest) {
          refreshRequest = api.post('/auth/refresh/', {}, {
            timeout: SESSION_REQUEST_TIMEOUT_MS,
          }).finally(() => {
            refreshRequest = null
          })
        }
        await refreshRequest
        return api(originalRequest)
      } catch (refreshError) {
        csrfToken = null
        if (refreshError.response?.status === 401 && typeof window !== 'undefined') {
          window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api