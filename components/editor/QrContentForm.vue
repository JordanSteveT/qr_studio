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
import { deepClone } from '~/utils/clone.util'
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

const currentContent: Ref<QrContent> = ref(
  props.initialContent ? deepClone(props.initialContent) : deepClone(DEFAULT_CONTENTS.URL)
)
const errors: Ref<Record<string, string>> = ref({})

const memoryStore: Record<QrContentType, QrContent> = {
  URL: deepClone(DEFAULT_CONTENTS.URL),
  TEXT: deepClone(DEFAULT_CONTENTS.TEXT),
  WIFI: deepClone(DEFAULT_CONTENTS.WIFI),
  VCARD: deepClone(DEFAULT_CONTENTS.VCARD),
  EMAIL: deepClone(DEFAULT_CONTENTS.EMAIL),
  SMS: deepClone(DEFAULT_CONTENTS.SMS),
  PHONE: deepClone(DEFAULT_CONTENTS.PHONE),
  GEO: deepClone(DEFAULT_CONTENTS.GEO),
  EVENT: deepClone(DEFAULT_CONTENTS.EVENT),
  CUSTOM: deepClone(DEFAULT_CONTENTS.CUSTOM)
}

if (props.initialContent) {
  memoryStore[props.initialContent.type] = deepClone(props.initialContent)
}

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

const syncUpdates = (markUserChange: boolean) => {
  const content = currentContent.value
  memoryStore[content.type] = deepClone(content)

  const isValid = validateContent(content)
  const serialized = serializeQrContent(content)

  emit('update:content', content)
  if (serialized) {
    emit('update:encodedData', serialized)
  }
  if (markUserChange) {
    emit('change')
  }
}

const handleTypeSelect = (newType: QrContentType) => {
  if (currentContent.value.type === newType) return

  memoryStore[currentContent.value.type] = deepClone(currentContent.value)
  currentContent.value = deepClone(memoryStore[newType])
  syncUpdates(true)
}

const handleDataUpdate = (updatedContent: QrContent) => {
  currentContent.value = updatedContent
  syncUpdates(true)
}

watch(
  () => props.initialContent,
  (newVal, oldVal) => {
    if (!newVal) return
    const isInitialMount = oldVal === undefined
    const isExternalChange = JSON.stringify(newVal) !== JSON.stringify(currentContent.value)
    if (isInitialMount || isExternalChange) {
      currentContent.value = deepClone(newVal)
      memoryStore[newVal.type] = deepClone(newVal)
      validateContent(currentContent.value)
      const serialized = serializeQrContent(currentContent.value)
      if (serialized) {
        emit('update:encodedData', serialized)
      }
      // Sur montage initial autonome (sans parent qui écoute uniquement @update:encodedData), émettre update:content une seule fois si le contenu diffère ou au tout début
      if (isInitialMount) {
        emit('update:content', currentContent.value)
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="qr-content-form-card">
    <div class="card-header">
      <h3 class="card-title">1. Contenu du QR Code</h3>
    </div>

    <QrTypeSelector
      :active-type="currentContent.type"
      @select="handleTypeSelect"
    />

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
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: 0.9rem;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}

.active-form-container {
  padding-top: 1.15rem;
  border-top: 1.5px solid var(--color-border);
}
</style>
