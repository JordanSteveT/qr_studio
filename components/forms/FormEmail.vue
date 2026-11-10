<script setup lang="ts">
import type { QrEmailData } from '~/types/content'
import { Mail, Tag, AlignLeft } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrEmailData
  errors?: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrEmailData): void
}>()

const updateField = <K extends keyof QrEmailData>(key: K, value: QrEmailData[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <div class="email-form">
    <!-- Adresse destinataire -->
    <div class="form-group">
      <label for="email-to" class="form-label">
        <Mail :size="16" aria-hidden="true" />
        <span>Adresse e-mail du destinataire *</span>
      </label>
      <input
        id="email-to"
        type="email"
        class="form-control"
        :class="{ 'has-error': !!props.errors?.email }"
        :value="props.modelValue.email"
        placeholder="contact@exemple.fr"
        autocomplete="email"
        @input="updateField('email', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="props.errors?.email" class="error-message" role="alert">
        {{ props.errors.email }}
      </p>
    </div>

    <!-- Objet du message -->
    <div class="form-group">
      <label for="email-subject" class="form-label">
        <Tag :size="16" aria-hidden="true" />
        <span>Objet / Sujet du courriel</span>
      </label>
      <input
        id="email-subject"
        type="text"
        class="form-control"
        :value="props.modelValue.subject ?? ''"
        placeholder="Demande de renseignements, Devis..."
        @input="updateField('subject', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Corps du message -->
    <div class="form-group">
      <label for="email-body" class="form-label">
        <AlignLeft :size="16" aria-hidden="true" />
        <span>Corps du message pré-rempli</span>
      </label>
      <textarea
        id="email-body"
        class="form-control"
        rows="4"
        :value="props.modelValue.body ?? ''"
        placeholder="Bonjour, je vous écris afin de..."
        @input="updateField('body', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.email-form {
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

.error-message {
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 600;
  margin: 0;
}
</style>
