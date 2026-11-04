import { DEFAULT_QR_DESIGN, type QrDesign } from '~/types/design'

export interface QrRenderOptions {
  data: string
  width?: number
  height?: number
  design?: QrDesign
  type?: 'canvas' | 'svg'
}

/**
 * Service pur TypeScript encapsulant qr-code-styling de manière SSR-safe.
 */
export class QrEngineService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private qrInstance: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private qrCodeStylingClass: any = null
  private container: HTMLElement | null = null
  private currentOptions: QrRenderOptions | null = null

  /**
   * Construit la configuration compatible avec qr-code-styling
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private buildQrCodeStylingOptions(options: QrRenderOptions): any {
    const { data, width = 320, height = 320, design = DEFAULT_QR_DESIGN, type = 'svg' } = options

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
      width,
      height,
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
    } else {
      qrConfig.image = ''
    }

    return qrConfig
  }

  /**
   * Initialise le moteur et monte le QR code dans le conteneur cible côté client
   */
  public async init(container: HTMLElement, options: QrRenderOptions): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    this.container = container
    this.currentOptions = options

    try {
      // Import dynamique pour garantir la conformité SSR et compatibilité ESM/CJS Vite
      const mod = await import('qr-code-styling')
      const QRCodeStyling =
        typeof mod.default === 'function'
          ? mod.default
          : typeof (mod as unknown) === 'function'
          ? (mod as unknown)
          : (mod as Record<string, unknown>).default

      this.qrCodeStylingClass = QRCodeStyling
      const stylingOptions = this.buildQrCodeStylingOptions(options)

      this.qrInstance = new this.qrCodeStylingClass(stylingOptions)

      // Nettoyage préalable du conteneur
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }

      const appendResult = this.qrInstance.append(container)
      if (appendResult && typeof appendResult.then === 'function') {
        await appendResult
      }
    } catch (err: unknown) {
      console.error('[QrEngineService] Échec d\'initialisation du moteur QR:', err)
      throw err
    }
  }

  /**
   * Met à jour réactivement les données et styles
   */
  public update(options: Partial<QrRenderOptions>): void {
    if (!this.qrInstance || !this.currentOptions) {
      return
    }

    const currentDesign = this.currentOptions.design ?? DEFAULT_QR_DESIGN
    const updatedDesign: QrDesign = options.design
      ? { ...currentDesign, ...options.design }
      : currentDesign

    this.currentOptions = {
      ...this.currentOptions,
      ...options,
      design: updatedDesign
    }

    const stylingOptions = this.buildQrCodeStylingOptions(this.currentOptions)

    // Réinstanciation systématique et propre dans le conteneur cible.
    // Cela élimine définitivement les bugs de mutation interne de qr-code-styling (conflits de
    // clipPath SVG, deep merge d'options qui ignore les clés supprimées ou fait disparaître le SVG).
    if (this.container && this.qrCodeStylingClass) {
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild)
      }
      this.qrInstance = new this.qrCodeStylingClass(stylingOptions)
      const appendResult = this.qrInstance.append(this.container)
      if (appendResult && typeof appendResult.catch === 'function') {
        appendResult.catch((err: unknown) => console.warn('[QrEngineService] Warning append update:', err))
      }
      return
    }

    this.qrInstance.update(stylingOptions)
  }

  /**
   * Récupère le Blob binaire du rendu actuel
   */
  public async getRawData(extension: 'png' | 'svg' | 'jpeg' | 'webp' = 'png'): Promise<Blob | null> {
    if (!this.qrInstance) {
      return null
    }

    try {
      const buffer = await this.qrInstance.getRawData(extension)
      if (buffer instanceof Blob) {
        return buffer
      }
      return new Blob([buffer])
    } catch (err) {
      console.error('Erreur lors de la récupération des données brutes du QR code:', err)
      return null
    }
  }

  /**
   * Nettoie les ressources
   */
  public destroy(): void {
    if (this.container) {
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild)
      }
    }
    this.qrInstance = null
    this.container = null
    this.currentOptions = null
  }
}
