<template>
  <div
    class="upload-card"
    :class="{ filled: !!fileName, 'drag-over': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
    @click="triggerInput"
  >
    <input
      ref="inputRef"
      type="file"
      accept=".pdf"
      style="display:none"
      @change="onFileChange"
    />

    <div class="card-icon">{{ filled ? '✓' : icon }}</div>
    <p class="card-label">{{ label }}</p>
    <p class="card-title">{{ title }}</p>
    <p class="card-hint">{{ filled ? 'Clique para trocar o arquivo' : hint }}</p>
    <p v-if="fileName" class="card-file-name">{{ fileName }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  icon: { type: String, default: '📄' },
  label: { type: String, required: true },
  title: { type: String, required: true },
  hint:  { type: String, default: 'Arraste ou clique para selecionar' }
})

const emit = defineEmits(['file-selected'])

const inputRef  = ref(null)
const fileName  = ref('')
const isDragging = ref(false)
const filled = computed(() => !!fileName.value)

function triggerInput() {
  inputRef.value?.click()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) processFile(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file && file.type === 'application/pdf') processFile(file)
}

function processFile(file) {
  fileName.value = file.name
  const reader = new FileReader()
  reader.onload = () => {
    const base64 = reader.result.split(',')[1]
    emit('file-selected', { file, base64 })
  }
  reader.readAsDataURL(file)
}

function reset() {
  fileName.value = ''
  if (inputRef.value) inputRef.value.value = ''
}

defineExpose({ reset })
</script>

<style scoped>
.upload-card {
  border: 1.5px dashed var(--paper-dark);
  border-radius: var(--radius-md);
  padding: 2rem;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s;
  user-select: none;
}

.upload-card:hover,
.upload-card.drag-over {
  border-color: var(--emerald);
  background: rgba(34, 197, 103, 0.04);
}

.upload-card.filled {
  border-style: solid;
  border-color: var(--emerald);
  background: rgba(34, 197, 103, 0.05);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--paper-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  transition: background 0.25s;
}

.upload-card.filled .card-icon {
  background: var(--emerald-pale);
}

.card-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 0.3rem;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
}

.card-hint {
  font-size: 0.8rem;
  color: var(--muted);
}

.card-file-name {
  margin-top: 0.8rem;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: var(--emerald);
}
</style>
