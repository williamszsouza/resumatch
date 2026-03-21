<template>
  <Transition name="slide">
    <div v-if="message" class="alert" :class="`type-${type}`">
      <span class="alert-icon">{{ icons[type] }}</span>
      <span>{{ message }}</span>
      <button class="dismiss" @click="$emit('dismiss')">✕</button>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  message: { type: String, default: '' },
  type:    { type: String, default: 'error' } // error | success | info
})
defineEmits(['dismiss'])

const icons = { error: '⚠', success: '✓', info: 'ℹ' }
</script>

<style scoped>
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.type-error   { background: var(--crimson-pale); color: var(--crimson); border: 1px solid rgba(192,57,43,0.2); }
.type-success { background: var(--emerald-pale); color: var(--emerald); border: 1px solid rgba(34,197,103,0.2); }
.type-info    { background: var(--amber-pale);   color: var(--amber);   border: 1px solid rgba(201,123,42,0.2); }

.alert-icon { font-size: 1rem; flex-shrink: 0; }

span:last-of-type { flex: 1; }

.dismiss {
  background: transparent;
  border: none;
  cursor: pointer;
  color: currentColor;
  opacity: 0.5;
  font-size: 0.7rem;
  padding: 2px 4px;
}
.dismiss:hover { opacity: 1; }

.slide-enter-active, .slide-leave-active { transition: opacity 0.2s, transform 0.2s; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
