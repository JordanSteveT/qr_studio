<script setup lang="ts">
import type { QrCustomData } from '~/types/content'
import { Code } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrCustomData
  error?: string | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrCustomData): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', {
    ...props.modelValue,
    rawPayload: target.value
  })
}
</script>

<template>
  <div class="form-group">
    <label for="custom-payload" class="form-label">
      <Code :size="16" aria-hidden="true" />
      <span>Données brutes personnalisées (Payload brut)</span>
    </label>
    <textarea
      id="custom-payload"
      class="form-control"
      :class="{ 'has-error': !!props.error }"
      :value="props.modelValue.rawPayload"
      rows="6"
      placeholder="Saisissez n'importe quelle charge utile brute (JSON, chaîne binaire, schéma d'application personnalisé...)"
      @input="handleInput"
    ></textarea>
    <div class="meta-row">
      <p v-if="props.error" class="error-message" role="alert">
        {{ props.error }}
      </p>
      <span class="char-count">{{ props.modelValue.rawPayload.length }} octets</span>
    </div>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-family: var(--font-mono);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  resize: vertical;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-control.has-error {
  border-color: var(--color-danger);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.error-message {
  color: var(--color-danger);
  font-weight: 600;
  margin: 0;
}

.char-count {
  color: var(--color-text-muted);
  margin-left: auto;
}
</style>
