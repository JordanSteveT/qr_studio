import { describe, it, expect } from 'vitest'
import { FrameComposerService } from '~/services/qr/frame-composer.service'
import type { QrFrameSettings } from '~/types/design'

describe('Services / FrameComposerService (QR-005)', () => {
  it('calcule des dimensions inchangées pour le style "none"', () => {
    const frame: QrFrameSettings = {
      type: 'none',
      text: '',
      textColor: '#ffffff',
      frameColor: '#000000',
      fontFamily: 'sans-serif'
    }
    const dims = FrameComposerService.calculateDimensions(300, 300, frame)
    expect(dims.totalWidth).toBe(300)
    expect(dims.totalHeight).toBe(300)
    expect(dims.qrOffsetX).toBe(0)
    expect(dims.qrOffsetY).toBe(0)
  })

  it('ajoute de la hauteur supplémentaire pour le style "bottom-badge"', () => {
    const frame: QrFrameSettings = {
      type: 'bottom-badge',
      text: 'SCAN ME',
      textColor: '#ffffff',
      frameColor: '#3b82f6',
      fontFamily: 'sans-serif'
    }
    const dims = FrameComposerService.calculateDimensions(300, 300, frame)
    expect(dims.totalWidth).toBeGreaterThan(300)
    expect(dims.totalHeight).toBeGreaterThan(300)
    expect(dims.qrOffsetX).toBeGreaterThan(0)
    expect(dims.qrOffsetY).toBeGreaterThan(0)
  })

  it('compose un SVG vectoriel incluant les balises de cadre et le texte d’appel', () => {
    const sourceSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><path d="M0 0h10v10H0z"/></svg>'
    const frame: QrFrameSettings = {
      type: 'bottom-badge',
      text: 'SCANNEZ-MOI',
      textColor: '#ffffff',
      frameColor: '#6366f1',
      fontFamily: 'sans-serif'
    }

    const composed = FrameComposerService.composeSvg(sourceSvg, frame)
    expect(composed).toContain('SCANNEZ-MOI')
    expect(composed).toContain('fill="#6366f1"')
    expect(composed).toContain('<text')
    expect(composed).toContain('<rect')
  })

  it('retourne le SVG source tel quel si style est "none"', () => {
    const sourceSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><path d="M0 0h10v10H0z"/></svg>'
    const frame: QrFrameSettings = {
      type: 'none',
      text: '',
      textColor: '#ffffff',
      frameColor: '#000000',
      fontFamily: 'sans-serif'
    }

    expect(FrameComposerService.composeSvg(sourceSvg, frame)).toBe(sourceSvg)
  })
})
