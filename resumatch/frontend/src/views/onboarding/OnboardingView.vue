<template>
  <div class="onboarding-page">
    <div class="onboarding-card">

      <!-- Progress bar -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: step === 1 ? '50%' : '100%' }" />
      </div>

      <!-- Step indicator -->
      <div class="step-header">
        <div class="step-pills">
          <span class="step-pill" :class="{ active: step >= 1, done: step > 1 }">
            {{ step > 1 ? '✓' : '1' }}
          </span>
          <span class="step-connector" />
          <span class="step-pill" :class="{ active: step >= 2 }">2</span>
        </div>
        <p class="step-label">Passo {{ step }} de 2</p>
      </div>

      <Transition name="slide-fade" mode="out-in">

        <!-- ── Step 1: Perfil ── -->
        <div v-if="step === 1" key="step1" class="step-body">
          <h2 class="step-title">Conte-nos sobre você</h2>
          <p class="step-sub">Isso nos ajuda a personalizar a experiência.</p>

          <AlertBanner v-if="saveError" :message="saveError" type="error" @dismiss="saveError = ''" />

          <div class="form-grid">
            <BaseInput v-model="profile.company" label="Nome da empresa (opcional)" placeholder="Ex: Acme Corp" />

            <div class="field">
              <label class="field-label">Objetivo de uso</label>
              <select v-model="profile.goal" class="base-select">
                <option value="">Selecione...</option>
                <option value="job_search">Busca por emprego</option>
                <option value="hr_team">Time de RH / Recrutamento</option>
                <option value="freelancer">Trabalho freelancer</option>
                <option value="other">Outro</option>
              </select>
              <p v-if="errors.goal" class="field-error">{{ errors.goal }}</p>
            </div>

            <BaseInput v-model="profile.role" label="Cargo atual" placeholder="Ex: Engenheiro de Software" />
          </div>

          <div class="step-actions">
            <BaseButton size="lg" :loading="saving" style="width:100%;" @click="nextStep">
              Continuar →
            </BaseButton>
          </div>
        </div>

        <!-- ── Step 2: Plano ── -->
        <div v-else key="step2" class="step-body">
          <h2 class="step-title">Escolha seu plano</h2>
          <p class="step-sub">Comece gratuitamente. Faça upgrade quando quiser.</p>

          <div v-if="plans.loading" class="plans-loading">Carregando planos…</div>

          <div v-else class="plans-grid">
            <div
              v-for="plan in plans.plans"
              :key="plan.id"
              class="plan-card"
              :class="{ selected: selectedPlanId === plan.id, popular: plan.popular }"
              @click="selectedPlanId = plan.id"
            >
              <span v-if="plan.popular" class="popular-badge">Mais popular</span>
              <div class="plan-header">
                <p class="plan-name">{{ plan.name }}</p>
                <p class="plan-price">
                  <span v-if="plan.price == 0 || plan.price === '0.00'">Grátis</span>
                  <span v-else>R$&nbsp;<strong>{{ Number(plan.price).toFixed(2) }}</strong>/mês</span>
                </p>
              </div>
              <p class="plan-desc">{{ plan.description }}</p>
              <ul class="plan-features">
                <li v-for="f in plan.features" :key="f">
                  <span class="feat-check">✓</span> {{ f }}
                </li>
              </ul>
              <div class="plan-selector">
                <span class="radio" :class="{ checked: selectedPlanId === plan.id }" />
              </div>
            </div>
          </div>

          <AlertBanner v-if="subscribeError" :message="subscribeError" type="error" @dismiss="subscribeError = ''" />

          <div class="step2-actions">
            <BaseButton variant="ghost" @click="step = 1">← Voltar</BaseButton>
            <BaseButton size="lg" :loading="billing.loading" @click="confirmPlan">
              Começar agora
            </BaseButton>
          </div>
        </div>

      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter }       from 'vue-router'
import { usePlansStore }   from '@/stores/plans.js'
import { useBillingStore } from '@/stores/billing.js'
import { useAuthStore }    from '@/stores/auth.js'
import { updateProfile }   from '@/services/api.js'
import BaseInput           from '@/components/ui/BaseInput.vue'
import BaseButton          from '@/components/ui/BaseButton.vue'
import AlertBanner         from '@/components/ui/AlertBanner.vue'

const router  = useRouter()
const plans   = usePlansStore()
const billing = useBillingStore()
const auth    = useAuthStore()

const step           = ref(1)
const errors         = reactive({ goal: '' })
const selectedPlanId = ref(null)
const saving         = ref(false)
const saveError      = ref('')
const subscribeError = ref('')

const profile = reactive({ company: '', goal: '', role: '' })

