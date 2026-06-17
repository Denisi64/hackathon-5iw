import axios from 'axios'

const TOKEN_KEY = 'comutitres-access-token'
const REFRESH_KEY = 'comutitres-refresh-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
}
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as axios.InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      const refresh = getRefreshToken()
      if (refresh) {
        try {
          original._retry = true
          const { data } = await axios.post<{ access_token: string }>('/api/auth/refresh', { refresh_token: refresh })
          setTokens(data.access_token, refresh)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          clearTokens()
        }
      }
    }
    return Promise.reject(error)
  },
)
