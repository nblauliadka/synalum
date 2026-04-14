import axios from 'axios'

// In development, Vite proxies /api → http://localhost:5000 automatically.
// Using a relative base URL means no CORS issues and no hard-coded ports in the frontend.
export const api = axios.create({
  baseURL: '/',
  timeout: 10000,
})

export function setApiAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}
