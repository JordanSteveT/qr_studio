export type QrDotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded'

export type QrCornerSquareType = 'square' | 'dot' | 'extra-rounded' | 'classy' | 'none'
export type QrCornerDotType = 'square' | 'dot' | 'none'

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrColorStop {
  offset: number
  color: string
}

export interface QrGradient {
  type: 'linear' | 'radial'
  rotation: number
  colorStops: [QrColorStop, QrColorStop, ...QrColorStop[]]
}

export interface QrDotsDesign {
  color: string
  type: QrDotType
  gradient?: QrGradient | undefined
}

export interface QrCornersSquareDesign {
  color: string
  type: QrCornerSquareType
}

export interface QrCornersDotDesign {
  color: string
  type: QrCornerDotType
}

export interface QrBackgroundDesign {
  color: string
  isTransparent: boolean
  gradient?: QrGradient | undefined
}

export interface QrLogoSettings {
  hasLogo: boolean
  imageSize: number
  margin: number
  hideBackgroundDots: boolean
  logoMimeType?: string | undefined
  logoFileName?: string | undefined
  logoDataUrl?: string | undefined
}

export type QrFrameType =
  | 'none'
  | 'bottom-badge'
  | 'top-badge'
  | 'full-card'
  | 'speech-bubble'

export interface QrFrameSettings {
  type: QrFrameType
  text: string
  textColor: string
  frameColor: string
  fontFamily: string
}

export interface QrDesign {
  dots: QrDotsDesign
  cornersSquare: QrCornersSquareDesign
  cornersDot: QrCornersDotDesign
  background: QrBackgroundDesign
  logo: QrLogoSettings
  frame: QrFrameSettings
  errorCorrectionLevel: QrErrorCorrectionLevel
  margin: number
}

/**
 * Valeurs par défaut recommandées pour un design de QR code
 */
export const DEFAULT_QR_DESIGN: QrDesign = {
  dots: {
    color: '#1a1523',
    type: 'rounded'
  },
  cornersSquare: {
    color: '#1a1523',
    type: 'extra-rounded'
  },
  cornersDot: {
    color: '#1a1523',
    type: 'dot'
  },
  background: {
    color: '#ffffff',
    isTransparent: false
  },
  logo: {
    hasLogo: false,
    imageSize: 0.25,
    margin: 5,
    hideBackgroundDots: true
  },
  frame: {
    type: 'none',
    text: 'SCANNEZ-MOI',
    textColor: '#fff8ee',
    frameColor: '#1a1523',
    fontFamily: 'Onest, system-ui, sans-serif'
  },
  errorCorrectionLevel: 'M',
  margin: 10
}
