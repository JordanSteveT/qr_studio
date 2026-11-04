<script setup lang="ts">
import { ref, watch, type Ref } from 'vue'
import type {
  QrContent,
  QrContentType,
  QrUrlData,
  QrTextData,
  QrWifiData,
  QrVCardData,
  QrEmailData,
  QrSmsData,
  QrPhoneData,
  QrGeoData,
  QrEventData,
  QrCustomData
} from '~/types/content'
import { DEFAULT_CONTENTS } from '~/types/content'
import { serializeQrContent } from '~/services/qr/serializers'
import {
  urlContentSchema,
  textContentSchema,
  wifiContentSchema,
  vcardContentSchema,
  emailContentSchema,
  smsContentSchema,
  phoneContentSchema,
  geoContentSchema,
  eventContentSchema,
  customContentSchema
} from '~/services/validation/content.schema'

import QrTypeSelector from '~/components/editor/QrTypeSelector.vue'
import FormUrl from '~/components/forms/FormUrl.vue'
import FormText from '~/components/forms/FormText.vue'
import FormWifi from '~/components/forms/FormWifi.vue'
import FormVCard from '~/components/forms/FormVCard.vue'
import FormEmail from '~/components/forms/FormEmail.vue'
import FormSms from '~/components/forms/FormSms.vue'
import FormPhone from '~/components/forms/FormPhone.vue'
import FormGeo from '~/components/forms/FormGeo.vue'
import FormEvent from '~/components/forms/FormEvent.vue'
import FormCustom from '~/components/forms/FormCustom.vue'

const props = defineProps<{
  initialContent?: QrContent
}>()

const emit = defineEmits<{
  (e: 'update:content', content: QrContent): void
  (e: 'update:encodedData', encodedData: string): void
  (e: 'change'): void
}>()

// État local réactif du contenu
const currentContent: Ref<QrContent> = ref(props.initialContent ? { ...props.initialContent } : { ...DEFAULT_CONTENTS.URL })
const errors: Ref<Record<string, string>> = ref({})

// Dictionnaire de mémoire pour préserver les saisies de l'utilisateur lors du passage d'un type à un autre
const memoryStore: Record<QrContentType, QrContent> = {
  URL: { ...DEFAULT_CONTENTS.URL },
  TEXT: { ...DEFAULT_CONTENTS.TEXT },
  WIFI: { ...DEFAULT_CONTENTS.WIFI },
  VCARD: { ...DEFAULT_CONTENTS.VCARD },
  EMAIL: { ...DEFAULT_CONTENTS.EMAIL },
  SMS: { ...DEFAULT_CONTENTS.SMS },
  PHONE: { ...DEFAULT_CONTENTS.PHONE },
  GEO: { ...DEFAULT_CONTENTS.GEO },
  EVENT: { ...DEFAULT_CONTENTS.EVENT },
  CUSTOM: { ...DEFAULT_CONTENTS.CUSTOM }
}

// Initialise le memoryStore avec initialContent
if (props.initialContent) {
  memoryStore[props.initialContent.type] = { ...props.initialContent }
}

/**
 * Valide le contenu courant avec le schéma Zod adapté
 */
const validateContent = (content: QrContent): boolean => {
  errors.value = {}

  let parseResult
  switch (content.type) {
    case 'URL':
      parseResult = urlContentSchema.safeParse(content)
      break
    case 'TEXT':
      parseResult = textContentSchema.safeParse(content)
      break
    case 'WIFI':
      parseResult = wifiContentSchema.safeParse(content)
      break
    case 'VCARD':
      parseResult = vcardContentSchema.safeParse(content)
      break
    case 'EMAIL':
      parseResult = emailContentSchema.safeParse(content)
      break
    case 'SMS':
      parseResult = smsContentSchema.safeParse(content)
      break
    case 'PHONE':
      parseResult = phoneContentSchema.safeParse(content)
      break
    case 'GEO':
      parseResult = geoContentSchema.safeParse(content)
      break
    case 'EVENT':
      parseResult = eventContentSchema.safeParse(content)
      break
    case 'CUSTOM':
      parseResult = customContentSchema.safeParse(content)
      break
  }

  if (!parseResult.success) {
    for (const issue of parseResult.error.issues) {
      const field = issue.path[0] ? String(issue.path[0]) : 'general'
      errors.value[field] = issue.message
    }
    return false
  }

  return true
}

