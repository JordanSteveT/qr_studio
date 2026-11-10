import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'
import { QrEngineService, type QrRenderOptions } from '~/services/qr/qr-engine.service'
import { calculateContrastRatio as calcWcagContrastRatio } from '~/services/qr/contrast-checker.service'
import { DEFAULT_QR_DESIGN, type QrDesign } from '~/types/design'
import { deepClone } from '~/utils/clone.util'

/**
 * Calcule le ratio de contraste entre deux couleurs hexadécimales (WCAG)
 * avec gestion du fond transparent.
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  if (background === 'transparent') {
    return 10.0 // Valeur nominale pour fond transparent
  }
  return calcWcagContrastRatio(foreground, background)
}

export function useQrEngine() {
  const engineService = new QrEngineService()
  const isReady = ref(false)
  const isRendering = ref(false)
  const currentData = ref('https://qrstudio.app')
  const currentDesign = ref<QrDesign>(deepClone(DEFAULT_QR_DESIGN))

  // Throttle leading + trailing : rendu immédiat (0 ms) dès la 1ère action,
  // et rafraîchissement continu fluide (~40 FPS) lors du glissement des curseurs.
  let throttleTimer: ReturnType<typeof setTimeout> | null = null
  let hasPendingTrailing = false
  const THROTTLE_WINDOW_MS = 25

  /**
   * Calcul du contraste et niveau de lisibilité estimé
   */
  const contrastRatio = computed(() => {
    const fg = currentDesign.value.dots.color
    const bg = currentDesign.value.background.isTransparent ? 'transparent' : currentDesign.value.background.color
    return calculateContrastRatio(fg, bg)
  })

  const scannabilityScore = computed(() => {
    const ratio = contrastRatio.value
    if (ratio >= 4.5) {
      return { score: 100, label: 'Excellente', status: 'success' }
    } else if (ratio >= 3.0) {
      return { score: 75, label: 'Bonne', status: 'warning' }
    } else {
      return { score: 40, label: 'Faible (Risque de lecture)', status: 'danger' }
    }
  })

  /**
   * Initialise le moteur dans l'élément DOM spécifié
   */
  const mountQrCode = async (container: HTMLElement, options?: Partial<QrRenderOptions>) => {
    isRendering.value = true
    try {
      if (options?.data) currentData.value = options.data
      if (options?.design) currentDesign.value = deepClone(options.design)

      await engineService.init(container, {
        data: currentData.value,
        design: currentDesign.value,
        width: options?.width ?? 320,
        height: options?.height ?? 320,
        type: options?.type ?? 'svg'
      })
      isReady.value = true
    } finally {
      isRendering.value = false
    }
  }

  /**
   * Met à jour instantanément le QR code (leading immédiat + trailing coalescé)
   */
  const updateQrCode = (data?: string, design?: Partial<QrDesign>) => {
    if (data !== undefined) currentData.value = data
    if (design) currentDesign.value = { ...currentDesign.value, ...design }

    isRendering.value = true

    if (!throttleTimer) {
      engineService.update({
        data: currentData.value,
        design: currentDesign.value
      })
      hasPendingTrailing = false

      throttleTimer = setTimeout(() => {
        throttleTimer = null
        if (hasPendingTrailing) {
          hasPendingTrailing = false
          engineService.update({
            data: currentData.value,
            design: currentDesign.value
          })
        }
        isRendering.value = false
      }, THROTTLE_WINDOW_MS)
    } else {
      hasPendingTrailing = true
    }
  }

  /**
   * Récupère le blob du QR code
   */
  const getBlob = async (extension: 'png' | 'svg' | 'jpeg' | 'webp' = 'png'): Promise<Blob | null> => {
    return engineService.getRawData(extension)
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
      engineService.destroy()
    })
  }

  return {
    isReady,
    isRendering,
    currentData,
    currentDesign,
    contrastRatio,
    scannabilityScore,
    mountQrCode,
    updateQrCode,
    getBlob
  }
}
