<template>
  <div class="billing-page">
    <h2 class="page-title">Assinatura & Faturas</h2>

    <!-- Plano atual -->
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-label">Plano atual</p>
          <h3 class="plan-name">{{ currentPlanName }}</h3>
        </div>
        <span class="status-badge" :class="`status-${subStatus}`">
          {{ statusLabel }}
        </span>
      </div>

      <div v-if="billing.subscription" class="plan-meta">
        <div class="meta-item">
          <span class="meta-label">Valor</span>
          <span class="meta-val">{{ planPrice }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Gateway</span>
          <span class="meta-val">{{ billing.subscription.gateway_reference || '—' }}</span>
        </div>
      </div>

      <div class="plan-actions">
        <BaseButton variant="ghost" size="sm" @click="openPlanModal">
          ↕ Alterar plano
        </BaseButton>
        <BaseButton
          v-if="billing.subscription?.status === 'active'"
          variant="ghost"
          size="sm"
          :loading="billing.loading"
          @click="showCancelModal = true"
        >
          Cancelar assinatura
        </BaseButton>
      </div>
    </section>

    <!-- Histórico de faturas -->
    <section class="section-card">
      <p class="section-label" style="margin-bottom:1rem;">Histórico de faturas</p>

      <div v-if="billing.txLoading" class="loading-text">Carregando faturas…</div>

      <div v-else-if="!billing.transactions.length" class="empty-text">
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
              <td>{{ formatAmount(tx.amount) }}</td>
              <td>
                <span class="tx-status" :class="`tx-${tx.status}`">
                  {{ txStatusLabel(tx.status) }}
                </span>
              </td>
              <td>{{ tx.gateway_name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal: alterar plano -->
    <BaseModal :open="showPlanModal" title="Alterar plano" width="640px" @close="showPlanModal = false">
      <div class="modal-plans-grid">
        <div
          v-for="plan in plans.plans"
          :key="plan.id"
          class="modal-plan-card"
          :class="{
            selected: modalPlanId === plan.id,
            current:  billing.subscription?.plan_id === plan.id
          }"
          @click="modalPlanId = plan.id"
        >
          <div class="plan-top">
            <p class="plan-name-sm">{{ plan.name }}</p>
            <p class="plan-price-sm">
              {{ Number(plan.price) === 0 ? 'Grátis' : `R$ ${Number(plan.price).toFixed(2)}/mês` }}
            </p>
          </div>
          <ul class="plan-feats">
            <li v-for="f in plan.features" :key="f">✓ {{ f }}</li>
          </ul>
          <span v-if="billing.subscription?.plan_id === plan.id" class="current-tag">Atual</span>
          <div class="radio-wrap">
            <span class="radio" :class="{ checked: modalPlanId === plan.id }" />
          </div>
        </div>
      </div>
      <AlertBanner v-if="modalError" :message="modalError" type="error" @dismiss="modalError = ''" />
      <template #footer>
        <BaseButton variant="ghost" @click="showPlanModal = false">Cancelar</BaseButton>
        <BaseButton :loading="billing.loading" @click="doChangePlan">Confirmar alteração</BaseButton>
      </template>
    </BaseModal>

    <!-- Modal: cancelar assinatura -->
    <BaseModal :open="showCancelModal" title="Cancelar assinatura" @close="showCancelModal = false">
      <p style="color: var(--muted); font-size: 0.9rem; line-height: 1.65;">
        Tem certeza que deseja cancelar? Você continuará com acesso até o fim do período pago.
      </p>
      <AlertBanner v-if="cancelError" :message="cancelError" type="error" @dismiss="cancelError = ''" />
      <template #footer>
        <BaseButton variant="ghost" @click="showCancelModal = false">Manter assinatura</BaseButton>
        <BaseButton variant="danger" :loading="billing.loading" @click="doCancel">Sim, cancelar</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBillingStore } from '@/stores/billing.js'
import { usePlansStore }   from '@/stores/plans.js'
import BaseButton  from '@/components/ui/BaseButton.vue'
import BaseModal   from '@/components/ui/BaseModal.vue'
import AlertBanner from '@/components/ui/AlertBanner.vue'

const billing = useBillingStore()

const plans   = usePlansStore()

const showPlanModal   = ref(false)
const showCancelModal = ref(false)
const modalPlanId     = ref(null)
const modalError      = ref('')
const cancelError     = ref('')

onMounted(async () => {
  await Promise.all([
    billing.fetchSubscription(),
    billing.fetchTransactions(),
    plans.fetchPlans()
  ])
  modalPlanId.value = billing.subscription?.plan_id ?? null
})

const subStatus = computed(() => billing.subscription?.status || 'none')

const statusLabel = computed(() => ({
  active:   'Ativa',
  canceled: 'Cancelada',
  expired:  'Vencida',
  none:     'Sem plano'
}[subStatus.value] || subStatus.value))

const currentPlanName = computed(() => {
  if (!billing.subscription) return 'Nenhum plano ativo'
  const plan = plans.plans.find(p => p.id === billing.subscription.plan_id)
  return plan?.name || `Plano #${billing.subscription.plan_id}`
})

const planPrice = computed(() => {
  const plan = plans.plans.find(p => p.id === billing.subscription?.plan_id)
  if (!plan) return '—'
  return Number(plan.price) === 0 ? 'Grátis' : `R$ ${Number(plan.price).toFixed(2)}/mês`
})

function openPlanModal() {
  modalPlanId.value = billing.subscription?.plan_id ?? null
  modalError.value  = ''
  showPlanModal.value = true
}

async function doChangePlan() {
  modalError.value = ''
  const ok = await plans.patch(modalPlanId.value)
  if (ok) showPlanModal.value = false
  else modalError.value = billing.error || 'Erro ao alterar plano.'
}

async function doCancel() {
  cancelError.value = ''
  const ok = await billing.cancel()
  if (ok) showCancelModal.value = false
  else cancelError.value = billing.error || 'Erro ao cancelar assinatura.'
}

function formatDate(d)    { return new Date(d).toLocaleDateString('pt-BR') }
function formatAmount(v)  { return Number(v) === 0 ? 'Grátis' : `R$ ${Number(v).toFixed(2)}` }
function txStatusLabel(s) {
  return { paid: 'Pago', failed: 'Falhou', pending: 'Pendente', refunded: 'Estornado' }[s] || s
}
</script>

<style scoped>
.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem; font-weight: 700; margin-bottom: 2rem;
}

