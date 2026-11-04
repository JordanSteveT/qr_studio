<script setup lang="ts">
import { ref } from 'vue'
import type { QrWifiData, WifiEncryption } from '~/types/content'
import { Wifi, KeyRound, Eye, EyeOff, Shield } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrWifiData
  errors?: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrWifiData): void
}>()

const showPassword = ref(false)

const updateField = <K extends keyof QrWifiData>(key: K, value: QrWifiData[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <div class="wifi-form">
    <!-- Nom du réseau (SSID) -->
    <div class="form-group">
      <label for="wifi-ssid" class="form-label">
        <Wifi :size="16" aria-hidden="true" />
        <span>Nom du réseau Wi-Fi (SSID) *</span>
      </label>
      <input
        id="wifi-ssid"
        type="text"
        class="form-control"
        :class="{ 'has-error': !!props.errors?.ssid }"
        :value="props.modelValue.ssid"
        placeholder="ex: Livebox_A1B2 ou Freebox_Home"
        @input="updateField('ssid', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="props.errors?.ssid" class="error-message" role="alert">
        {{ props.errors.ssid }}
      </p>
    </div>

    <!-- Type de sécurité -->
    <div class="form-group">
      <label for="wifi-security" class="form-label">
        <Shield :size="16" aria-hidden="true" />
        <span>Type de sécurité</span>
      </label>
      <select
        id="wifi-security"
        class="form-control select-control"
        :value="props.modelValue.encryption"
        @change="updateField('encryption', ($event.target as HTMLSelectElement).value as WifiEncryption)"
      >
        <option value="WPA">WPA / WPA2 / WPA3 (Standard recommandé)</option>
        <option value="WEP">WEP (Anciens réseaux)</option>
        <option value="nopass">Aucun mot de passe (Réseau ouvert)</option>
      </select>
    </div>

    <!-- Mot de passe -->
    <div v-if="props.modelValue.encryption !== 'nopass'" class="form-group">
      <label for="wifi-password" class="form-label">
        <KeyRound :size="16" aria-hidden="true" />
        <span>Mot de passe du réseau *</span>
      </label>
      <div class="password-wrapper">
        <input
          id="wifi-password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control password-input"
          :class="{ 'has-error': !!props.errors?.password }"
          :value="props.modelValue.password ?? ''"
          placeholder="Entrez la clé de sécurité Wi-Fi"
          @input="updateField('password', ($event.target as HTMLInputElement).value)"
        />
        <button
          type="button"
          class="toggle-btn"
          :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          @click="showPassword = !showPassword"
        >
          <EyeOff v-if="showPassword" :size="16" aria-hidden="true" />
          <Eye v-else :size="16" aria-hidden="true" />
        </button>
      </div>
      <p v-if="props.errors?.password" class="error-message" role="alert">
        {{ props.errors.password }}
      </p>
    </div>

    <!-- Réseau masqué -->
    <div class="checkbox-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          class="checkbox-input"
          :checked="props.modelValue.hidden"
          @change="updateField('hidden', ($event.target as HTMLInputElement).checked)"
        />
        <span>Réseau masqué (SSID invisible)</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.wifi-form {
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

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 2.75rem;
}

.toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.toggle-btn:hover {
  color: var(--color-text);
}

.checkbox-group {
  margin-top: var(--space-1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.875rem;
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
</style>
