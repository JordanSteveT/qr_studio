<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useQrEngine } from '~/composables/useQrEngine'
import { QrEngineService } from '~/services/qr/qr-engine.service'
import { DEFAULT_QR_DESIGN, type QrDesign } from '~/types/design'
import { ShieldCheck, AlertTriangle, Maximize2, X } from 'lucide-vue-next'

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
const zoomQrContainerRef = ref<HTMLElement | null>(null)
const isZoomOpen = ref(false)
const zoomEngineService = new QrEngineService()

const {
  isReady,
  isRendering,
  scannabilityScore,
  contrastRatio,
  mountQrCode,
  updateQrCode
} = useQrEngine()

let isMounting = false
let hasPendingSyncDuringMount = false

const triggerMount = async () => {
  await nextTick()
  if (qrContainerRef.value && !isReady.value && !isMounting) {
    isMounting = true
    const mountedData = props.data
    const mountedDesign = props.design ?? DEFAULT_QR_DESIGN
    try {
      await mountQrCode(qrContainerRef.value, {
        data: mountedData,
        design: mountedDesign,
        width: props.size,
        height: props.size
      })
    } catch (err: unknown) {
      console.error('[QrPreview] Erreur lors du montage du QR code:', err)
    } finally {
      isMounting = false
    }

    // Si props.data ou props.design ont évolué pendant le chargement initial du moteur, resynchroniser immédiatement
    if (
      isReady.value &&
      (hasPendingSyncDuringMount || props.data !== mountedData || props.design !== mountedDesign)
    ) {
      hasPendingSyncDuringMount = false
      updateQrCode(props.data, props.design ?? DEFAULT_QR_DESIGN)
    }
  }
}

const renderZoomQr = async () => {
  await nextTick()
  if (!isZoomOpen.value || !zoomQrContainerRef.value) return
  try {
    await zoomEngineService.init(zoomQrContainerRef.value, {
      data: props.data,
      design: props.design ?? DEFAULT_QR_DESIGN,
      width: 340,
      height: 340,
      type: 'svg'
    })
  } catch (err: unknown) {
    console.error('[QrPreview] Erreur rendu modale zoom:', err)
  }
}

const openZoomModal = async () => {
  isZoomOpen.value = true
  await renderZoomQr()
}

const closeZoomModal = () => {
  isZoomOpen.value = false
  zoomEngineService.destroy()
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isZoomOpen.value) {
    closeZoomModal()
  }
}

onMounted(async () => {
  await triggerMount()
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  zoomEngineService.destroy()
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
  }
})

watch(qrContainerRef, async (newEl) => {
  if (newEl && !isReady.value) {
    await triggerMount()
  }
})

watch(() => props.data, (newData) => {
  if (isReady.value) {
    updateQrCode(newData, props.design ?? DEFAULT_QR_DESIGN)
  } else if (isMounting) {
    hasPendingSyncDuringMount = true
  }
  if (isZoomOpen.value) {
    renderZoomQr()
  }
})

