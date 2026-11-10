<script setup lang="ts">
import type { QrEventData } from '~/types/content'
import { Calendar, MapPin, AlignLeft, Clock } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrEventData
  errors?: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrEventData): void
}>()

const updateField = <K extends keyof QrEventData>(key: K, value: QrEventData[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const toggleAllDay = (allDay: boolean) => {
  const formatForMode = (dateStr: string, defaultTime: string): string => {
    const dateOnly = dateStr.split('T')[0] || '2026-11-15'
    return allDay ? dateOnly : (dateStr.includes('T') ? dateStr.slice(0, 16) : `${dateOnly}T${defaultTime}`)
  }

  emit('update:modelValue', {
    ...props.modelValue,
    allDay,
    startDate: formatForMode(props.modelValue.startDate, '09:00'),
    endDate: formatForMode(props.modelValue.endDate, '18:00')
  })
}
</script>

<template>
  <div class="event-form">
    <!-- Titre de l'événement -->
    <div class="form-group">
      <label for="event-title" class="form-label">
        <Calendar :size="16" aria-hidden="true" />
        <span>Titre de l’événement *</span>
      </label>
      <input
        id="event-title"
        type="text"
        class="form-control"
        :class="{ 'has-error': !!props.errors?.title }"
        :value="props.modelValue.title"
        placeholder="ex: Conférence Tech, Atelier créatif..."
        @input="updateField('title', ($event.target as HTMLInputElement).value)"
      >
      <p v-if="props.errors?.title" class="error-message" role="alert">
        {{ props.errors.title }}
      </p>
    </div>

    <!-- Lieu de l'événement -->
    <div class="form-group">
      <label for="event-location" class="form-label">
        <MapPin :size="16" aria-hidden="true" />
        <span>Lieu ou lien de visioconférence</span>
      </label>
      <input
        id="event-location"
        type="text"
        class="form-control"
        :value="props.modelValue.location ?? ''"
        placeholder="ex: 10 rue de la Paix, Paris ou https://meet.google.com/..."
        @input="updateField('location', ($event.target as HTMLInputElement).value)"
      >
    </div>

    <!-- Toute la journée -->
    <div class="checkbox-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          class="checkbox-input"
          :checked="props.modelValue.allDay"
          @change="toggleAllDay(($event.target as HTMLInputElement).checked)"
        >
        <span>Événement sur toute la journée (sans heure précise)</span>
      </label>
    </div>

    <!-- Dates début & fin -->
    <div class="form-row">
      <div class="form-group flex-1">
        <label for="event-start" class="form-label">
          <Clock :size="15" aria-hidden="true" />
          <span>Début *</span>
        </label>
        <input
          id="event-start"
          :type="props.modelValue.allDay ? 'date' : 'datetime-local'"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.startDate }"
          :value="props.modelValue.allDay ? props.modelValue.startDate.split('T')[0] : props.modelValue.startDate.slice(0, 16)"
          @input="updateField('startDate', ($event.target as HTMLInputElement).value)"
        >
        <p v-if="props.errors?.startDate" class="error-message" role="alert">
          {{ props.errors.startDate }}
        </p>
      </div>

      <div class="form-group flex-1">
        <label for="event-end" class="form-label">
          <Clock :size="15" aria-hidden="true" />
          <span>Fin *</span>
        </label>
        <input
          id="event-end"
          :type="props.modelValue.allDay ? 'date' : 'datetime-local'"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.endDate }"
          :value="props.modelValue.allDay ? props.modelValue.endDate.split('T')[0] : props.modelValue.endDate.slice(0, 16)"
          @input="updateField('endDate', ($event.target as HTMLInputElement).value)"
        >
        <p v-if="props.errors?.endDate" class="error-message" role="alert">
          {{ props.errors.endDate }}
        </p>
      </div>
    </div>

    <!-- Description -->
    <div class="form-group">
      <label for="event-desc" class="form-label">
        <AlignLeft :size="16" aria-hidden="true" />
        <span>Description détaillée</span>
      </label>
      <textarea
        id="event-desc"
        class="form-control"
        rows="3"
        :value="props.modelValue.description ?? ''"
        placeholder="Ordre du jour, informations pratiques..."
        @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.event-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.form-row {
  display: flex;
  gap: var(--space-3);
}

.flex-1 {
  flex: 1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--color-text);
}

.form-control {
  width: 100%;
  padding: 0.72rem 0.95rem;
  font-size: 0.94rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: all var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-control.has-error {
  border-color: var(--color-danger);
}

.checkbox-group {
  margin: var(--space-1) 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: #1a1523;
  cursor: pointer;
}

.dark .checkbox-input {
  accent-color: #d9f24a;
}

.error-message {
  font-size: 0.8rem;
  color: var(--color-danger);
  font-weight: 600;
  margin: 0;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: var(--space-3);
  }
}
</style>
