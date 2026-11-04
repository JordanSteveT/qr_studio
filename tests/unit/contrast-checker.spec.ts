import { describe, it, expect } from 'vitest'
import {
  hexToRgb,
  getRelativeLuminance,
  calculateContrastRatio,
  getContrastAssessment
} from '~/services/qr/contrast-checker.service'

describe('Services / ContrastCheckerService (QR-005)', () => {
  it('convertit correctement les codes hexadécimaux 3 et 6 caractères', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 })
    expect(hexToRgb('invalid')).toBeNull()
  })

  it('calcule la luminance relative selon WCAG 2.1', () => {
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0)
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBe(1)
  })

  it('calcule un ratio de 21:1 entre le noir et le blanc', () => {
    const ratio = calculateContrastRatio('#000000', '#ffffff')
    expect(ratio).toBe(21)
  })

  it('calcule un ratio de 1:1 entre deux couleurs identiques', () => {
    const ratio = calculateContrastRatio('#ffffff', '#ffffff')
    expect(ratio).toBe(1)
  })

  it('fournit les évaluations de scannabilité correctes', () => {
    expect(getContrastAssessment(21).level).toBe('excellent')
    expect(getContrastAssessment(21).isScannable).toBe(true)

    expect(getContrastAssessment(5).level).toBe('good')
    expect(getContrastAssessment(5).isScannable).toBe(true)

    expect(getContrastAssessment(3).level).toBe('warning')
    expect(getContrastAssessment(3).isScannable).toBe(false)

    expect(getContrastAssessment(1.5).level).toBe('danger')
    expect(getContrastAssessment(1.5).isScannable).toBe(false)
  })
})
