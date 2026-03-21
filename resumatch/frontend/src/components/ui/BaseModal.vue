<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" @click.self="$emit('close')">
        <div class="modal" :style="{ maxWidth: width }">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="close-btn" @click="$emit('close')">✕</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  open:  { type: Boolean, default: false },
  title: { type: String,  default: '' },
  width: { type: String,  default: '480px' }
})

defineEmits(['close'])
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(26,23,16,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: var(--paper);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  width: 100%;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 700;
}

.close-btn {
  width: 28px; height: 28px;
  border: none; background: var(--paper-mid);
  border-radius: 50%; cursor: pointer;
  font-size: 0.7rem; color: var(--muted);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.close-btn:hover { background: var(--paper-dark); }

.modal-body { padding: 1.5rem; }

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s, transform 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>