onMounted(() => plans.fetchPlans())

async function nextStep() {
  errors.goal = profile.goal ? '' : 'Selecione um objetivo.'
  if (errors.goal) return

  saving.value   = true
  saveError.value = ''
  try {
    if (auth.user?.uuid) {
      await updateProfile(auth.user.uuid, {
        company_name: profile.company,
        role:         profile.role
      })
    }
  } catch (e) {
    saveError.value = e.message
  } finally {
    saving.value = false
  }

  step.value = 2
  if (!selectedPlanId.value && plans.plans.length) {
    selectedPlanId.value = plans.plans[0].id
  }
}

async function confirmPlan() {
  if (!selectedPlanId.value) return
  subscribeError.value = ''
  const ok = await billing.subscribe(selectedPlanId.value)
  if (ok) {
    auth.markOnboarded()
    router.push('/')
  } else {
    subscribeError.value = billing.error || 'Erro ao selecionar plano.'
  }
}
</script>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.onboarding-card {
  width: 100%;
  max-width: 680px;
  background: rgba(255,255,255,0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.progress-bar { height: 3px; background: var(--paper-dark); }
.progress-fill {
  height: 100%;
  background: var(--emerald-bright);
  border-radius: 0 2px 2px 0;
  transition: width 0.4s ease;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem 0;
  margin-bottom: 1.5rem;
}

.step-pills { display: flex; align-items: center; gap: 0.5rem; }

.step-pill {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1.5px solid var(--paper-dark);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-family: 'DM Mono', monospace;
  color: var(--muted); transition: all 0.3s;
}
.step-pill.active { border-color: var(--emerald); color: var(--emerald); }
.step-pill.done   { background: var(--emerald); border-color: var(--emerald); color: #fff; }
.step-connector   { width: 32px; height: 1.5px; background: var(--paper-dark); }
.step-label       { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: var(--muted); }

.step-body { padding: 0 2rem 2rem; }

.step-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem; font-weight: 700; margin-bottom: 0.3rem;
}
.step-sub { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }

.form-grid { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }

.field { display: flex; flex-direction: column; gap: 0.4rem; }
.field-label {
  font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted);
}
.field-error { font-size: 0.78rem; color: var(--crimson); }

.base-select {
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.55);
  border: 1.5px solid var(--paper-dark);
  border-radius: 10px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.92rem; color: var(--ink);
}
.base-select:focus { outline: none; border-color: var(--emerald); }

.step-actions { margin-top: 1.5rem; }

/* Plans */
.plans-loading { color: var(--muted); font-size: 0.9rem; padding: 1rem 0 1.5rem; }

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.plan-card {
  position: relative;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: rgba(255,255,255,0.4);
}
.plan-card:hover    { border-color: var(--emerald); }
.plan-card.selected { border-color: var(--emerald); box-shadow: 0 0 0 3px rgba(34,197,103,0.12); }
.plan-card.popular  { border-color: var(--emerald); }

.popular-badge {
  position: absolute; top: -10px; left: 50%; transform: translateX(-50%);
  background: var(--emerald); color: #fff;
  font-size: 0.65rem; font-weight: 600;
  padding: 0.2rem 0.6rem; border-radius: 100px; white-space: nowrap;
}

.plan-name  { font-weight: 600; font-size: 0.9rem; }
.plan-price { font-family: 'Playfair Display', serif; font-size: 1rem; margin-top: 0.2rem; }
.plan-price strong { font-size: 1.3rem; }
.plan-desc  { font-size: 0.75rem; color: var(--muted); margin: 0.5rem 0 0.75rem; }

.plan-features { list-style: none; display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1rem; }
.plan-features li { font-size: 0.78rem; display: flex; gap: 0.4rem; align-items: flex-start; }
.feat-check { color: var(--emerald); font-size: 0.75rem; flex-shrink: 0; margin-top: 1px; }

.plan-selector { display: flex; justify-content: center; }
.radio {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1.5px solid var(--paper-dark); transition: all 0.2s;
}
.radio.checked { background: var(--emerald); border-color: var(--emerald); box-shadow: inset 0 0 0 3px #fff; }

.step2-actions {
  display: flex; justify-content: space-between;
  align-items: center; margin-top: 1.5rem;
}

/* Transition */
.slide-fade-enter-active, .slide-fade-leave-active { transition: opacity 0.25s, transform 0.25s; }
.slide-fade-enter-from { opacity: 0; transform: translateX(20px); }
.slide-fade-leave-to   { opacity: 0; transform: translateX(-20px); }

@media (max-width: 600px) {
  .plans-grid { grid-template-columns: 1fr; }
  .step-body  { padding: 0 1.25rem 1.5rem; }
}
</style>