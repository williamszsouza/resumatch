<template>
  <Teleport to="body">
    <Transition name="ad-fade">
      <div v-if="open" class="ad-overlay">
        <div class="ad-card">

          <!-- Header -->
          <div class="ad-header">
            <span class="ad-eyebrow">Anúncio</span>
            <span class="ad-timer" :class="{ urgent: timeLeft <= 5 }">
              {{ formatTime(timeLeft) }}
            </span>
          </div>

          <!-- Área do vídeo / mock -->
          <div class="ad-video-wrap">
            <div v-if="isMock" class="ad-mock">
              <div class="mock-icon">📺</div>
              <p class="mock-title">
                {{ duration === 60 ? 'Anúncio especial · 1 min' : 'Anúncio · 15 segundos' }}
              </p>
              <p class="mock-sub">Simulação de anúncio — ambiente de teste</p>

              <!-- Barra de progresso do timer -->
              <div class="mock-progress-track">
                <div
                  class="mock-progress-fill"
                  :style="{ width: progressPct + '%' }"
                />
              </div>

              <p class="mock-counter">
                Análise nº {{ analysisCount + 1 }}
                <span v-if="duration === 60"> · anúncio longo (5ª análise)</span>
              </p>
            </div>

            <!-- Slot para vídeo real no futuro -->
            <slot v-else name="video" />
          </div>

          <!-- Footer -->
          <div class="ad-footer">
            <div class="ad-footer-left">
              <span class="ad-plan-hint">
                💡 Faça upgrade para <strong>Pro</strong> e elimine os anúncios.
              </span>
              <RouterLink to="/settings/billing" class="ad-upgrade-link" @click="$emit('close')">
                Ver planos →
              </RouterLink>
            </div>

            <button
              class="ad-skip-btn"
              :disabled="!canSkip"
              :class="{ ready: canSkip }"
              @click="onSkip"
            >
              <span v-if="!canSkip">Aguarde {{ formatTime(timeLeft) }}</span>
              <span v-else>Continuar análise ✓</span>
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { getAnalysisCount } from "../../../resumatch-backend/src/services/adService"

const props = defineProps({
  open:     { type: Boolean, default: false },
  duration: { type: Number,  default: 15 },   // segundos
  isMock:   { type: Boolean, default: true }
})

const emit = defineEmits(['close', 'completed'])

const timeLeft      = ref(props.duration)
const canSkip       = ref(false)
const analysisCount = ref(getAnalysisCount())

let timer = null

const progressPct = computed(() =>
  ((props.duration - timeLeft.value) / props.duration) * 100
)

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m > 0) return `${m}:${String(sec).padStart(2, '0')}`
  return `${sec}s`
}

function startTimer() {
  timeLeft.value = props.duration
  canSkip.value  = false
  clearInterval(timer)

  timer = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timer)
      canSkip.value = true
    }
  }, 1000)
}

function onSkip() {
  if (!canSkip.value) return
  clearInterval(timer)
  emit('completed')
  emit('close')
}

// Inicia timer quando o modal abre
watch(() => props.open, (val) => {
  if (val) {
    analysisCount.value = getAnalysisCount()
    startTimer()
  } else {
    clearInterval(timer)
  }
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.ad-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 23, 16, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.ad-card {
  width: 100%;
  max-width: 520px;
  background: var(--paper);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  overflow: hidden;
}

/* Header */
.ad-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.25rem;
  background: var(--paper-mid);
  border-bottom: 1px solid var(--border);
}

.ad-eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.ad-timer {
  font-family: 'DM Mono', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
  transition: color 0.3s;
}

.ad-timer.urgent { color: var(--crimson); }

/* Mock video area */
.ad-video-wrap {
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ink);
}

.ad-mock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 2rem;
  text-align: center;
  width: 100%;
}

.mock-icon { font-size: 2.5rem; }

.mock-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--paper);
}

.mock-sub {
  font-size: 0.78rem;
  color: rgba(245, 240, 232, 0.45);
  margin-bottom: 0.5rem;
}

.mock-progress-track {
  width: 100%;
  max-width: 320px;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 100px;
  overflow: hidden;
}

.mock-progress-fill {
  height: 100%;
  background: var(--emerald-bright);
  border-radius: 100px;
  transition: width 1s linear;
}

.mock-counter {
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  color: rgba(245, 240, 232, 0.35);
  margin-top: 0.25rem;
}

/* Footer */
.ad-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.ad-footer-left {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.ad-plan-hint {
  font-size: 0.78rem;
  color: var(--muted);
}

.ad-upgrade-link {
  font-size: 0.78rem;
  color: var(--emerald);
  font-weight: 600;
  text-decoration: none;
}
.ad-upgrade-link:hover { text-decoration: underline; }

/* Skip button */
.ad-skip-btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-sm);
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--muted);
  cursor: not-allowed;
  transition: all 0.3s;
  white-space: nowrap;
}

.ad-skip-btn.ready {
  background: var(--ink);
  color: var(--paper);
  border-color: var(--ink);
  cursor: pointer;
}

.ad-skip-btn.ready:hover {
  background: var(--emerald);
  border-color: var(--emerald);
}

/* Transition */
.ad-fade-enter-active, .ad-fade-leave-active { transition: opacity 0.3s; }
.ad-fade-enter-from, .ad-fade-leave-to { opacity: 0; }
</style>