.section-card {
  border: 1px solid var(--border); border-radius: var(--radius-md);
  padding: 1.5rem; background: rgba(255,255,255,0.5); margin-bottom: 1.5rem;
}

.section-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 1.25rem; gap: 1rem;
}

.section-label {
  font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem; display: block;
}

.plan-name { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; }

.status-badge {
  font-size: 0.72rem; font-weight: 600; padding: 0.3rem 0.8rem;
  border-radius: 100px; letter-spacing: 0.05em; text-transform: uppercase; white-space: nowrap;
}
.status-active   { background: var(--emerald-pale); color: var(--emerald); }
.status-canceled { background: var(--crimson-pale); color: var(--crimson); }
.status-expired  { background: var(--amber-pale);   color: var(--amber); }
.status-none     { background: var(--paper-mid);    color: var(--muted); }

.plan-meta { display: flex; gap: 2rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.meta-item { display: flex; flex-direction: column; gap: 0.2rem; }
.meta-label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; }
.meta-val   { font-size: 0.9rem; font-weight: 500; }
.mono       { font-family: 'DM Mono', monospace; font-size: 0.8rem; }

.plan-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

/* Table */
.table-wrap { overflow-x: auto; }
.tx-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.tx-table th {
  text-align: left; padding: 0.5rem 0.75rem;
  font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--muted); border-bottom: 1px solid var(--border);
}
.tx-table td { padding: 0.75rem; border-bottom: 1px solid var(--border); }
.tx-table tr:last-child td { border-bottom: none; }

.tx-status {
  font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.6rem;
  border-radius: 100px; text-transform: uppercase;
}
.tx-paid     { background: var(--emerald-pale); color: var(--emerald); }
.tx-failed   { background: var(--crimson-pale); color: var(--crimson); }
.tx-pending  { background: var(--amber-pale);   color: var(--amber); }
.tx-refunded { background: var(--paper-mid);    color: var(--muted); }

.loading-text, .empty-text { color: var(--muted); font-size: 0.875rem; padding: 1rem 0; }

/* Modal plans */
.modal-plans-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem; margin-bottom: 1.25rem;
}
.modal-plan-card {
  position: relative; border: 1.5px solid var(--border);
  border-radius: var(--radius-md); padding: 1rem;
  cursor: pointer; transition: border-color 0.2s;
}
.modal-plan-card:hover    { border-color: var(--emerald); }
.modal-plan-card.selected { border-color: var(--emerald); box-shadow: 0 0 0 3px rgba(34,197,103,0.12); }
.plan-top { margin-bottom: 0.6rem; }
.plan-name-sm  { font-weight: 600; font-size: 0.9rem; }
.plan-price-sm { font-size: 0.82rem; color: var(--muted); margin-top: 0.15rem; }
.plan-feats {
  list-style: none; font-size: 0.72rem; color: var(--muted);
  display: flex; flex-direction: column; gap: 0.2rem; margin-bottom: 0.75rem;
}
.current-tag {
  position: absolute; top: 8px; right: 8px;
  font-size: 0.62rem; background: var(--paper-mid); color: var(--muted);
  padding: 0.15rem 0.45rem; border-radius: 100px; font-weight: 600;
}
.radio-wrap { display: flex; justify-content: center; }
.radio {
  width: 16px; height: 16px; border-radius: 50%;
  border: 1.5px solid var(--paper-dark); transition: all 0.2s;
}
.radio.checked { background: var(--emerald); border-color: var(--emerald); box-shadow: inset 0 0 0 3px #fff; }

@media (max-width: 560px) { .modal-plans-grid { grid-template-columns: 1fr; } }
</style>