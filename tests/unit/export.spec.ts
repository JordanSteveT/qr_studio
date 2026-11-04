import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { sanitizeFileName, downloadBlob, downloadText } from '~/utils/download.util'
import { ExportService } from '~/services/export/export.service'
import { DEFAULT_QR_DESIGN } from '~/types/design'
import QrExportPanel from '~/components/qr/QrExportPanel.vue'

// Polyfill toBlob pour l'environnement headless de test (happy-dom sans canvas natif C++)
beforeAll(() => {
  HTMLCanvasElement.prototype.toBlob = function(callback: (blob: Blob | null) => void, type = 'image/png') {
    const blob = new Blob(['mock-binary-data'], { type })
    callback(blob)
  }
})

describe('QR Studio — Moteur d\'Export Haute Définition (QR-006)', () => {
  describe('Utilitaire de téléchargement (download.util.ts)', () => {
    it('doit assainir correctement les noms de fichiers et retirer les accents', () => {
      const fileName = sanitizeFileName('Mon Événement & Café 2026 !', 'png')
      expect(fileName).toBe('qr-studio-mon-evenement-cafe-2026.png')
    })

    it('doit utiliser un nom par défaut si la chaîne est vide', () => {
      const fileName = sanitizeFileName('', 'svg')
      expect(fileName).toBe('qr-studio-qr-code.svg')
    })

    it('doit nettoyer l\'extension précédée d\'un point', () => {
      const fileName = sanitizeFileName('test', '.JPEG')
      expect(fileName).toBe('qr-studio-test.jpeg')
    })

    it('doit déclencher downloadBlob sans erreur', () => {
      const blob = new Blob(['test-content'], { type: 'text/plain' })
      const clickSpy = vi.fn()

      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName)
        if (tagName === 'a') {
          el.click = clickSpy
        }
        return el
      })

      downloadBlob(blob, 'test.png')
      expect(clickSpy).toHaveBeenCalled()
      vi.restoreAllMocks()
    })

    it('doit déclencher downloadText pour exporter des configurations texte ou SVG', () => {
      const clickSpy = vi.fn()
      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const el = originalCreateElement(tagName)
        if (tagName === 'a') {
          el.click = clickSpy
        }
        return el
      })

      downloadText('<svg></svg>', 'test.svg', 'image/svg+xml')
      expect(clickSpy).toHaveBeenCalled()
      vi.restoreAllMocks()
    })
  })

  describe('ExportService (Génération binaire & vectorielle)', () => {
    it('doit générer un Blob SVG vectoriel', async () => {
      const blob = await ExportService.generateExportBlob({
        format: 'svg',
        data: 'https://qrstudio.app',
        design: DEFAULT_QR_DESIGN
      })

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toContain('image/svg+xml')
      const text = await blob.text()
      expect(text).toContain('<svg')
    })

    it('doit intégrer un cadre dans le SVG lors de l\'export', async () => {
      const blob = await ExportService.generateExportBlob({
        format: 'svg',
        data: 'https://qrstudio.app',
        design: {
          ...DEFAULT_QR_DESIGN,
          frame: {
            type: 'bottom-badge',
            text: 'SCAN ME',
            frameColor: '#ff0000',
            textColor: '#ffffff',
            fontFamily: 'Inter, sans-serif'
          }
        }
      })

      const text = await blob.text()
      expect(text).toContain('SCAN ME')
      expect(text).toContain('#ff0000')
    })

    it('doit forcer un fond opaque pour l\'export JPEG si le fond initial était transparent', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buildOptionsSpy = vi.spyOn(ExportService as any, 'buildExportOptions')

      const mod = await import('qr-code-styling')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const QRCodeStyling = (mod as any).default || mod
      vi.spyOn(QRCodeStyling.prototype, 'getRawData').mockResolvedValueOnce(new Blob(['mock-jpeg'], { type: 'image/jpeg' }))

      const blob = await ExportService.generateExportBlob({
        format: 'jpeg',
        data: 'https://qrstudio.app',
        design: {
          ...DEFAULT_QR_DESIGN,
          background: {
            ...DEFAULT_QR_DESIGN.background,
            isTransparent: true,
            color: '#000000'
          }
        },
        resolution: 1024
      })

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/jpeg')

      // Règle métier : le fond doit être forcé à blanc opaque pour le format JPEG
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const passedDesign = (buildOptionsSpy.mock.calls as any)[0][1]
      expect(passedDesign.background.isTransparent).toBe(false)
      expect(passedDesign.background.color).toBe('#ffffff')

      buildOptionsSpy.mockRestore()
    })
  })

  describe('Composant QrExportPanel', () => {
    it('doit afficher les boutons d\'action primaire et secondaires', () => {
      const wrapper = mount(QrExportPanel, {
        props: {
          data: 'https://qrstudio.app',
          design: DEFAULT_QR_DESIGN,
          projectName: 'Mon Test'
        }
      })

      expect(wrapper.find('.btn-primary-download').text()).toContain('Télécharger PNG')
      expect(wrapper.find('.btn-primary-download').text()).toContain('2048 px')

      const secondaryButtons = wrapper.findAll('.btn-sec-export')
      expect(secondaryButtons.length).toBe(4) // SVG, JPEG, WebP, Imprimer
    })

    it('doit permettre de basculer la résolution PNG', async () => {
      const wrapper = mount(QrExportPanel, {
        props: {
          data: 'https://qrstudio.app',
          design: DEFAULT_QR_DESIGN,
          projectName: 'Mon Test'
        }
      })

      // Ouvrir le menu des résolutions
      await wrapper.find('.resolution-toggle-btn').trigger('click')
      expect(wrapper.find('.resolution-menu').exists()).toBe(true)

      // Cliquer sur UHD (4096 px)
      const items = wrapper.findAll('.resolution-item')
      const uhdItem = items.find(item => item.text().includes('4096 px'))
      expect(uhdItem).toBeDefined()
      await uhdItem?.trigger('click')

      expect(wrapper.find('.btn-primary-download').text()).toContain('4096 px')
    })
  })
})
