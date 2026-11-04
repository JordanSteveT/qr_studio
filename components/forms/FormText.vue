<script setup lang="ts">
import type { QrTextData } from '~/types/content'
import { AlignLeft } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrTextData
  error?: string | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrTextData): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', {
    ...props.modelValue,
    text: target.value
  })
}
</script>

<template>
  <div class="form-group">
    <label for="qr-text-input" class="form-label">
      <AlignLeft :size="16" aria-hidden="true" />
      <span>Texte libre</span>
    </label>
    <textarea
      id="qr-text-input"
      class="form-control"
      :class="{ 'has-error': !!props.error }"
      :value="props.modelValue.text"
      rows="5"
      placeholder="Saisissez votre texte, note, citation ou mot de passe ici..."
      @input="handleInput"
    ></textarea>
    <div class="meta-row">
      <p v-if="props.error" class="error-message" role="alert">
        {{ props.error }}
      </p>
      <span class="char-count">{{ props.modelValue.text.length }} caractères</span>
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
  font-size: 0.95rem;
  font-family: inherit;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  resize: vertical;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.form-control.has-error {
  border-color: #ef4444;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.error-message {
  color: #ef4444;
  margin: 0;
}

.char-count {
  color: var(--color-text-muted);
  margin-left: auto;
}
</style>
