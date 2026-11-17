import axios from 'axios'

axios.defaults.withCredentials = true

axios.interceptors.request.use(
  (config) => {
    if (!config.headers.get('Content-Type')) {
      config.headers.set('Content-Type', 'application/json; charset=utf-8')
    }

    if (!config.headers.get('Accept')) {
      config.headers.set('Accept', 'application/json')
    }

    config.timeout = 50000
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    if (response && response.status === 200) {
      return Promise.resolve(response.data)
    }
    return Promise.reject(response)
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    // Normalize rate-limit / CSRF failures so callers can show a stable message.
    if (status === 429 || status === 403) {
      const data = error.response?.data
      if (data && typeof data === 'object' && !('result' in data)) {
        error.response.data = {
          message: data.message || (status === 429 ? 'Too many requests' : 'Forbidden'),
          result: false,
          data: null,
        }
      }
    }
    return Promise.reject(error)
  }
)

export default axios
