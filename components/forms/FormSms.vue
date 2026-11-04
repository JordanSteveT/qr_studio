<script setup lang="ts">
import type { QrSmsData } from '~/types/content'
import { MessageSquare, Phone, AlignLeft } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrSmsData
  errors?: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrSmsData): void
}>()

const updateField = <K extends keyof QrSmsData>(key: K, value: QrSmsData[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <div class="sms-form">
    <div class="form-group">
      <label for="sms-phone" class="form-label">
        <Phone :size="16" aria-hidden="true" />
        <span>Numéro de mobile du destinataire *</span>
      </label>
      <input
        id="sms-phone"
        type="tel"
        class="form-control"
        :class="{ 'has-error': !!props.errors?.phoneNumber }"
        :value="props.modelValue.phoneNumber"
        placeholder="+33 6 12 34 56 78"
        autocomplete="tel"
        @input="updateField('phoneNumber', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="props.errors?.phoneNumber" class="error-message" role="alert">
        {{ props.errors.phoneNumber }}
      </p>
    </div>

    <div class="form-group">
      <label for="sms-message" class="form-label">
        <MessageSquare :size="16" aria-hidden="true" />
        <span>Message pré-rempli</span>
      </label>
      <textarea
        id="sms-message"
        class="form-control"
        rows="3"
        :value="props.modelValue.message ?? ''"
        placeholder="Texte du SMS..."
        @input="updateField('message', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.sms-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
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
</style>
