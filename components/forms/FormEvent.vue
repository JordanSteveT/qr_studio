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
        placeholder="ex: Conférence Tech, Mariage de Sophie & Marc..."
        @input="updateField('title', ($event.target as HTMLInputElement).value)"
      />
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
      />
    </div>

    <!-- Toute la journée -->
    <div class="checkbox-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          class="checkbox-input"
          :checked="props.modelValue.allDay"
          @change="updateField('allDay', ($event.target as HTMLInputElement).checked)"
        />
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
          :value="props.modelValue.startDate"
          @input="updateField('startDate', ($event.target as HTMLInputElement).value)"
        />
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
          :value="props.modelValue.endDate"
          @input="updateField('endDate', ($event.target as HTMLInputElement).value)"
        />
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
      ></textarea>
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
  font-size: 0.825rem;
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

.checkbox-group {
  margin: var(--space-1) 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.error-message {
  font-size: 0.8rem;
  color: #ef4444;
  margin: 0;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    gap: var(--space-3);
  }
}
</style>
