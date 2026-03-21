<template>
  <div class="billing">
    <div class="section-header">
      <h2 class="section-title">Assinatura & Faturamento</h2>
      <p class="section-sub">Gerencie seu plano e veja o histórico de pagamentos.</p>
    </div>

    <!-- Current plan card -->
    <div class="plan-current-card">
      <div v-if="billing.loadingSub" class="skeleton-row">
        <div class="skeleton" style="width:120px;height:18px" />
        <div class="skeleton" style="width:80px;height:24px" />
      </div>
      <template v-else-if="billing.subscription">
        <div class="plan-current-top">
          <div>
            <p class="plan-current-label">Plano atual</p>
            <p class="plan-current-name">{{ billing.subscription.plan?.name || 'Desconhecido' }}</p>
          </div>
          <span class="status-badge" :class="`status-${billing.subscription.status}`">
            {{ statusLabel(billing.subscription.status) }}
          </span>
        </div>
        <div class="plan-current-details">
          <div class="detail-item">
            <span class="detail-label">Valor</span>
            <span class="detail-value">{{ formatCurrency(billing.subscription.plan?.price) }}/mês</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Gateway</span>
            <span class="detail-value">{{ billing.subscription.gateway_reference || '—' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="detail-value">{{ billing.subscription.status }}</span>
          </div>
        </div>
        <BaseButton variant="ghost" style="margin-top:1.25rem" @click="showPlanModal = true">
          Alterar plano
        </BaseButton>
      </template>
      <div v-else class="no-sub">
        <p>Você não tem uma assinatura ativa.</p>
        <BaseButton variant="emerald" style="margin-top:1rem" @click="showPlanModal = true">Assinar um plano</BaseButton>
      </div>
    </div>

    <!-- Transactions -->
    <div class="section-header" style="margin-top:2.5rem">
      <h3 class="subsection-title">Histórico de faturas</h3>
    </div>

    <div v-if="billing.loadingTx" class="skeleton-table">
      <div v-for="i in 3" :key="i" class="skeleton" style="height:44px;margin-bottom:4px" />
    </div>

    <div v-else-if="billing.transactions.length === 0" class="empty-state">
      Nenhuma transação encontrada.
    </div>

    <div v-else class="table-wrap">
      <table class="tx-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Gateway</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tx in billing.transactions" :key="tx.id">
            <td class="mono">{{ formatDate(tx.created_at) }}</td>
            <td class="mono">{{ formatCurrency(tx.amount) }}</td>
            <td><span class="tx-badge" :class="`tx-${tx.status}`">{{ tx.status }}</span></td>
            <td class="muted">{{ tx.gateway_name }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Plan change modal -->
    <BaseModal v-model="showPlanModal" title="Alterar plano" width="620px">
      <div v-if="billing.loadingPlans" class="modal-loading">Carregando planos…</div>
      <div v-else class="modal-plans-grid">
        <div
          v-for="plan in billing.plans"
          :key="plan.id"
          class="modal-plan-card"
          :class="{ selected: newPlanId === plan.id, current: billing.subscription?.plan_id === plan.id }"
          @click="newPlanId = plan.id"
        >
          <p class="plan-name">{{ plan.name }}</p>
          <p class="plan-price-sm">R$ {{ plan.price === 0 ? '0' : (plan.price / 100).toFixed(0) }}<span>/mês</span></p>
          <p class="plan-desc-sm">{{ plan.description }}</p>
          <span v-if="billing.subscription?.plan_id === plan.id" class="current-label">Atual</span>
        </div>
      </div>

      <AlertMessage :message="planError" type="error" />

      <template #footer>
        <BaseButton variant="ghost" @click="showPlanModal = false">Cancelar</BaseButton>
        <BaseButton variant="primary" :loading="changingPlan" @click="changePlan">Confirmar alteração</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBillingStore } from '@/stores/billing.js'
import BaseButton   from '@/components/ui/BaseButton.vue'
import BaseModal    from '@/components/ui/BaseModal.vue'
import AlertMessage from '@/components/ui/AlertMessage.vue'

const billing = useBillingStore()

const showPlanModal = ref(false)
const newPlanId     = ref(null)
const changingPlan  = ref(false)
const planError     = ref('')

onMounted(async () => {
  await Promise.all([billing.fetchSubscription(), billing.fetchTransactions(), billing.fetchPlans()])
})

async function changePlan() {
  if (!newPlanId.value) { planError.value = 'Selecione um plano.'; return }
  changingPlan.value = true; planError.value = ''
  try {
    await billing.subscribe(newPlanId.value)
    showPlanModal.value = false
  } catch (e) {
    planError.value = e.message
  } finally { changingPlan.value = false }
}

function statusLabel(s) {
  return { active: 'Ativa', cancelled: 'Cancelada', expired: 'Vencida', pending: 'Pendente' }[s] || s
}

function formatCurrency(cents) {
  if (cents == null) return '—'
  if (cents === 0) return 'Grátis'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}
</script>

<style scoped>
.billing { }
.section-header { margin-bottom: 1.25rem; }
.section-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; }
.section-sub    { color: var(--muted); font-size: 0.875rem; margin-top: 0.25rem; }
.subsection-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 600; }

