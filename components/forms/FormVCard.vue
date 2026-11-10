<script setup lang="ts">
import type { QrVCardData } from '~/types/content'
import { User, Building, Phone, Mail, Globe, MapPin, FileText } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: QrVCardData
  errors?: Record<string, string> | undefined
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: QrVCardData): void
}>()

const updateField = <K extends keyof QrVCardData>(key: K, value: QrVCardData[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <div class="vcard-form">
    <!-- Prénom & Nom -->
    <div class="form-row">
      <div class="form-group flex-1">
        <label for="vcard-firstname" class="form-label">
          <User :size="15" aria-hidden="true" />
          <span>Prénom</span>
        </label>
        <input
          id="vcard-firstname"
          type="text"
          class="form-control"
          :value="props.modelValue.firstName"
          placeholder="Jean"
          autocomplete="given-name"
          @input="updateField('firstName', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="form-group flex-1">
        <label for="vcard-lastname" class="form-label">
          <span>Nom *</span>
        </label>
        <input
          id="vcard-lastname"
          type="text"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.lastName }"
          :value="props.modelValue.lastName"
          placeholder="Dupont"
          autocomplete="family-name"
          @input="updateField('lastName', ($event.target as HTMLInputElement).value)"
        />
        <p v-if="props.errors?.lastName" class="error-message" role="alert">
          {{ props.errors.lastName }}
        </p>
      </div>
    </div>

    <!-- Entreprise & Fonction -->
    <div class="form-row">
      <div class="form-group flex-1">
        <label for="vcard-org" class="form-label">
          <Building :size="15" aria-hidden="true" />
          <span>Entreprise / Organisation</span>
        </label>
        <input
          id="vcard-org"
          type="text"
          class="form-control"
          :value="props.modelValue.organization ?? ''"
          placeholder="Acme Studio"
          @input="updateField('organization', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div class="form-group flex-1">
        <label for="vcard-title" class="form-label">
          <span>Poste / Titre</span>
        </label>
        <input
          id="vcard-title"
          type="text"
          class="form-control"
          :value="props.modelValue.jobTitle ?? ''"
          placeholder="Directeur Artistique"
          @input="updateField('jobTitle', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <!-- Téléphones -->
    <div class="form-row">
      <div class="form-group flex-1">
        <label for="vcard-mobile" class="form-label">
          <Phone :size="15" aria-hidden="true" />
          <span>Téléphone mobile</span>
        </label>
        <input
          id="vcard-mobile"
          type="tel"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.phoneMobile }"
          :value="props.modelValue.phoneMobile ?? ''"
          placeholder="+33 6 12 34 56 78"
          autocomplete="tel"
          @input="updateField('phoneMobile', ($event.target as HTMLInputElement).value)"
        />
        <p v-if="props.errors?.phoneMobile" class="error-message" role="alert">
          {{ props.errors.phoneMobile }}
        </p>
      </div>

      <div class="form-group flex-1">
        <label for="vcard-workphone" class="form-label">
          <span>Téléphone bureau</span>
        </label>
        <input
          id="vcard-workphone"
          type="tel"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.phoneWork }"
          :value="props.modelValue.phoneWork ?? ''"
          placeholder="+33 1 23 45 67 89"
          @input="updateField('phoneWork', ($event.target as HTMLInputElement).value)"
        />
        <p v-if="props.errors?.phoneWork" class="error-message" role="alert">
          {{ props.errors.phoneWork }}
        </p>
      </div>
    </div>

    <!-- E-mail & Site web -->
    <div class="form-row">
      <div class="form-group flex-1">
        <label for="vcard-email" class="form-label">
          <Mail :size="15" aria-hidden="true" />
          <span>Adresse e-mail</span>
        </label>
        <input
          id="vcard-email"
          type="email"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.email }"
          :value="props.modelValue.email ?? ''"
          placeholder="jean.dupont@exemple.fr"
          autocomplete="email"
          @input="updateField('email', ($event.target as HTMLInputElement).value)"
        />
        <p v-if="props.errors?.email" class="error-message" role="alert">
          {{ props.errors.email }}
        </p>
      </div>

      <div class="form-group flex-1">
        <label for="vcard-website" class="form-label">
          <Globe :size="15" aria-hidden="true" />
          <span>Site web</span>
        </label>
        <input
          id="vcard-website"
          type="text"
          class="form-control"
          :class="{ 'has-error': !!props.errors?.website }"
          :value="props.modelValue.website ?? ''"
          placeholder="https://monsite.fr"
          @input="updateField('website', ($event.target as HTMLInputElement).value)"
        />
        <p v-if="props.errors?.website" class="error-message" role="alert">
          {{ props.errors.website }}
        </p>
      </div>
    </div>

    <!-- Adresse postale -->
    <div class="form-group">
      <label for="vcard-street" class="form-label">
        <MapPin :size="15" aria-hidden="true" />
        <span>Adresse postale</span>
      </label>
      <input
        id="vcard-street"
        type="text"
        class="form-control"
        :value="props.modelValue.addressStreet ?? ''"
        placeholder="Numéro et nom de rue"
        @input="updateField('addressStreet', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="form-row">
      <div class="form-group" style="flex: 1;">
        <input
          id="vcard-postal"
          type="text"
          class="form-control"
          :value="props.modelValue.addressPostalCode ?? ''"
          placeholder="Code postal"
          @input="updateField('addressPostalCode', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="form-group" style="flex: 2;">
        <input
          id="vcard-city"
          type="text"
          class="form-control"
          :value="props.modelValue.addressCity ?? ''"
          placeholder="Ville"
          @input="updateField('addressCity', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="form-group" style="flex: 2;">
        <input
          id="vcard-country"
          type="text"
          class="form-control"
          :value="props.modelValue.addressCountry ?? ''"
          placeholder="Pays"
          @input="updateField('addressCountry', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <!-- Note complémentaire -->
    <div class="form-group">
      <label for="vcard-note" class="form-label">
        <FileText :size="15" aria-hidden="true" />
        <span>Note complémentaire</span>
      </label>
      <input
        id="vcard-note"
        type="text"
        class="form-control"
        :value="props.modelValue.note ?? ''"
        placeholder="Informations supplémentaires ou compétences"
        @input="updateField('note', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>

<style scoped>
.vcard-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
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
  font-size: 0.775rem;
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
