import { ref, computed, onUnmounted, getCurrentInstance } from 'vue'
import { QrEngineService, type QrRenderOptions } from '~/services/qr/qr-engine.service'
import { DEFAULT_QR_DESIGN, type QrDesign } from '~/types/design'

/**
 * Calcule la luminance relative d'une couleur hexadécimale (#RRGGBB)
 */
function getLuminance(hexColor: string): number {
  let hex = hexColor.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  if (hex.length !== 6) return 0.5

  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const sRGB = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  const lumR = sRGB[0] ?? 0
  const lumG = sRGB[1] ?? 0
  const lumB = sRGB[2] ?? 0

  return 0.2126 * lumR + 0.7152 * lumG + 0.0722 * lumB
}

/**
 * Calcule le ratio de contraste entre deux couleurs hexadécimales (WCAG)
 */
export function calculateContrastRatio(foreground: string, background: string): number {
  if (background === 'transparent') {
    return 10.0 // Valeur nominale pour fond transparent
  }
  const lum1 = getLuminance(foreground)
  const lum2 = getLuminance(background)
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  return (brightest + 0.05) / (darkest + 0.05)
}

export function useQrEngine() {
  const engineService = new QrEngineService()
  const isReady = ref(false)
  const isRendering = ref(false)
  const currentData = ref('https://qrstudio.app')
  const currentDesign = ref<QrDesign>({ ...DEFAULT_QR_DESIGN })

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

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
      if (options?.design) currentDesign.value = { ...currentDesign.value, ...options.design }

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
   * Met à jour réactivement les données et styles sous debounce
   */
  const updateQrCode = (data?: string, design?: Partial<QrDesign>) => {
    if (data !== undefined) currentData.value = data
    if (design) currentDesign.value = { ...currentDesign.value, ...design }

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    isRendering.value = true
    debounceTimer = setTimeout(() => {
      engineService.update({
        data: currentData.value,
        design: currentDesign.value
      })
      isRendering.value = false
    }, 100) // Debounce de 100ms
  }

  /**
   * Récupère le blob du QR code
   */
  const getBlob = async (extension: 'png' | 'svg' | 'jpeg' | 'webp' = 'png'): Promise<Blob | null> => {
    return engineService.getRawData(extension)
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
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
