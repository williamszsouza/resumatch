import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' }
})



// Injeta token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normaliza erros — sem redirect automático no 401
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Erro desconhecido'
    return Promise.reject(new Error(message))
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function analyzeResume(resumeBase64, jobDescription) {
  return api.post('/analyze', {
    resume_pdf_base64: resumeBase64,
    job_description: jobDescription
  })
}
export async function register(name, email, password) {
  return api.post('/auth/register', { name, email, password })
}
export async function login(email, password) {
  return api.post('/auth/login', { email, password })
}
export async function loginWithGoogle(idToken) {
  return api.post('/auth/google', { id_token: idToken })
}
export async function getMe() {
  return api.get('/auth/me')
}
export async function updateProfile(uuid, data) {
  return api.patch(`/users/${uuid}`, data)
}
export async function deleteAccount(uuid) {
  return api.delete(`/users/${uuid}`)
}
export async function getPlans() {
  return api.get('/plans')
}
export async function getMySubscription() {
  return api.get('/subscriptions/me')
}
export async function createSubscription(planId) {
  return api.post('/subscriptions', { plan_id: planId })
}
export async function updateSubscription(planId) {
  return api.patch('/subscriptions/me', { plan_id: planId })
}
export async function cancelSubscription() {
  return api.delete('/subscriptions/me')
}
export async function getTransactions() {
  return api.get('/transactions')
}

export default api
