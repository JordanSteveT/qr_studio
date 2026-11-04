/**
 * Service pur de calcul de contraste WCAG pour les QR codes
 */

export interface RgbColor {
  r: number
  g: number
  b: number
}

export interface ContrastAssessment {
  ratio: number
  level: 'excellent' | 'good' | 'warning' | 'danger'
  message: string
  isScannable: boolean
}

/**
 * Convertit un code couleur hexadécimal (#RGB ou #RRGGBB) en composantes RGB
 */
export function hexToRgb(hex: string): RgbColor | null {
  const cleanHex = hex.trim().replace(/^#/, '')

  if (cleanHex.length === 3) {
    const c0 = cleanHex.charAt(0)
    const c1 = cleanHex.charAt(1)
    const c2 = cleanHex.charAt(2)
    const r = parseInt(c0 + c0, 16)
    const g = parseInt(c1 + c1, 16)
    const b = parseInt(c2 + c2, 16)
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b }
  }

  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b }
  }

  return null
}

/**
 * Calcule la luminance relative d'une couleur selon la formule WCAG 2.1
 */
export function getRelativeLuminance(rgb: RgbColor): number {
  const [rs = 0, gs = 0, bs = 0] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calcule le ratio de contraste entre deux couleurs hexadécimales (de 1:1 à 21:1)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    return 21 // Fallback maximal par défaut
  }

  const lum1 = getRelativeLuminance(rgb1)
  const lum2 = getRelativeLuminance(rgb2)

  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)

  const ratio = (brightest + 0.05) / (darkest + 0.05)
  return parseFloat(ratio.toFixed(2))
}

/**
 * Fournit une évaluation qualitative du ratio de contraste pour la scannabilité d'un QR code
 */
export function getContrastAssessment(ratio: number): ContrastAssessment {
  if (ratio >= 7) {
    return {
      ratio,
      level: 'excellent',
      message: 'Excellent contraste. Lisibilité et scannabilité optimales.',
      isScannable: true
    }
  }

  if (ratio >= 4) {
    return {
      ratio,
      level: 'good',
      message: 'Bon contraste conforme aux normes de lisibilité.',
      isScannable: true
    }
  }

  if (ratio >= 2.5) {
    return {
      ratio,
      level: 'warning',
      message: 'Contraste modéré. Risque de lenteur ou d’échec sur certains smartphones.',
      isScannable: false
    }
  }

  return {
    ratio,
    level: 'danger',
    message: 'Contraste insuffisant (< 2.5:1). Le QR code sera probablement illisible.',
    isScannable: false
  }
}
