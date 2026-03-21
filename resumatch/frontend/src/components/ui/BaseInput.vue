<template>
  <div class="field">
    <label v-if="label" :for="id" class="field-label">{{ label }}</label>
    <input
      :id="id"
      v-bind="$attrs"
      :type="type"
      :value="modelValue"
      :class="['field-input', { 'field-input--error': error }]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="field-error">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: String, label: String, type: { default: 'text' },
  modelValue: String, error: String
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.field { display: flex; flex-direction: column; gap: .4rem; }
.field-label { font-size: .72rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.field-input {
  padding: .75rem 1rem; background: rgba(255,255,255,.5);
  border: 1.5px solid var(--paper-dark); border-radius: var(--radius-sm);
  font-family: 'Instrument Sans', sans-serif; font-size: .9rem; color: var(--ink);
  transition: border-color .2s; width: 100%;
}
.field-input:focus { outline: none; border-color: var(--emerald); }
.field-input--error { border-color: var(--crimson); }
.field-error { font-size: .75rem; color: var(--crimson); }
</style>
