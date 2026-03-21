import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api.js'
import { useBillingStore } from '@/stores/billing.js' // 1. IMPORTAÇÃO NECESSÁRIA
import { MOCK_ENABLED, MOCK_PLANS } from '@/services/mock.js'

export const usePlansStore = defineStore('plans', () => {
  const plans   = ref([])
  const loading = ref(false)
  const error   = ref('')

  // 2. INICIALIZAÇÃO DA STORE DE BILLING (Sem isso, o patch quebra ao tentar ler 'billing')
  const billing = useBillingStore()

  async function fetchPlans() {
    if (plans.value.length) return
    if (MOCK_ENABLED) { plans.value = MOCK_PLANS; return }

    loading.value = true
    error.value   = ''
    try {
      const data  = await api.get('/plans')
      plans.value = data?.length ? data : MOCK_PLANS
    } catch {
      plans.value = MOCK_PLANS
    } finally {
      loading.value = false
    }
  }

  async function patch(planId) {
    loading.value = true
    error.value = ''
    
    try {
      // O endpoint deve bater com o seu backend: /api/subscriptions/me
      const data = await api.patch('/subscriptions/me', { plan_id: planId })
      
      if (data) {
        // Agora o 'billing' existe e o código não vai travar aqui
        billing.subscription = data
        return true
      }
      return false
    } catch (err) {
      error.value = err.response?.data?.error || 'Erro ao alterar o plano.'
      return false
    } finally {
      loading.value = false
    }
  }

  // Certifique-se de que o nome 'patch' está aqui (está correto!)
  return { plans, loading, error, fetchPlans, patch }
})