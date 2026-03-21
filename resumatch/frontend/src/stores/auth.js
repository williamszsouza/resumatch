import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api.js'
import { MOCK_ENABLED, MOCK_USER, MOCK_TOKEN } from '@/services/mock.js'

export const useAuthStore = defineStore('auth', () => {

  const user    = ref(
    MOCK_ENABLED
      ? MOCK_USER
      : JSON.parse(localStorage.getItem('rm_user') || 'null')
  )
  const token   = ref(
    MOCK_ENABLED
      ? MOCK_TOKEN
      : localStorage.getItem('rm_token') || null
  )
  const loading = ref(false)
  const error   = ref('')

  const isLoggedIn  = computed(() => !!token.value)
  const isOnboarded = computed(() => !!user.value?.onboarded)

  function persist() {
    if (MOCK_ENABLED) return
    localStorage.setItem('rm_user',  JSON.stringify(user.value))
    localStorage.setItem('rm_token', token.value)
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  function setSession(data) {
    token.value = data.token
    user.value  = data.user
    persist()
  }

  async function doRegister(name, email, password) {
    loading.value = true
    error.value   = ''
    try {
      if (MOCK_ENABLED) {
        user.value  = { ...MOCK_USER, name, email, onboarded: false }
        token.value = MOCK_TOKEN
        return true
      }
      const data = await api.post('/auth/register', { name, email, password })
      setSession(data)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function doLogin(email, password) {
    loading.value = true
    error.value   = ''
    try {
      if (MOCK_ENABLED) {
        user.value  = MOCK_USER
        token.value = MOCK_TOKEN
        return true
      }
      const data = await api.post('/auth/login', { email, password })
      setSession(data)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    // Com mock ativo, usuário já está carregado — não faz nada
    if (MOCK_ENABLED) return

    // Sem token não tem por que chamar a API
    if (!token.value) return

    try {
      const data = await api.get('/auth/me')
      user.value = data
      persist()
    } catch {
      // ⚠️ NÃO chama logout() aqui — isso causaria loop infinito
      // Apenas limpa silenciosamente se o token for inválido
      user.value  = null
      token.value = null
      localStorage.removeItem('rm_user')
      localStorage.removeItem('rm_token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  async function deleteAccountAction() {
    if (MOCK_ENABLED) { logout(); return }
    await api.delete(`/users/${user.value.uuid}`)
    logout()
  }

  function markOnboarded() {
    user.value = { ...user.value, onboarded: true }
    persist()
  }

  function logout() {
    user.value  = null
    token.value = null
    error.value = ''
    if (!MOCK_ENABLED) {
      localStorage.removeItem('rm_user')
      localStorage.removeItem('rm_token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  if (!MOCK_ENABLED && token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    user, token, loading, error,
    isLoggedIn, isOnboarded,
    doRegister, doLogin, fetchMe, deleteAccountAction, markOnboarded, logout
  }
})