<script setup lang="ts">
import type { QrPhoneData } from '~/types/content'
import { Phone } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrPhoneData
  error?: string | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrPhoneData): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', {
    ...props.modelValue,
    phoneNumber: target.value
  })
}
</script>

<template>
  <div class="form-group">
    <label for="phone-number" class="form-label">
      <Phone :size="16" aria-hidden="true" />
      <span>Numéro de téléphone à composer *</span>
    </label>
    <input
      id="phone-number"
      type="tel"
      class="form-control"
      :class="{ 'has-error': !!props.error }"
      :value="props.modelValue.phoneNumber"
      placeholder="ex: +33 1 23 45 67 89"
      autocomplete="tel"
      @input="handleInput"
    />
    <p v-if="props.error" class="error-message" role="alert">
      {{ props.error }}
    </p>
    <p v-else class="form-hint">
      Lors du scan, le smartphone de l'utilisateur ouvrira automatiquement son composeur téléphonique.
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

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
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

.error-message {
  font-size: 0.8rem;
  color: #ef4444;
  margin: 0;
}

.form-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
