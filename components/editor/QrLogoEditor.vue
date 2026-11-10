<script setup lang="ts">
import { ref } from 'vue'
import type { QrDesign } from '~/types/design'
import { sanitizeSvgContent, utf8ToBase64 } from '~/utils/svg-sanitizer.util'
import { Upload, Trash2, ShieldCheck, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  design: QrDesign
}>()

const emit = defineEmits<{
  (e: 'update:design', design: QrDesign): void
}>()

const isDragging = ref(false)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 Mo

const triggerFileInput = () => {
  fileInput.value?.click()
}

const applyUploadedLogo = (file: File, dataUrl: string) => {
  // Règle métier FR-006 : Élever la correction d'erreur au minimum à Q (25%) ou H (30%)
  const currentErr = props.design.errorCorrectionLevel
  const newErr = currentErr === 'L' || currentErr === 'M' ? 'Q' : currentErr

  emit('update:design', {
    ...props.design,
    errorCorrectionLevel: newErr,
    logo: {
      ...props.design.logo,
      hasLogo: true,
      logoFileName: file.name,
      logoMimeType: file.type,
      logoDataUrl: dataUrl
    }
  })
}

const handleFile = (file: File) => {
  errorMessage.value = ''

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    errorMessage.value = 'Format non supporté. Veuillez choisir une image PNG, SVG, JPEG ou WebP.'
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'Le fichier dépasse la taille maximale autorisée de 2 Mo.'
    return
  }

  // Assainissement strict des SVG (SEC-002) avant encodage Data URL
  if (file.type === 'image/svg+xml') {
    const textReader = new FileReader()
    textReader.onload = (e) => {
      const rawSvg = e.target?.result as string
      const cleaned = sanitizeSvgContent(rawSvg)
      if (!cleaned) {
        errorMessage.value = 'Fichier SVG invalide ou vide.'
        return
      }
      const dataUrl = `data:image/svg+xml;base64,${utf8ToBase64(cleaned)}`
      applyUploadedLogo(file, dataUrl)
    }
    textReader.onerror = () => {
      errorMessage.value = 'Impossible de lire le fichier SVG sélectionné.'
    }
    textReader.readAsText(file)
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (!dataUrl) return
    applyUploadedLogo(file, dataUrl)
  }
  reader.onerror = () => {
    errorMessage.value = 'Impossible de lire le fichier image sélectionné.'
  }

  reader.readAsDataURL(file)
}

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    handleFile(target.files[0])
  }
}

const onDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    handleFile(event.dataTransfer.files[0])
  }
}

