<script setup lang="ts">
import { ref } from 'vue'
import type { QrGeoData } from '~/types/content'
import { MapPin, Navigation, Tag } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrGeoData
  errors?: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrGeoData): void
}>()

const isLocating = ref(false)
const locateError = ref('')

const updateField = <K extends keyof QrGeoData>(key: K, value: QrGeoData[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const getCurrentLocation = () => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    locateError.value = 'La géolocalisation n’est pas supportée par votre navigateur.'
    return
  }

  isLocating.value = true
  locateError.value = ''

  navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocating.value = false
      emit('update:modelValue', {
        ...props.modelValue,
        latitude: parseFloat(position.coords.latitude.toFixed(6)),
        longitude: parseFloat(position.coords.longitude.toFixed(6))
      })
    },
    (err) => {
      isLocating.value = false
      locateError.value = 'Impossible de récupérer votre position : ' + err.message
    },
    { timeout: 10000 }
  )
}
</script>

<template>
  <div class="geo-form">
    <!-- Barre de géolocalisation rapide -->
    <div class="location-action-bar">
      <button
        type="button"
        class="geo-btn"
        :disabled="isLocating"
        @click="getCurrentLocation"
      >
        <Navigation :size="15" aria-hidden="true" />
        <span>{{ isLocating ? 'Détection en cours...' : 'Utiliser ma position actuelle' }}</span>
      </button>
      <p v-if="locateError" class="error-message" role="alert">
        {{ locateError }}
      </p>
    </div>

    <!-- Coordonnées Latitude & Longitude -->
    <div class="form-row">
      <div class="form-group flex-1">
        <label for="geo-lat" class="form-label">
          <MapPin :size="15" aria-hidden="true" />
          <span>Latitude (-90 à +90) *</span>
        </label>
        <input
          id="geo-lat"
          type="number"
          step="any"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.latitude }"
          :value="props.modelValue.latitude"
          placeholder="ex: 48.8584"
          @input="updateField('latitude', parseFloat(($event.target as HTMLInputElement).value) || 0)"
        />
        <p v-if="props.errors?.latitude" class="error-message" role="alert">
          {{ props.errors.latitude }}
        </p>
      </div>

      <div class="form-group flex-1">
        <label for="geo-lng" class="form-label">
          <MapPin :size="15" aria-hidden="true" />
          <span>Longitude (-180 à +180) *</span>
        </label>
        <input
          id="geo-lng"
          type="number"
          step="any"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.longitude }"
          :value="props.modelValue.longitude"
          placeholder="ex: 2.2945"
          @input="updateField('longitude', parseFloat(($event.target as HTMLInputElement).value) || 0)"
        />
        <p v-if="props.errors?.longitude" class="error-message" role="alert">
          {{ props.errors.longitude }}
        </p>
      </div>
    </div>

    <!-- Libellé du lieu -->
    <div class="form-group">
      <label for="geo-query" class="form-label">
        <Tag :size="15" aria-hidden="true" />
        <span>Nom ou étiquette du lieu (optionnel)</span>
      </label>
      <input
        id="geo-query"
        type="text"
        class="form-control"
        :value="props.modelValue.query ?? ''"
        placeholder="ex: Tour Eiffel, Entrée Sud..."
        @input="updateField('query', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.geo-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.location-action-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.geo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.6rem 1rem;
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.geo-btn:hover:not(:disabled) {
  background-color: var(--color-bg);
  border-color: var(--color-primary);
}

.geo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-row {
  display: flex;
  gap: var(--space-3);
}

.flex-1 {
  flex: 1;
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