.plan-current-card { background: rgba(255,255,255,0.55); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; }
.plan-current-top  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.25rem; }
.plan-current-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); margin-bottom: 0.25rem; }
.plan-current-name  { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 600; }
.plan-current-details { display: flex; gap: 2rem; }
.detail-item { display: flex; flex-direction: column; gap: 0.2rem; }
.detail-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
.detail-value { font-size: 0.9rem; font-weight: 500; }

.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.7rem; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.06em; }
.status-active    { background: var(--emerald-pale); color: var(--emerald); }
.status-cancelled { background: var(--crimson-pale); color: var(--crimson); }
.status-expired   { background: var(--amber-pale);   color: var(--amber); }
.status-pending   { background: var(--paper-mid);    color: var(--muted); }

.skeleton-row  { display: flex; justify-content: space-between; align-items: center; }
.skeleton      { background: var(--paper-mid); border-radius: 4px; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

.no-sub     { text-align: center; padding: 1rem 0; color: var(--muted); }
.empty-state { padding: 2rem; text-align: center; color: var(--muted); font-size: 0.875rem; border: 1px dashed var(--paper-dark); border-radius: var(--radius-md); }

.table-wrap { overflow-x: auto; }
.tx-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.tx-table th { text-align: left; padding: 0.6rem 1rem; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); border-bottom: 1px solid var(--border); }
.tx-table td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border); }
.tx-table tr:last-child td { border-bottom: none; }
.tx-table tr:hover td { background: rgba(255,255,255,0.4); }
.mono  { font-family: 'DM Mono', monospace; font-size: 0.82rem; }
.muted { color: var(--muted); }
.tx-badge { font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; }
.tx-paid     { background: var(--emerald-pale); color: var(--emerald); }
.tx-pending  { background: var(--amber-pale);   color: var(--amber); }
.tx-failed   { background: var(--crimson-pale); color: var(--crimson); }
.tx-refunded { background: var(--paper-mid);    color: var(--muted); }

.modal-loading    { padding: 1rem; text-align: center; color: var(--muted); }
.modal-plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; }
.modal-plan-card  { position: relative; padding: 1rem; border: 1.5px solid var(--paper-dark); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s; }
.modal-plan-card:hover   { border-color: var(--emerald); }
.modal-plan-card.selected { border-color: var(--emerald); background: var(--emerald-pale); }
.modal-plan-card.current  { border-color: var(--paper-dark); opacity: 0.6; cursor: default; }
.plan-name { font-size: 0.8rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.4rem; }
.plan-price-sm { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; }
.plan-price-sm span { font-family: 'Instrument Sans', sans-serif; font-size: 0.75rem; color: var(--muted); font-weight: 400; }
.plan-desc-sm  { font-size: 0.75rem; color: var(--muted); margin-top: 0.35rem; line-height: 1.4; }
.current-label { position: absolute; top: 0.5rem; right: 0.5rem; font-size: 0.62rem; font-weight: 600; background: var(--paper-dark); color: var(--muted); padding: 2px 7px; border-radius: 100px; }
</style>