const removeLogo = () => {
  emit('update:design', {
    ...props.design,
    logo: {
      ...props.design.logo,
      hasLogo: false,
      logoFileName: undefined,
      logoMimeType: undefined,
      logoDataUrl: undefined
    }
  })
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const updateLogoSize = (size: number) => {
  const newErr = size > 0.3 ? 'H' : props.design.errorCorrectionLevel

  emit('update:design', {
    ...props.design,
    errorCorrectionLevel: newErr,
    logo: {
      ...props.design.logo,
      imageSize: size
    }
  })
}

const updateLogoMargin = (margin: number) => {
  emit('update:design', {
    ...props.design,
    logo: {
      ...props.design.logo,
      margin
    }
  })
}

const toggleHideDots = (hide: boolean) => {
  emit('update:design', {
    ...props.design,
    logo: {
      ...props.design.logo,
      hideBackgroundDots: hide
    }
  })
}
</script>

<template>
  <div class="logo-editor">
    <input
      ref="fileInput"
      type="file"
      accept="image/png,image/jpeg,image/svg+xml,image/webp"
      class="hidden-file-input"
      @change="onFileChange"
    >

    <!-- Zone de téléversement si aucun logo -->
    <div
      v-if="!props.design.logo.hasLogo || !props.design.logo.logoDataUrl"
      class="upload-dropzone"
      :class="{ 'is-dragging': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerFileInput"
    >
      <div class="upload-icon-circle">
        <Upload :size="22" aria-hidden="true" />
      </div>
      <p class="upload-title">Cliquez pour importer ou glissez un logo ici</p>
      <p class="upload-subtitle">Formats PNG, SVG, JPEG ou WebP (max. 2 Mo)</p>
    </div>

    <!-- Aperçu et réglages si logo actif -->
    <div v-else class="logo-active-box">
      <div class="logo-preview-header">
        <div class="logo-thumbnail-box">
          <img
            :src="props.design.logo.logoDataUrl"
            :alt="props.design.logo.logoFileName || 'Logo du QR Code'"
            class="logo-thumbnail-img"
          >
        </div>

        <div class="logo-info">
          <span class="logo-filename">{{ props.design.logo.logoFileName || 'Logo personnalisé' }}</span>
          <span class="logo-status">
            <ShieldCheck :size="14" />
            Redondance auto-ajustée ({{ props.design.errorCorrectionLevel }})
          </span>
        </div>

        <div class="logo-actions">
          <button
            type="button"
            class="btn-action btn-replace"
            title="Remplacer le logo"
            @click="triggerFileInput"
          >
            Remplacer
          </button>
          <button
            type="button"
            class="btn-action btn-delete"
            title="Supprimer le logo"
            aria-label="Supprimer le logo"
            @click="removeLogo"
          >
            <Trash2 :size="16" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Sliders de réglages -->
      <div class="sliders-group">
        <div class="slider-row">
          <div class="slider-label-row">
            <span class="slider-label">Taille du logo</span>
            <span class="slider-val">{{ Math.round(props.design.logo.imageSize * 100) }} %</span>
          </div>
          <input
            type="range"
            min="0.15"
            max="0.35"
            step="0.01"
            class="slider-control"
            :value="props.design.logo.imageSize"
            @input="updateLogoSize(parseFloat(($event.target as HTMLInputElement).value))"
          >
        </div>

        <div class="slider-row">
          <div class="slider-label-row">
            <span class="slider-label">Marge autour du logo</span>
            <span class="slider-val">{{ props.design.logo.margin }} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            step="1"
            class="slider-control"
            :value="props.design.logo.margin"
            @input="updateLogoMargin(parseInt(($event.target as HTMLInputElement).value, 10))"
          >
        </div>

        <label class="checkbox-label">
          <input
            type="checkbox"
            :checked="props.design.logo.hideBackgroundDots"
            @change="toggleHideDots(($event.target as HTMLInputElement).checked)"
          >
          <span>Masquer les points situés derrière le logo</span>
        </label>
      </div>
    </div>

    <!-- Message d'erreur -->
    <p v-if="errorMessage" class="error-banner" role="alert">
      <AlertCircle :size="16" />
      <span>{{ errorMessage }}</span>
    </p>
  </div>
</template>

<style scoped>
.logo-editor {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.hidden-file-input {
  display: none;
}

.upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.upload-dropzone:hover,
.upload-dropzone.is-dragging {
  border-color: var(--color-border-hover);
  background-color: var(--color-accent-subtle);
}

.upload-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #d9f24a;
  border: 2px solid #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1523;
  margin-bottom: 0.65rem;
}

.upload-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.25rem 0;
}

.upload-subtitle {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin: 0;
}

.logo-active-box {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 1rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.logo-preview-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.logo-thumbnail-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: #ffffff;
  border: 1.5px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.logo-thumbnail-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.logo-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.logo-filename {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.76rem;
  color: var(--color-success);
  font-weight: 600;
  margin-top: 0.15rem;
}

.logo-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.btn-action {
  padding: 0.4rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  cursor: pointer;
  background-color: var(--color-surface);
  color: var(--color-text);
  transition: all var(--transition-fast);
}

.btn-replace:hover {
  border-color: var(--color-border-hover);
  background-color: #d9f24a;
  color: #1a1523;
}

.btn-delete {
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover {
  border-color: var(--color-danger);
  background-color: var(--color-danger-bg);
}

.sliders-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding-top: 0.75rem;
  border-top: 1.5px solid var(--color-border);
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.slider-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
}

.slider-label {
  color: var(--color-text);
  font-weight: 600;
}

.slider-val {
  color: var(--color-text-muted);
  font-weight: 700;
}

.slider-control {
  width: 100%;
  accent-color: #1a1523;
  cursor: pointer;
}

.dark .slider-control {
  accent-color: #d9f24a;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.9rem;
  background-color: var(--color-danger-bg);
  border: 1.5px solid color-mix(in srgb, var(--color-danger) 35%, transparent);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  font-size: 0.82rem;
  font-weight: 600;
  margin: 0;
}
</style>
