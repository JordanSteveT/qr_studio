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

const handleCoordinateInput = (key: 'latitude' | 'longitude', rawValue: string) => {
  // Ne pas forcer 0 pendant que l'utilisateur efface ou saisit un signe '-'
  const trimmed = rawValue.trim()
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') {
    return
  }
  const parsed = Number(trimmed)
  if (Number.isFinite(parsed)) {
    updateField(key, parsed)
  }
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
          @input="handleCoordinateInput('latitude', ($event.target as HTMLInputElement).value)"
        >
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
          @input="handleCoordinateInput('longitude', ($event.target as HTMLInputElement).value)"
        >
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
      >
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
  padding: 0.6rem 1.1rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border-hover);
  border-radius: 999px;
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.geo-btn:hover:not(:disabled) {
  background-color: #d9f24a;
  color: #1a1523;
  border-color: #1a1523;
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
