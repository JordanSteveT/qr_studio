<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { useQrEngine } from '~/composables/useQrEngine'
import { DEFAULT_QR_DESIGN, type QrDesign } from '~/types/design'
import { ShieldCheck, AlertTriangle, Maximize2, X, RefreshCw } from 'lucide-vue-next'

interface Props {
  data?: string
  design?: QrDesign
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  data: 'https://qrstudio.app',
  size: 300
})

const qrContainerRef = ref<HTMLElement | null>(null)
const isZoomOpen = ref(false)

const {
  isReady,
  isRendering,
  scannabilityScore,
  contrastRatio,
  mountQrCode,
  updateQrCode
} = useQrEngine()

let isMounting = false

const triggerMount = async () => {
  await nextTick()
  if (qrContainerRef.value && !isReady.value && !isMounting) {
    isMounting = true
    try {
      await mountQrCode(qrContainerRef.value, {
        data: props.data,
        design: props.design ?? DEFAULT_QR_DESIGN,
        width: props.size,
        height: props.size
      })
    } catch (err: unknown) {
      console.error('[QrPreview] Erreur lors du montage du QR code:', err)
    } finally {
      isMounting = false
    }
  }
}

onMounted(async () => {
  await triggerMount()
})

// Surveillance réactive du conteneur DOM au cas où ClientOnly monte avec un micro-décalage
watch(qrContainerRef, async (newEl) => {
  if (newEl && !isReady.value) {
    await triggerMount()
  }
})

watch(() => props.data, (newData) => {
  if (isReady.value) {
    updateQrCode(newData, props.design ?? DEFAULT_QR_DESIGN)
  }
})

watch(() => props.design, async (newDesign) => {
  if (newDesign) {
    if (!isReady.value) {
      await triggerMount()
    } else {
      updateQrCode(props.data, newDesign)
    }
  }
}, { deep: true })
</script>

<template>
  <div class="qr-preview-root">
    <div class="preview-card">
      <!-- Zone de rendu graphique du QR Code -->
      <div class="preview-stage" :style="{ maxWidth: `${(props.size ?? 300) + 40}px` }">
        <div
          class="frame-presentation-box"
          :class="[`frame-style--${props.design?.frame?.type ?? 'none'}`]"
          :style="{
            '--frame-color': props.design?.frame?.frameColor ?? '#3b82f6',
            '--text-color': props.design?.frame?.textColor ?? '#ffffff'
          }"
        >
          <!-- Bandeau supérieur pour top-badge ou speech-bubble -->
          <div
            v-if="props.design?.frame?.type === 'top-badge' || props.design?.frame?.type === 'speech-bubble'"
            class="frame-banner frame-banner--top"
          >
            <span>{{ props.design?.frame?.text || 'SCANNEZ-MOI' }}</span>
          </div>

          <div
            ref="qrContainerRef"
            class="qr-canvas-host"
            :class="{ 'qr-canvas-host--rendering': isRendering }"
            aria-label="Aperçu interactif du QR code"
          />

          <!-- Bandeau inférieur pour bottom-badge ou full-card -->
          <div
            v-if="props.design?.frame?.type === 'bottom-badge' || props.design?.frame?.type === 'full-card'"
            class="frame-banner frame-banner--bottom"
          >
            <span>{{ props.design?.frame?.text || 'SCANNEZ-MOI' }}</span>
          </div>
        </div>

        <!-- Bouton Zoom Plein Écran -->
        <button
          v-if="isReady"
          type="button"
          class="zoom-btn"
          title="Agrandir pour tester le scan direct"
          aria-label="Agrandir le QR code en plein écran"
          @click="isZoomOpen = true"
        >
          <Maximize2 :size="16" />
        </button>
      </div>

      <!-- Jauge de qualité de scan / Contraste -->
      <div class="quality-bar" :class="`quality-bar--${scannabilityScore.status}`">
        <ShieldCheck v-if="scannabilityScore.status === 'success'" :size="16" />
        <AlertTriangle v-else :size="16" />
        <span class="quality-text">
          Lisibilité : <strong>{{ scannabilityScore.label }}</strong>
          <span class="contrast-val">({{ contrastRatio.toFixed(1) }}:1)</span>
        </span>
      </div>
    </div>

    <!-- Modale Zoom Plein Écran -->
    <div
      v-if="isZoomOpen"
      class="zoom-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="QR Code Agrandissement"
      @click.self="isZoomOpen = false"
    >
      <div class="zoom-modal-content">
        <button
          type="button"
          class="modal-close-btn"
          aria-label="Fermer"
          @click="isZoomOpen = false"
        >
          <X :size="24" />
        </button>
        <div class="zoom-instructions">
          Scannez directement cet écran avec votre smartphone
        </div>
        <div class="zoom-qr-display">
          <!-- Affiche le contenu en grand -->
          <div class="zoom-data-preview">{{ data }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qr-preview-root {
  width: 100%;
}

.preview-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: all var(--transition-fast);
}

