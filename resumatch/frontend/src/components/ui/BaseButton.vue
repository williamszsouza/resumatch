<template>
  <button :class="['btn', `btn--${variant}`, { 'btn--loading': loading }]" :disabled="disabled || loading" v-bind="$attrs">
    <span v-if="loading" class="btn-spinner" />
    <slot v-else />
  </button>
</template>

<script setup>
defineProps({
  variant: { default: 'primary' },
  loading: Boolean,
  disabled: Boolean
})
</script>

<style scoped>
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  padding: .85rem 1.8rem; border-radius: var(--radius-sm); border: none;
  font-family: 'Instrument Sans', sans-serif; font-size: .9rem; font-weight: 600;
  cursor: pointer; transition: all .2s; white-space: nowrap;
}
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn--primary { background: var(--ink); color: var(--paper); }
.btn--primary:hover:not(:disabled) { background: var(--emerald); transform: translateY(-1px); box-shadow: 0 6px 24px rgba(26,122,74,.25); }
.btn--ghost { background: transparent; color: var(--ink); border: 1.5px solid var(--border); }
.btn--ghost:hover:not(:disabled) { border-color: var(--ink); }
.btn--danger { background: var(--crimson-pale); color: var(--crimson); border: 1.5px solid rgba(192,57,43,.2); }
.btn--danger:hover:not(:disabled) { background: var(--crimson); color: #fff; }
.btn-spinner {
  width: 16px; height: 16px; border: 2px solid transparent;
  border-top-color: currentColor; border-radius: 50%; animation: spin .7s linear infinite;
}
</style>
