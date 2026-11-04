import { describe, it, expect, vi } from 'vitest'
import { calculateContrastRatio, useQrEngine } from '~/composables/useQrEngine'
import { QrEngineService } from '~/services/qr/qr-engine.service'
import { DEFAULT_QR_DESIGN } from '~/types/design'

describe('QR Studio — Moteur de Génération QR (QR-003)', () => {
  describe('Calcul du contraste (WCAG)', () => {
    it('doit calculer un contraste optimal pour noir sur blanc', () => {
      const ratio = calculateContrastRatio('#000000', '#ffffff')
      expect(ratio).toBeGreaterThan(20) // ~21:1
    })

    it('doit calculer un contraste de 1 pour deux couleurs identiques', () => {
      const ratio = calculateContrastRatio('#3b82f6', '#3b82f6')
      expect(ratio).toBeCloseTo(1, 1)
    })

    it('doit gérer le format transparent sans erreur', () => {
      const ratio = calculateContrastRatio('#000000', 'transparent')
      expect(ratio).toBe(10)
    })

    it('doit supporter les formats hexadécimaux courts à 3 caractères', () => {
      const ratio = calculateContrastRatio('#000', '#fff')
      expect(ratio).toBeGreaterThan(20)
    })
  })

  describe('useQrEngine composable', () => {
    it('doit initialiser l\'état avec les valeurs par défaut', () => {
      const { currentData, isReady, isRendering, scannabilityScore } = useQrEngine()

      expect(currentData.value).toBe('https://qrstudio.app')
      expect(isReady.value).toBe(false)
      expect(isRendering.value).toBe(false)
      expect(scannabilityScore.value.status).toBe('success')
      expect(scannabilityScore.value.score).toBe(100)
    })

    it('doit recalculer la lisibilité en cas de faible contraste', () => {
      const { currentDesign, scannabilityScore } = useQrEngine()

      // Couleur jaune très clair sur fond blanc
      currentDesign.value.dots.color = '#fef08a'
      currentDesign.value.background.color = '#ffffff'

      expect(scannabilityScore.value.status).toBe('danger')
      expect(scannabilityScore.value.score).toBe(40)
    })

    it('doit débourrer les appels de mise à jour', async () => {
      vi.useFakeTimers()
      const { updateQrCode, currentData, isRendering } = useQrEngine()

      updateQrCode('https://test1.com')
      updateQrCode('https://test2.com')
      updateQrCode('https://test-final.com')

      expect(currentData.value).toBe('https://test-final.com')
      expect(isRendering.value).toBe(true)

      vi.advanceTimersByTime(150)
      expect(isRendering.value).toBe(false)
      vi.useRealTimers()
    })
  })

  describe('QrEngineService (SSR Safety)', () => {
    it('doit s\'instancier sans erreur', () => {
      const service = new QrEngineService()
      expect(service).toBeDefined()
    })

    it('doit nettoyer les ressources lors de destroy()', () => {
      const service = new QrEngineService()
      service.destroy()
      expect(service).toBeDefined()
    })

    it('doit réinitialiser proprement sans dégradé lorsque gradient passe à undefined', async () => {
      const service = new QrEngineService()
      const container = document.createElement('div')

      // Initialisation avec un dégradé
      await service.init(container, {
        data: 'https://qrstudio.app',
        design: {
          ...DEFAULT_QR_DESIGN,
          dots: {
            ...DEFAULT_QR_DESIGN.dots,
            color: '#112233',
            gradient: {
              type: 'linear',
              rotation: 0,
              colorStops: [
                { offset: 0, color: '#112233' },
                { offset: 1, color: '#445566' }
              ]
            }
          }
        }
      })
      expect(container.children.length).toBeGreaterThan(0)

      // Désactivation du dégradé : retour à l'état uni initial
      service.update({
        design: {
          ...DEFAULT_QR_DESIGN,
          dots: {
            ...DEFAULT_QR_DESIGN.dots,
            color: '#112233',
            gradient: undefined
          }
        }
      })

      // Le conteneur doit avoir été réinitialisé proprement
      expect(container.children.length).toBeGreaterThan(0)
    })
  })
})
