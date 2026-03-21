<template>
  <Transition name="fade">
    <div v-if="message" :class="['alert', `alert--${type}`]">
      <span>{{ icon }}</span> {{ message }}
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ message: String, type: { default: 'error' } })
const icon = computed(() => ({ error: '⚠', success: '✓', info: 'ℹ' }[props.type] || '⚠'))
</script>

<style scoped>
.alert { padding: .85rem 1.1rem; border-radius: var(--radius-sm); font-size: .875rem; display: flex; align-items: center; gap: .5rem; }
.alert--error   { background: var(--crimson-pale); color: var(--crimson); border: 1px solid rgba(192,57,43,.2); }
.alert--success { background: var(--emerald-pale); color: var(--emerald); border: 1px solid rgba(26,122,74,.2); }
.alert--info    { background: var(--amber-pale);   color: var(--amber);   border: 1px solid rgba(201,123,42,.2); }
.fade-enter-active, .fade-leave-active { transition: opacity .3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
