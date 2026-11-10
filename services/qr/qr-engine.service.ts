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
  private renderGeneration = 0

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
   * Remplace atomiquement le contenu du conteneur cible par la nouvelle instance rendue.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private commitInstanceToContainer(instance: any): void {
    if (!this.container) return

    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild)
    }

    const appendResult = instance.append(this.container)
    if (appendResult && typeof appendResult.catch === 'function') {
      appendResult.catch((err: unknown) => console.warn('[QrEngineService] Warning append:', err))
    }
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
    const generation = ++this.renderGeneration

    try {
      const mod = await import('qr-code-styling')
      const QRCodeStyling =
        typeof mod.default === 'function'
          ? mod.default
          : typeof (mod as unknown) === 'function'
          ? (mod as unknown)
          : (mod as Record<string, unknown>).default

      this.qrCodeStylingClass = QRCodeStyling
      const stylingOptions = this.buildQrCodeStylingOptions(options)

      const instance = new this.qrCodeStylingClass(stylingOptions)
      this.qrInstance = instance

      const drawingPromise = instance._svgDrawingPromise || instance._canvasDrawingPromise
      if (drawingPromise && typeof drawingPromise.then === 'function') {
        await drawingPromise
      }

      if (generation !== this.renderGeneration || !this.container) {
        return
      }

      this.commitInstanceToContainer(instance)
    } catch (err: unknown) {
      console.error('[QrEngineService] Échec d\'initialisation du moteur QR:', err)
      throw err
    }
  }

  /**
   * Met à jour immédiatement les données et styles sans flash blanc (swap atomique).
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
    const generation = ++this.renderGeneration

    if (this.container && this.qrCodeStylingClass) {
      const nextInstance = new this.qrCodeStylingClass(stylingOptions)
      const drawingPromise = nextInstance._svgDrawingPromise || nextInstance._canvasDrawingPromise

      if (drawingPromise && typeof drawingPromise.then === 'function') {
        // Garde l'ancien rendu visible pendant la micro-génération du nouveau SVG (0 flash)
        drawingPromise
          .then(() => {
            if (generation !== this.renderGeneration || !this.container) {
              return
            }
            this.qrInstance = nextInstance
            this.commitInstanceToContainer(nextInstance)
          })
          .catch((err: unknown) => {
            console.warn('[QrEngineService] Warning draw update:', err)
          })
        return
      }

      this.qrInstance = nextInstance
      this.commitInstanceToContainer(nextInstance)
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
    this.renderGeneration++
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