.preview-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: var(--radius-md);
  padding: 1rem;
  box-shadow: inset 0 1px 3px 0 rgb(0 0 0 / 0.04);
}

.qr-canvas-host {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: opacity 150ms ease;
}

.qr-canvas-host :deep(svg),
.qr-canvas-host :deep(canvas),
.qr-target-element :deep(svg),
.qr-target-element :deep(canvas) {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.qr-target-element {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.qr-canvas-host--rendering {
  opacity: 0.7;
}

/* Styles des cadres décoratifs */
.frame-presentation-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: all 0.25s ease;
}

.frame-banner {
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color);
  background-color: var(--frame-color);
}

.frame-style--bottom-badge {
  border: 4px solid var(--frame-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: #ffffff;
}

.frame-style--bottom-badge .qr-canvas-host {
  padding: 0.75rem 0.75rem 0.25rem 0.75rem;
}

.frame-style--top-badge {
  border: 4px solid var(--frame-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: #ffffff;
}

.frame-style--top-badge .qr-canvas-host {
  padding: 0.25rem 0.75rem 0.75rem 0.75rem;
}

.frame-style--speech-bubble {
  border: 3px solid var(--frame-color);
  border-radius: var(--radius-lg);
  background-color: #ffffff;
  overflow: hidden;
}

.frame-style--speech-bubble .frame-banner--top {
  position: relative;
  margin-bottom: 8px;
}

.frame-style--speech-bubble .frame-banner--top::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: var(--frame-color) transparent;
  display: block;
  width: 0;
}

.frame-style--full-card {
  background-color: var(--frame-color);
  padding: 0.75rem;
  border-radius: var(--radius-xl);
}

.frame-style--full-card .qr-canvas-host {
  background-color: #ffffff;
  border-radius: var(--radius-md);
  padding: 0.5rem;
}

.frame-style--full-card .frame-banner--bottom {
  background-color: transparent;
  padding-top: 0.5rem;
}

.zoom-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  background-color: #ffffff;
  color: #18181b;
  border-radius: var(--radius-xs);
  border: 1px solid #e4e4e7;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.zoom-btn:hover {
  background-color: #f4f4f5;
  color: #09090b;
}

/* Skeleton de chargement SSR */
.preview-skeleton {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
}

.skeleton-corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 5px solid var(--color-border);
  border-radius: 4px;
}

.skeleton-tl { top: 10px; left: 10px; }
.skeleton-tr { top: 10px; right: 10px; }
.skeleton-bl { bottom: 10px; left: 10px; }

.skeleton-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.spin-icon {
  animation: spin 1.5s linear infinite;
  color: var(--color-primary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Jauge de lisibilité */
.quality-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.65rem;
  font-size: 0.78rem;
  border-radius: var(--radius-full);
}

.quality-bar--success {
  background-color: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.quality-bar--warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.quality-bar--danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.contrast-val {
  font-weight: normal;
  opacity: 0.85;
}

/* Modale Zoom */
.zoom-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.zoom-modal-content {
  position: relative;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  box-shadow: var(--shadow-lg);
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: var(--color-text-muted);
}

.modal-close-btn:hover {
  color: var(--color-text);
}

.zoom-instructions {
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
}

.zoom-data-preview {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  word-break: break-all;
  text-align: center;
  max-width: 400px;
}
</style>
