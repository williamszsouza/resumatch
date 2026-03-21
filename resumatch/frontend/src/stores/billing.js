import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api.js'

export const useBillingStore = defineStore('billing', () => {
  const plans          = ref([])
  const subscription   = ref(null)
  const transactions   = ref([])
  const loadingPlans   = ref(false)
  const loadingSub     = ref(false)
  const loadingTx      = ref(false)

  async function fetchPlans() {
    loadingPlans.value = true
    try { plans.value = await api.get('/plans') }
    finally { loadingPlans.value = false }
  }

  async function fetchSubscription() {
    loadingSub.value = true
    try { subscription.value = await api.get('/subscriptions/current') }
    finally { loadingSub.value = false }
  }

  async function subscribe(planId) {
    const data = await api.post('/subscriptions', { plan_id: planId })
    subscription.value = data
    return data
  }

  async function fetchTransactions() {
    loadingTx.value = true
    try { transactions.value = await api.get('/transactions') }
    finally { loadingTx.value = false }
  }

  return { plans, subscription, transactions, loadingPlans, loadingSub, loadingTx,
           fetchPlans, fetchSubscription, subscribe, fetchTransactions }
})