/**
 * Émet la sérialisation et les mises à jour
 */
const syncUpdates = () => {
  const content = currentContent.value
  memoryStore[content.type] = { ...content }

  const isValid = validateContent(content)
  const serialized = serializeQrContent(content)

  emit('update:content', content)
  if (isValid && serialized) {
    emit('update:encodedData', serialized)
  }
  emit('change')
}

// Changement de type de contenu
const handleTypeSelect = (newType: QrContentType) => {
  if (currentContent.value.type === newType) return

  // Sauvegarde le type actuel dans la mémoire
  memoryStore[currentContent.value.type] = { ...currentContent.value }

  // Restaure le contenu du nouveau type depuis la mémoire
  currentContent.value = { ...memoryStore[newType] }
  syncUpdates()
}

// Mise à jour des données du formulaire enfant
const handleDataUpdate = (updatedContent: QrContent) => {
  currentContent.value = updatedContent
  syncUpdates()
}

// Synchronisation initiale
watch(
  () => props.initialContent,
  (newVal) => {
    if (newVal) {
      currentContent.value = { ...newVal }
      syncUpdates()
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="qr-content-form-card">
    <div class="card-header">
      <h3 class="card-title">Contenu</h3>
    </div>

    <!-- Sélecteur de types -->
    <QrTypeSelector
      :active-type="currentContent.type"
      @select="handleTypeSelect"
    />

    <!-- Formulaire dynamique -->
    <div class="active-form-container">
      <FormUrl
        v-if="currentContent.type === 'URL'"
        :model-value="currentContent as QrUrlData"
        :error="errors['url']"
        @update:model-value="handleDataUpdate"
      />

      <FormText
        v-else-if="currentContent.type === 'TEXT'"
        :model-value="currentContent as QrTextData"
        :error="errors['text']"
        @update:model-value="handleDataUpdate"
      />

      <FormWifi
        v-else-if="currentContent.type === 'WIFI'"
        :model-value="currentContent as QrWifiData"
        :errors="errors"
        @update:model-value="handleDataUpdate"
      />

      <FormVCard
        v-else-if="currentContent.type === 'VCARD'"
        :model-value="currentContent as QrVCardData"
        :errors="errors"
        @update:model-value="handleDataUpdate"
      />

      <FormEmail
        v-else-if="currentContent.type === 'EMAIL'"
        :model-value="currentContent as QrEmailData"
        :errors="errors"
        @update:model-value="handleDataUpdate"
      />

      <FormSms
        v-else-if="currentContent.type === 'SMS'"
        :model-value="currentContent as QrSmsData"
        :errors="errors"
        @update:model-value="handleDataUpdate"
      />

      <FormPhone
        v-else-if="currentContent.type === 'PHONE'"
        :model-value="currentContent as QrPhoneData"
        :error="errors['phoneNumber']"
        @update:model-value="handleDataUpdate"
      />

      <FormGeo
        v-else-if="currentContent.type === 'GEO'"
        :model-value="currentContent as QrGeoData"
        :errors="errors"
        @update:model-value="handleDataUpdate"
      />

      <FormEvent
        v-else-if="currentContent.type === 'EVENT'"
        :model-value="currentContent as QrEventData"
        :errors="errors"
        @update:model-value="handleDataUpdate"
      />

      <FormCustom
        v-else-if="currentContent.type === 'CUSTOM'"
        :model-value="currentContent as QrCustomData"
        :error="errors['rawPayload']"
        @update:model-value="handleDataUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.qr-content-form-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.card-header {
  margin-bottom: 0.75rem;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin: 0;
}

.active-form-container {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}
</style>
