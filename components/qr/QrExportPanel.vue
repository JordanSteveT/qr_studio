<script setup lang="ts">
import { ref, computed } from 'vue'
import type { QrDesign } from '~/types/design'
import {
  type ExportFormat,
  type PngResolution,
  PNG_RESOLUTIONS
} from '~/types/export'
import { ExportService } from '~/services/export/export.service'
import { PrintService } from '~/services/export/print.service'
import { sanitizeFileName, downloadBlob } from '~/utils/download.util'
import {
  Download,
  Printer,
  FileCode,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    data: string
    design: QrDesign
    projectName?: string
  }>(),
  {
    projectName: 'Mon QR Code'
  }
)

const selectedResolution = ref<PngResolution>(2048)
const isResolutionDropdownOpen = ref(false)
const isExporting = ref(false)
const activeFormat = ref<ExportFormat | 'print' | null>(null)
const exportError = ref<string | null>(null)

const activeResolutionOption = computed(() => {
  return (
    PNG_RESOLUTIONS.find(r => r.value === selectedResolution.value) || PNG_RESOLUTIONS[1]!
  )
})

const handleExport = async (format: ExportFormat) => {
  if (isExporting.value) return

  isExporting.value = true
  activeFormat.value = format
  exportError.value = null

  try {
    const blob = await ExportService.generateExportBlob({
      format,
      data: props.data,
      design: props.design,
      resolution: format === 'png' || format === 'jpeg' || format === 'webp' ? selectedResolution.value : undefined,
      projectName: props.projectName
    })

    const fileName = sanitizeFileName(props.projectName || 'qr-code', format)
    downloadBlob(blob, fileName)
  } catch (err) {
    console.error('Erreur lors de l\'exportation:', err)
    exportError.value = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'export.'
  } finally {
    isExporting.value = false
    activeFormat.value = null
  }
}

const handlePrint = () => {
  PrintService.printPage()
}
</script>

<template>
  <div class="export-panel-root">
    <!-- Message d'erreur éventuel -->
    <div v-if="exportError" class="export-error-alert" role="alert">
      <span>{{ exportError }}</span>
    </div>

    <!-- Action Principale : Télécharger PNG avec sélecteur de résolution -->
    <div class="primary-download-group">
      <button
        type="button"
        class="btn-primary-download"
        :disabled="isExporting"
        :aria-busy="isExporting && activeFormat === 'png'"
        @click="handleExport('png')"
      >
        <Loader2 v-if="isExporting && activeFormat === 'png'" :size="18" class="spin-icon" />
        <Download v-else :size="18" />
        <span class="btn-text">
          Télécharger PNG
          <span class="res-tag">({{ activeResolutionOption.label }})</span>
        </span>
      </button>

      <!-- Sélecteur de résolution pour PNG -->
      <div class="resolution-dropdown-wrapper">
        <button
          type="button"
          class="resolution-toggle-btn"
          title="Choisir la résolution PNG"
          aria-label="Choisir la résolution PNG"
          :aria-expanded="isResolutionDropdownOpen"
          @click="isResolutionDropdownOpen = !isResolutionDropdownOpen"
        >
          <ChevronDown :size="16" />
        </button>

        <div v-if="isResolutionDropdownOpen" class="resolution-menu" role="menu">
          <div class="resolution-menu-header">Résolution PNG :</div>
          <button
            v-for="res in PNG_RESOLUTIONS"
            :key="res.value"
            type="button"
            class="resolution-item"
            :class="{ 'resolution-item--active': selectedResolution === res.value }"
            role="menuitem"
            @click="selectedResolution = res.value; isResolutionDropdownOpen = false"
          >
            <div class="resolution-item-info">
              <span class="res-label">{{ res.label }}</span>
              <span class="res-sublabel">{{ res.sublabel }}</span>
            </div>
            <Check v-if="selectedResolution === res.value" :size="14" class="check-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Rangée de formats secondaires : SVG, JPEG, WebP, Imprimer -->
    <div class="secondary-actions-grid">
      <button
        type="button"
        class="btn-sec-export"
        title="Format vectoriel infini (Illustrator, Inkscape, Impression)"
        :disabled="isExporting"
        @click="handleExport('svg')"
      >
        <Loader2 v-if="isExporting && activeFormat === 'svg'" :size="14" class="spin-icon" />
        <FileCode v-else :size="14" />
        <span>SVG</span>
      </button>

      <button
        type="button"
        class="btn-sec-export"
        title="Format JPEG compressé standard (fond blanc opaque garanti)"
        :disabled="isExporting"
        @click="handleExport('jpeg')"
      >
        <Loader2 v-if="isExporting && activeFormat === 'jpeg'" :size="14" class="spin-icon" />
        <ImageIcon v-else :size="14" />
        <span>JPEG</span>
      </button>

      <button
        type="button"
        class="btn-sec-export"
        title="Format WebP moderne pour le web"
        :disabled="isExporting"
        @click="handleExport('webp')"
      >
        <Loader2 v-if="isExporting && activeFormat === 'webp'" :size="14" class="spin-icon" />
        <ImageIcon v-else :size="14" />
        <span>WebP</span>
      </button>

      <button
        type="button"
        class="btn-sec-export btn-sec-export--print"
        title="Imprimer directement sur votre imprimante"
        :disabled="isExporting"
        @click="handlePrint"
      >
        <Printer :size="14" />
        <span>Imprimer</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.export-panel-root {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.export-error-alert {
  padding: 0.5rem 0.75rem;
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  text-align: center;
}

/* Groupe principal Téléchargement */
.primary-download-group {
  display: flex;
  align-items: stretch;
  width: 100%;
  position: relative;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.btn-primary-download {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  background-color: var(--color-primary);
  color: var(--color-bg);
  border: 1px solid var(--color-primary);
  padding: 0.6rem 1rem;
  border-top-left-radius: var(--radius-sm);
  border-bottom-left-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.btn-primary-download:hover:not(:disabled) {
  opacity: 0.92;
}

.btn-primary-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.res-tag {
  font-size: 0.78rem;
  font-weight: 500;
  opacity: 0.85;
  margin-left: 0.2rem;
}

/* Bouton chevron sélecteur de résolution */
.resolution-dropdown-wrapper {
  position: relative;
}

.resolution-toggle-btn {
  background-color: var(--color-primary);
  color: var(--color-bg);
  border: 1px solid var(--color-primary);
  border-left: 1px solid rgba(125, 125, 125, 0.3);
  padding: 0 0.65rem;
  height: 100%;
  border-top-right-radius: var(--radius-sm);
  border-bottom-right-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-fast);
}

.resolution-toggle-btn:hover {
  opacity: 0.92;
}

.resolution-menu {
  position: absolute;
  bottom: calc(100% + 6px);
  right: 0;
  width: 240px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 0.35rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.resolution-menu-header {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-subtle);
  text-transform: uppercase;
  padding: 0.3rem 0.5rem;
  letter-spacing: 0.04em;
}

.resolution-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius-xs);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color var(--transition-fast);
}

.resolution-item:hover {
  background-color: var(--color-surface-hover);
}

.resolution-item--active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.resolution-item-info {
  display: flex;
  flex-direction: column;
}

.res-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
}

.res-sublabel {
  font-size: 0.72rem;
  color: var(--color-text-muted);
}

.check-icon {
  color: var(--color-primary);
}

/* Grille de formats secondaires */
.secondary-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.35rem;
}

.btn-sec-export {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.45rem 0.4rem;
  background-color: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-sec-export:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-hover);
  color: var(--color-text);
}

.btn-sec-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
