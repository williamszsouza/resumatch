<template>
  <AppHeader />

  <main>
    <!-- Hero -->
    <div class="hero">
      <p class="hero-eyebrow">Análise de compatibilidade</p>
      <h1 class="hero-title">
        Seu currículo<br /><em>encontra</em> a vaga certa.
      </h1>
      <p class="hero-sub">
        Envie seu currículo em PDF e a descrição da vaga. Nossa IA faz a análise
        ATS completa e mostra onde você se encaixa — e onde pode melhorar.
      </p>
    </div>

    <div class="deco-line" />

    <!-- Upload row -->
    <div class="upload-grid">
      <UploadZone
        ref="cvZone"
        icon="📄"
        label="Passo 1"
        title="Currículo em PDF"
        hint="Arraste ou clique para selecionar o arquivo"
        @file-selected="onCvSelected"
      />

      <div class="static-card">
        <div class="card-icon">💼</div>
        <p class="card-label">Passo 2</p>
        <p class="card-title-text">Descrição da Vaga</p>
        <p class="card-hint">Cole o texto abaixo</p>
      </div>
    </div>

    <!-- Job description -->
    <div class="field-wrap">
      <label class="field-label" for="jd">Descrição completa da vaga</label>
      <textarea
        id="jd"
        v-model="jobDescription"
        placeholder="Cole aqui o título, requisitos, responsabilidades e qualquer informação sobre a posição..."
      />
    </div>

    <!-- Error -->
    <Transition name="fade">
      <div v-if="error" class="error-box">⚠ {{ error }}</div>
    </Transition>

    <!-- Submit -->
    <button class="btn-analyze" :disabled="loading" @click="runAnalysis">
      <span class="btn-dot" />
      <span v-if="!loading">Analisar compatibilidade</span>
      <span v-else>Analisando…</span>
    </button>

    <!-- Loading steps -->
    <LoadingSteps :visible="loading" :current-step="currentStep" />

    <!-- Results -->
    <AnalysisResults :result="result" @reset="reset" />
  </main>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader      from '@/components/AppHeader.vue'
import UploadZone     from '@/components/UploadZone.vue'
import LoadingSteps   from '@/components/LoadingSteps.vue'
import AnalysisResults from '@/components/AnalysisResults.vue'
import { analyzeResume } from '@/services/api.js'

// ── State ─────────────────────────────────────────────────────────────────────
const cvBase64      = ref(null)
const jobDescription = ref('')
const loading       = ref(false)
const currentStep   = ref(1)
const error         = ref('')
const result        = ref(null)
const cvZone        = ref(null)

// ── Handlers ──────────────────────────────────────────────────────────────────
function onCvSelected({ base64 }) {
  cvBase64.value = base64
}

async function runAnalysis() {
  error.value  = ''
  result.value = null

  if (!cvBase64.value)         return (error.value = 'Selecione um currículo em PDF.')
  if (!jobDescription.value.trim()) return (error.value = 'Cole a descrição da vaga.')

  loading.value     = true
  currentStep.value = 1

  // Simulated step progression while awaiting the response
  const timers = [
    setTimeout(() => { currentStep.value = 2 }, 1200),
    setTimeout(() => { currentStep.value = 3 }, 2800),
    setTimeout(() => { currentStep.value = 4 }, 4500)
  ]

  try {
    const data = await analyzeResume(cvBase64.value, jobDescription.value)
    timers.forEach(clearTimeout)
    currentStep.value = 4
    await delay(500)
    result.value = data
  } catch (err) {
    timers.forEach(clearTimeout)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function reset() {
  result.value       = null
  cvBase64.value     = null
  jobDescription.value = ''
  error.value        = ''
  cvZone.value?.reset()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}
</script>

<style scoped>
main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

/* Hero */
.hero { margin-bottom: 4rem; }

.hero-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--emerald);
  margin-bottom: 1rem;
}

.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: clamp(2.4rem, 5vw, 3.8rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  max-width: 600px;
}

.hero-title em {
  font-style: italic;
  color: var(--emerald);
}

.hero-sub {
  margin-top: 1.2rem;
  color: var(--muted);
  font-size: 1rem;
  max-width: 480px;
  line-height: 1.7;
}

.deco-line {
  width: 40px;
  height: 3px;
  background: var(--emerald-bright);
  border-radius: 2px;
  margin-bottom: 2.5rem;
}

/* Upload row */
.upload-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.static-card {
  border: 1.5px dashed var(--paper-dark);
  border-radius: var(--radius-md);
  padding: 2rem;
  background: rgba(255,255,255,0.4);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--paper-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.card-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.3rem;
}

.card-title-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.card-hint { font-size: 0.8rem; color: var(--muted); }

/* Job description */
.field-wrap { margin-bottom: 2rem; }

.field-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.6rem;
}

textarea {
  width: 100%;
  min-height: 180px;
  padding: 1.2rem 1.4rem;
  background: rgba(255,255,255,0.5);
  border: 1.5px solid var(--paper-dark);
  border-radius: var(--radius-md);
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.9rem;
  color: var(--ink);
  resize: vertical;
  transition: border-color 0.2s;
  line-height: 1.65;
}

textarea::placeholder { color: var(--muted); opacity: 0.6; }
textarea:focus { outline: none; border-color: var(--emerald); }

/* Error */
.error-box {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  background: var(--crimson-pale);
  border: 1px solid rgba(192, 57, 43, 0.2);
  border-radius: 10px;
  color: var(--crimson);
  font-size: 0.875rem;
}

/* Button */
.btn-analyze {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.1rem 2.5rem;
  background: var(--ink);
  color: var(--paper);
  border: none;
  border-radius: 10px;
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  letter-spacing: 0.01em;
}

.btn-analyze:hover:not(:disabled) {
  background: var(--emerald);
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(26, 122, 74, 0.25);
}

.btn-analyze:disabled { opacity: 0.45; cursor: not-allowed; }

.btn-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--emerald-bright);
  flex-shrink: 0;
}

.btn-analyze:hover:not(:disabled) .btn-dot { background: var(--paper); }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 680px) {
  main { padding: 2.5rem 1.25rem; }
  .upload-grid { grid-template-columns: 1fr; }
}
</style>
