<template>
  <Transition name="fade">
    <div v-if="message" class="alert" :class="`alert-${type}`">
      <span class="icon">{{ icons[type] }}</span>
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup>
defineProps({ message: String, type: { default: 'error' } })
const icons = { error: '⚠', success: '✓', info: 'ℹ' }
</script>

<style scoped>
.alert {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.9rem 1.1rem; border-radius: 10px; font-size: 0.875rem; margin-bottom: 1.25rem;
}
.alert-error   { background: var(--crimson-pale); color: var(--crimson); border: 1px solid rgba(192,57,43,0.2); }
.alert-success { background: var(--emerald-pale); color: var(--emerald); border: 1px solid rgba(26,122,74,0.2); }
.alert-info    { background: var(--amber-pale);   color: var(--amber);   border: 1px solid rgba(201,123,42,0.2); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
