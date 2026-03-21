<template>
  <div class="score-ring-wrap">
    <svg width="140" height="140" viewBox="0 0 120 120">
      <circle class="track" cx="60" cy="60" r="54" />
      <circle
        class="fill"
        cx="60" cy="60" r="54"
        :style="{
          stroke: ringColor,
          strokeDashoffset: animatedOffset
        }"
      />
    </svg>
    <div class="center">
      <span class="number" :style="{ color: ringColor }">{{ score }}%</span>
      <span class="label">match</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  score:   { type: Number, default: 0 },
  verdict: { type: String, default: 'baixo' }
})

const circumference = 339.3
const animatedOffset = ref(circumference)

const ringColor = computed(() => {
  if (props.verdict === 'alto')  return '#22c567'
  if (props.verdict === 'medio') return '#c97b2a'
  return '#c0392b'
})

function animateTo(score) {
  const target = circumference - (score / 100) * circumference
  // Defer so CSS transition fires
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { animatedOffset.value = target })
  })
}

onMounted(() => animateTo(props.score))
watch(() => props.score, animateTo)
</script>

<style scoped>
.score-ring-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

svg {
  transform: rotate(-90deg);
}

.track {
  fill: none;
  stroke: var(--paper-mid);
  stroke-width: 8;
}

.fill {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 339.3;
  transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.number {
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1;
  transition: color 0.4s;
}

.label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--muted);
  margin-top: 2px;
}
</style>
