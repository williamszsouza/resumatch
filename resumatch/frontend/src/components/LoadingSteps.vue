<template>
  <Transition name="fade">
    <div v-if="visible" class="loading-wrap">
      <div class="loading-steps">
        <div
          v-for="(step, idx) in steps"
          :key="idx"
          class="loading-step"
          :class="{
            active: currentStep === idx + 1,
            done:   currentStep > idx + 1
          }"
        >
          <div class="step-indicator">
            <span v-if="currentStep > idx + 1">✓</span>
            <span v-else>{{ String(idx + 1).padStart(2, '0') }}</span>
          </div>
          <span>{{ step }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible:     { type: Boolean, default: false },
  currentStep: { type: Number,  default: 1 }
})

const steps = [
  'Lendo e estruturando o currículo PDF…',
  'Extraindo requisitos da vaga…',
  'Cruzando competências e palavras-chave ATS…',
  'Gerando análise e recomendações…'
]
</script>

<style scoped>
.loading-wrap {
  margin-top: 2.5rem;
  padding: 2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.4);
}

.loading-steps {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.loading-step {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  font-size: 0.85rem;
  color: var(--muted);
  opacity: 0.4;
  transition: opacity 0.4s, color 0.4s;
}

.loading-step.active {
  opacity: 1;
  color: var(--ink);
}

.loading-step.done {
  opacity: 0.7;
  color: var(--emerald);
}

.step-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-family: 'DM Mono', monospace;
  flex-shrink: 0;
  transition: border-color 0.3s;
}

.loading-step.active .step-indicator {
  border-color: var(--emerald);
  color: var(--emerald);
  animation: pulse-ring 1.2s ease-in-out infinite;
}

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
