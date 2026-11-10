import type { QrDesign } from '~/types/design'
import type { QrExportRequest } from '~/types/export'
import { FrameComposerService } from '~/services/qr/frame-composer.service'

/**
 * Service pur d'exportation haute résolution de QR codes (Client-Side Only)
 */
export class ExportService {
  /**
   * Construit la configuration de base pour qr-code-styling lors de l'export
   */
  private static buildExportOptions(
    data: string,
    design: QrDesign,
    size: number,
    type: 'canvas' | 'svg'
  ): Record<string, unknown> {
    const dotsOptions: Record<string, unknown> = {
      type: design.dots.type,
      color: design.dots.color
    }
    if (design.dots.gradient) {
      dotsOptions.gradient = design.dots.gradient
    }

    const cornersSquareOptions: Record<string, unknown> = {
      type: design.cornersSquare.type,
      color: design.cornersSquare.color
    }

    const cornersDotOptions: Record<string, unknown> = {
      type: design.cornersDot.type,
      color: design.cornersDot.color
    }

    const backgroundOptions: Record<string, unknown> = {
      color: design.background.isTransparent ? 'transparent' : design.background.color
    }
    if (design.background.gradient && !design.background.isTransparent) {
      backgroundOptions.gradient = design.background.gradient
    }

    const qrConfig: Record<string, unknown> = {
      width: size,
      height: size,
      type,
      data: data || 'https://qrstudio.app',
      margin: design.margin,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: design.errorCorrectionLevel
      },
      dotsOptions,
      cornersSquareOptions,
      cornersDotOptions,
      backgroundOptions
    }

    if (design.logo.hasLogo && design.logo.logoDataUrl) {
      qrConfig.image = design.logo.logoDataUrl
      qrConfig.imageOptions = {
        hideBackgroundDots: design.logo.hideBackgroundDots,
        imageSize: design.logo.imageSize,
        margin: design.logo.margin,
        crossOrigin: 'anonymous'
      }
    }

    return qrConfig
  }

  /**
   * Génère le Blob haute définition pour le format demandé
   */
  public static async generateExportBlob(request: QrExportRequest): Promise<Blob> {
    if (typeof window === 'undefined') {
      throw new Error('L\'exportation de QR code doit être exécutée côté client.')
    }

    const { format, data, design, resolution = 2048 } = request

    // Import dynamique universel de qr-code-styling
    const mod = await import('qr-code-styling')
    const QRCodeStyling =
      typeof mod.default === 'function'
        ? mod.default
        : typeof (mod as unknown) === 'function'
        ? (mod as unknown)
        : (mod as Record<string, unknown>).default

    // Traitement spécifique SVG
    if (format === 'svg') {
      const qrConfig = this.buildExportOptions(data, design, 1024, 'svg')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const qrInstance = new (QRCodeStyling as any)(qrConfig)
      const rawBlob = await qrInstance.getRawData('svg')

      if (!rawBlob) {
        throw new Error('Échec de la génération du fichier SVG.')
      }

      // Si un cadre est configuré, on enrichit le SVG
      if (design.frame && design.frame.type !== 'none') {
        const svgString = typeof rawBlob.text === 'function' ? await rawBlob.text() : String(rawBlob)
        const composedSvg = FrameComposerService.composeSvg(svgString, design.frame)
        return new Blob([composedSvg], { type: 'image/svg+xml;charset=utf-8' })
      }

      return rawBlob instanceof Blob ? rawBlob : new Blob([rawBlob], { type: 'image/svg+xml;charset=utf-8' })
    }

    // Traitement Matriciel (PNG, JPEG, WebP)
    // Sécurisation JPEG : interdiction du fond transparent qui deviendrait noir
    let effectiveDesign = design
    if (format === 'jpeg' && design.background.isTransparent) {
      effectiveDesign = {
        ...design,
        background: {
          ...design.background,
          isTransparent: false,
          color: '#ffffff'
        }
      }
    }

    const qrConfig = this.buildExportOptions(data, effectiveDesign, resolution, 'canvas')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qrInstance = new (QRCodeStyling as any)(qrConfig)

    // Si un cadre est présent, attendre le dessin complet du canvas avant de composer le cadre
    if (effectiveDesign.frame && effectiveDesign.frame.type !== 'none') {
      let sourceCanvas: HTMLCanvasElement | null = null

      if (typeof qrInstance._getElement === 'function') {
        const el = await qrInstance._getElement(format)
        if (el && el.tagName === 'CANVAS') {
          sourceCanvas = el as HTMLCanvasElement
        }
      }

      if (!sourceCanvas) {
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        document.body.appendChild(tempContainer)

        try {
          qrInstance.append(tempContainer)
          if (qrInstance._canvasDrawingPromise) {
            await qrInstance._canvasDrawingPromise
          }
          sourceCanvas = tempContainer.querySelector('canvas')
        } finally {
          if (tempContainer.parentNode) {
            tempContainer.parentNode.removeChild(tempContainer)
          }
        }
      }

      if (sourceCanvas) {
        const composedCanvas = FrameComposerService.composeCanvas(sourceCanvas, effectiveDesign.frame)
        const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
        const quality = format === 'jpeg' ? 0.95 : format === 'webp' ? 0.92 : undefined

        return await new Promise<Blob>((resolve, reject) => {
          composedCanvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Échec de la conversion du canvas en image.'))
            },
            mimeType,
            quality
          )
        })
      }
    }

    // Export direct via qrInstance.getRawData() si aucun cadre décoratif
    const rawData = await qrInstance.getRawData(format)
    if (!rawData) {
      throw new Error(`Échec de la génération de l'image au format ${format}.`)
    }

    const mimeType =
      format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'

    return rawData instanceof Blob ? rawData : new Blob([rawData], { type: mimeType })
  }
}
