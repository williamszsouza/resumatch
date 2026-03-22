<template>
  <div>
    <AppHeader :show-nav="true" />

    <main class="dashboard">
      <div class="dash-hero">
        <p class="eyebrow">Bem-vindo de volta</p>
        <h1 class="dash-title">
          Olá, <em>{{ firstName }}</em> 👋
        </h1>
        <p class="dash-sub">
          Faça upload de um currículo e uma vaga para iniciar a análise ATS.
        </p>
      </div>

      <div class="deco-line" />

      <div class="upload-grid">
        <UploadZone
          ref="cvZone"
          icon="📄"
          label="Passo 1"
          title="Currículo em PDF"
          hint="Arraste ou clique para selecionar"
          @file-selected="onCvSelected"
        />
        <div class="static-card">
          <div class="card-icon">💼</div>
          <p class="card-label">Passo 2</p>
          <p class="card-title-text">Descrição da Vaga</p>
          <p class="card-hint">Cole o texto abaixo</p>
        </div>
      </div>

      <div class="field-wrap">
        <label class="field-label" for="jd">Descrição completa da vaga</label>
        <textarea
          id="jd"
          v-model="jobDescription"
          placeholder="Cole aqui os requisitos, responsabilidades e detalhes da posição…"
        />
      </div>

      <AlertBanner :message="error" type="error" @dismiss="error = ''" />

      <BaseButton size="lg" :loading="loading" @click="runAnalysis">
        <span class="btn-dot" /> Analisar compatibilidade
      </BaseButton>

      <LoadingSteps :visible="loading" :current-step="currentStep" />
      <AnalysisResults :result="result" @reset="reset" />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore }    from '@/stores/auth.js'
import { analyzeResume }   from '@/services/api.js'
import AppHeader           from '@/components/AppHeader.vue'
import UploadZone          from '@/components/UploadZone.vue'
import LoadingSteps        from '@/components/LoadingSteps.vue'
import AnalysisResults     from '@/components/AnalysisResults.vue'
import BaseButton          from '@/components/ui/BaseButton.vue'
import AlertBanner         from '@/components/ui/AlertBanner.vue'

const auth      = useAuthStore()
const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'usuário')

const cvBase64        = ref(null)
const jobDescription  = ref('')
const loading         = ref(false)
const currentStep     = ref(1)
const error           = ref('')
const result          = ref(null)
const cvZone          = ref(null)

function onCvSelected({ base64 }) { cvBase64.value = base64 }

async function runAnalysis() {
  error.value  = ''
  result.value = null
  if (!cvBase64.value)               return (error.value = 'Selecione um currículo em PDF.')
  if (!jobDescription.value.trim())  return (error.value = 'Cole a descrição da vaga.')

  loading.value     = true
  currentStep.value = 1

  const timers = [
    setTimeout(() => { currentStep.value = 2 }, 1200),
    setTimeout(() => { currentStep.value = 3 }, 2800),
    setTimeout(() => { currentStep.value = 4 }, 4500)
  ]
  try {
    const data = await analyzeResume(cvBase64.value, jobDescription.value)
    timers.forEach(clearTimeout)
    currentStep.value = 4
    await new Promise(r => setTimeout(r, 500))
    result.value = data
  } catch (e) {
    timers.forEach(clearTimeout)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value         = null
  cvBase64.value       = null
  jobDescription.value = ''
  error.value          = ''
  cvZone.value?.reset()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.dashboard { max-width: 1100px; margin: 0 auto; padding: 4rem 2rem; }

.eyebrow {
  font-family: 'DM Mono', monospace; font-size: 0.72rem;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--emerald); margin-bottom: 0.75rem;
}
.dash-hero { margin-bottom: 3.5rem; }
.dash-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700; line-height: 1.1; letter-spacing: -0.02em;
}
.dash-title em { font-style: italic; color: var(--emerald); }
.dash-sub { margin-top: 0.9rem; color: var(--muted); font-size: 0.95rem; max-width: 460px; }

.deco-line { width: 40px; height: 3px; background: var(--emerald-bright); border-radius: 2px; margin-bottom: 2.5rem; }

.upload-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
.static-card {
  border: 1.5px dashed var(--paper-dark); border-radius: var(--radius-md);
  padding: 2rem; background: rgba(255,255,255,0.4);
}
.card-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--paper-mid); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; margin-bottom: 1rem; }
.card-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.3rem; }
.card-title-text { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 500; margin-bottom: 0.4rem; }
.card-hint { font-size: 0.8rem; color: var(--muted); }

.field-wrap { margin-bottom: 2rem; }
.field-label { display: block; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.6rem; }
textarea {
  width: 100%; min-height: 180px; padding: 1.2rem 1.4rem;
  background: rgba(255,255,255,0.5); border: 1.5px solid var(--paper-dark);
  border-radius: var(--radius-md); font-family: 'Instrument Sans', sans-serif;
  font-size: 0.9rem; color: var(--ink); resize: vertical;
}
textarea:focus { outline: none; border-color: var(--emerald); }
textarea::placeholder { color: var(--muted); opacity: 0.6; }

.btn-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--emerald-bright); flex-shrink: 0; }

@media (max-width: 680px) {
  .dashboard { padding: 2.5rem 1.25rem; }
  .upload-grid { grid-template-columns: 1fr; }
}
</style>