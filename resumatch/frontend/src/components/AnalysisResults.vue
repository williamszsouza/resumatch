<template>
  <Transition name="fade-up">
    <section v-if="result" class="results">

      <!-- Header -->
      <div class="results-header">
        <h2 class="results-title">Resultado da análise</h2>
        <span class="timestamp">{{ timestamp }}</span>
      </div>

      <!-- Score hero -->
      <div class="score-section">
        <ScoreRing :score="result.score" :verdict="result.verdict" />

        <div class="score-info">
          <span class="verdict-badge" :class="`verdict-${result.verdict}`">
            ● {{ verdictLabel }}
          </span>
          <p class="score-info-title">{{ result.title }}</p>
          <p class="score-summary">{{ result.summary }}</p>
        </div>
      </div>

      <!-- Score breakdown bars -->
      <div v-if="result.scores" class="analysis-card">
        <div class="card-header">
          <span class="card-icon">📊</span>
          <span class="card-title-label">Pontuação detalhada</span>
        </div>
        <div class="score-bars">
          <div
            v-for="(val, key) in result.scores"
            :key="key"
            class="score-bar-item"
          >
            <div class="bar-header">
              <span class="bar-name">{{ formatKey(key) }}</span>
              <span class="bar-val">{{ val }}%</span>
            </div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{
                  width: animated ? val + '%' : '0%',
                  background: barColor(val)
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Keywords grid -->
      <div class="analysis-grid">
        <div v-if="result.matching_keywords?.length" class="analysis-card">
          <div class="card-header">
            <span class="card-icon">✓</span>
            <span class="card-title-label">Palavras-chave encontradas</span>
          </div>
          <div class="tag-list">
            <span
              v-for="kw in result.matching_keywords"
              :key="kw"
              class="tag tag-match"
            >{{ kw }}</span>
          </div>
        </div>

        <div v-if="result.missing_keywords?.length" class="analysis-card">
          <div class="card-header">
            <span class="card-icon">✗</span>
            <span class="card-title-label">Palavras-chave ausentes</span>
          </div>
          <div class="tag-list">
            <span
              v-for="kw in result.missing_keywords"
              :key="kw"
              class="tag tag-miss"
            >{{ kw }}</span>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div v-if="result.suggestions?.length" class="analysis-card">
        <div class="card-header">
          <span class="card-icon">💡</span>
          <span class="card-title-label">Sugestões de melhoria</span>
        </div>
        <div class="suggestion-list">
          <div
            v-for="(s, i) in result.suggestions"
            :key="i"
            class="suggestion-item"
          >
            <div class="suggestion-bullet">{{ i + 1 }}</div>
            <span>{{ s }}</span>
          </div>
        </div>
      </div>

      <!-- Reset -->
      <button class="btn-reset" @click="$emit('reset')">↩ Nova análise</button>
    </section>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import ScoreRing from './ScoreRing.vue'

const props = defineProps({
  result: { type: Object, default: null }
})

defineEmits(['reset'])

const animated  = ref(false)
const timestamp = ref('')

watch(() => props.result, (val) => {
  if (!val) { animated.value = false; return }
  timestamp.value = new Date().toLocaleString('pt-BR', {
    dateStyle: 'short', timeStyle: 'short'
  })
  // Trigger bar animations after paint
  requestAnimationFrame(() => requestAnimationFrame(() => {
    animated.value = true
  }))
})

const verdictLabel = computed(() => {
  const map = { alto: 'Alta compatibilidade', medio: 'Compatibilidade média', baixo: 'Baixa compatibilidade' }
  return map[props.result?.verdict] ?? ''
})

function formatKey(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function barColor(val) {
  if (val >= 70) return '#1a7a4a'
  if (val >= 45) return '#c97b2a'
  return '#c0392b'
}
</script>

<style scoped>
.results { margin-top: 3rem; }

.results-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid var(--border);
}

.results-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem;
  font-weight: 700;
}

.timestamp {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  color: var(--muted);
}

/* Score hero */
.score-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.score-info { }

.verdict-badge {
  display: inline-block;
  padding: 0.25rem 0.8rem;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.7rem;
}

.verdict-alto  { background: var(--emerald-pale); color: var(--emerald); }
.verdict-medio { background: var(--amber-pale);   color: var(--amber); }
.verdict-baixo { background: var(--crimson-pale); color: var(--crimson); }

.score-info-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.score-summary {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.7;
  max-width: 440px;
}

/* Cards */
.analysis-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  background: rgba(255,255,255,0.5);
  margin-bottom: 1.25rem;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}

.analysis-grid .analysis-card { margin-bottom: 0; }

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}

.card-icon { font-size: 1rem; }

.card-title-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

/* Score bars */
.score-bars { display: flex; flex-direction: column; gap: 0.9rem; }

.score-bar-item { }

.bar-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.4rem;
}

.bar-name { font-size: 0.82rem; font-weight: 500; }
.bar-val  { font-family: 'DM Mono', monospace; font-size: 0.78rem; color: var(--muted); }

.bar-track {
  height: 6px;
  background: var(--paper-mid);
  border-radius: 100px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 100px;
  width: 0%;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tags */
.tag-list { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.tag {
  font-size: 0.76rem;
  padding: 0.25rem 0.7rem;
  border-radius: 100px;
  font-family: 'DM Mono', monospace;
}

.tag-match { background: var(--emerald-pale); color: var(--emerald); }
.tag-miss  { background: var(--crimson-pale); color: var(--crimson); }

/* Suggestions */
.suggestion-list { display: flex; flex-direction: column; gap: 0.6rem; }

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  font-size: 0.875rem;
  line-height: 1.55;
}

.suggestion-bullet {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--emerald-pale);
  color: var(--emerald);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Reset */
.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.4rem;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'Instrument Sans', sans-serif;
  font-size: 0.82rem;
  color: var(--muted);
  cursor: pointer;
  margin-top: 0.75rem;
  transition: border-color 0.2s, color 0.2s;
}

.btn-reset:hover { border-color: var(--ink); color: var(--ink); }

/* Transition */
.fade-up-enter-active { animation: fadeUp 0.5s ease forwards; }
.fade-up-leave-active { transition: opacity 0.2s; }
.fade-up-leave-to    { opacity: 0; }

@media (max-width: 640px) {
  .score-section   { grid-template-columns: 1fr; text-align: center; }
  .analysis-grid   { grid-template-columns: 1fr; }
  .score-summary   { max-width: 100%; }
}
</style>