watch(() => props.design, async (newDesign) => {
  if (newDesign) {
    if (!isReady.value) {
      if (isMounting) {
        hasPendingSyncDuringMount = true
      } else {
        await triggerMount()
      }
    } else {
      updateQrCode(props.data, newDesign)
    }
    if (isZoomOpen.value) {
      renderZoomQr()
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
            '--frame-color': props.design?.frame?.frameColor ?? '#1a1523',
            '--text-color': props.design?.frame?.textColor ?? '#fff8ee'
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
          @click="openZoomModal"
        >
          <Maximize2 :size="15" />
        </button>
      </div>

      <!-- Jauge de qualité de scan / Contraste -->
      <div class="quality-bar" :class="`quality-bar--${scannabilityScore.status}`">
        <ShieldCheck v-if="scannabilityScore.status === 'success'" :size="15" />
        <AlertTriangle v-else :size="15" />
        <span class="quality-text">
          Lisibilité : <strong>{{ scannabilityScore.label }}</strong>
          <span class="contrast-val">({{ contrastRatio.toFixed(1) }}:1)</span>
        </span>
      </div>
    </div>

    <!-- Modale Zoom Plein Écran avec véritable QR code agrandi -->
    <div
      v-if="isZoomOpen"
      class="zoom-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="QR Code Agrandissement"
      @click.self="closeZoomModal"
    >
      <div class="zoom-modal-content">
        <button
          type="button"
          class="modal-close-btn"
          aria-label="Fermer"
          @click="closeZoomModal"
        >
          <X :size="20" />
        </button>
        <div class="zoom-instructions">
          Scannez directement cet écran avec votre smartphone
        </div>
        <div class="zoom-qr-display">
          <div
            class="frame-presentation-box"
            :class="[`frame-style--${props.design?.frame?.type ?? 'none'}`]"
            :style="{
              '--frame-color': props.design?.frame?.frameColor ?? '#1a1523',
              '--text-color': props.design?.frame?.textColor ?? '#fff8ee'
            }"
          >
            <div
              v-if="props.design?.frame?.type === 'top-badge' || props.design?.frame?.type === 'speech-bubble'"
              class="frame-banner frame-banner--top"
            >
              <span>{{ props.design?.frame?.text || 'SCANNEZ-MOI' }}</span>
            </div>
            <div ref="zoomQrContainerRef" class="zoom-qr-host" />
            <div
              v-if="props.design?.frame?.type === 'bottom-badge' || props.design?.frame?.type === 'full-card'"
              class="frame-banner frame-banner--bottom"
            >
              <span>{{ props.design?.frame?.text || 'SCANNEZ-MOI' }}</span>
            </div>
          </div>
        </div>
        <div class="zoom-data-preview">{{ data }}</div>
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
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.preview-stage {
  position: relative;
  width: 100%;
  margin: 0 auto;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1rem;
  box-shadow: inset 0 1px 4px rgba(26, 21, 35, 0.04);
}

.qr-canvas-host {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  transition: opacity 150ms ease;
}

.qr-canvas-host :deep(svg),
.qr-canvas-host :deep(canvas),
.zoom-qr-host :deep(svg),
.zoom-qr-host :deep(canvas) {
  display: block;
  width: 100% !important;
  height: auto !important;
  max-width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
}

.qr-canvas-host--rendering {
  opacity: 1;
}

/* Styles des cadres décoratifs */
.frame-presentation-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
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
  word-break: break-word;
  color: var(--text-color);
  background-color: var(--frame-color);
}

.frame-style--bottom-badge,
.frame-style--top-badge {
  border: 4px solid var(--frame-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: #ffffff;
}

.frame-style--bottom-badge .qr-canvas-host,
.frame-style--bottom-badge .zoom-qr-host {
  padding: 0.75rem 0.75rem 0.25rem 0.75rem;
}

.frame-style--top-badge .qr-canvas-host,
.frame-style--top-badge .zoom-qr-host {
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

.frame-style--full-card .qr-canvas-host,
.frame-style--full-card .zoom-qr-host {
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
  top: 0.6rem;
  right: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #ffffff;
  color: #1a1523;
  border-radius: 999px;
  border: 2px solid #1a1523;
  box-shadow: 0 2px 6px rgba(26, 21, 35, 0.12);
  cursor: pointer;
  transition: transform var(--transition-spring), background-color var(--transition-fast);
}

.zoom-btn:hover {
  background-color: #d9f24a;
  transform: scale(1.06);
}

/* Jauge de lisibilité */
.quality-bar {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: var(--radius-full);
}

.quality-bar--success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border: 1.5px solid color-mix(in srgb, var(--color-success) 30%, transparent);
}

.quality-bar--warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
  border: 1.5px solid color-mix(in srgb, var(--color-warning) 35%, transparent);
}

.quality-bar--danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
  border: 1.5px solid color-mix(in srgb, var(--color-danger) 35%, transparent);
}

.contrast-val {
  font-weight: 500;
  opacity: 0.85;
}

/* Modale Zoom */
.zoom-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  background-color: rgba(26, 21, 35, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(6px);
}

.zoom-modal-content {
  position: relative;
  background-color: var(--color-surface);
  border: 3px solid #1a1523;
  border-radius: var(--radius-2xl);
  padding: 2.25rem 2rem;
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  box-shadow: var(--shadow-lg);
}

.dark .zoom-modal-content {
  border-color: var(--color-accent);
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  background-color: var(--color-bg);
  border: 2px solid var(--color-border);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background-color: #d9f24a;
  color: #1a1523;
  border-color: #1a1523;
}

.zoom-instructions {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  text-align: center;
  color: var(--color-text);
  padding-right: 1.5rem;
}

.zoom-qr-display {
  width: 100%;
  max-width: 340px;
  background-color: #ffffff;
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-qr-host {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.zoom-data-preview {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--color-text-muted);
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-md);
  word-break: break-all;
  text-align: center;
  width: 100%;
}
</style>
