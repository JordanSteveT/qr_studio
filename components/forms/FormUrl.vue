<script setup lang="ts">
import type { QrUrlData } from '~/types/content'
import { Link2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrUrlData
  error?: string | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrUrlData): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', {
    ...props.modelValue,
    url: target.value
  })
}
</script>

<template>
  <div class="form-group">
    <label for="qr-url-input" class="form-label">
      <Link2 :size="16" aria-hidden="true" />
      <span>Adresse du site web (URL)</span>
    </label>
    <div class="input-wrapper">
      <input
        id="qr-url-input"
        type="text"
        class="form-control"
        :class="{ 'has-error': !!props.error }"
        :value="props.modelValue.url"
        placeholder="https://exemple.fr ou votresite.com"
        autocomplete="url"
        @input="handleInput"
      />
    </div>
    <p v-if="props.error" class="error-message" role="alert">
      {{ props.error }}
    </p>
    <p v-else class="form-hint">
      Saisissez une URL complète ou un nom de domaine. Le protocole sécurisé https:// sera ajouté automatiquement si omis.
    </p>
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

.input-wrapper {
  position: relative;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
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

.form-control.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-message {
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 600;
  margin: 0;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
