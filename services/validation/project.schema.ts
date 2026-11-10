import { z } from 'zod'
import { qrContentSchema } from './content.schema'

const SAFE_IMAGE_DATA_URL_REGEX = /^data:image\/(png|jpeg|jpg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/i

export const qrGradientStopSchema = z.object({
  offset: z.number().min(0).max(1),
  color: z.string().min(1)
})

export const qrGradientSchema = z.object({
  type: z.enum(['linear', 'radial']),
  rotation: z.number(),
  colorStops: z.array(qrGradientStopSchema).min(2)
})

export const qrDotsDesignSchema = z.object({
  color: z.string().min(1),
  type: z.enum(['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded']),
  gradient: qrGradientSchema.optional()
})

export const qrCornersSquareDesignSchema = z.object({
  color: z.string().min(1),
  type: z.enum(['dot', 'square', 'extra-rounded', 'classy', 'none'])
})

export const qrCornersDotDesignSchema = z.object({
  color: z.string().min(1),
  type: z.enum(['dot', 'square', 'none'])
})

export const qrBackgroundDesignSchema = z.object({
  color: z.string().min(1),
  isTransparent: z.boolean(),
  gradient: qrGradientSchema.optional()
})

export const qrLogoSettingsSchema = z.object({
  hasLogo: z.boolean(),
  logoDataUrl: z
    .string()
    .refine((val) => val === '' || SAFE_IMAGE_DATA_URL_REGEX.test(val), 'Format Data URL de logo invalide')
    .optional(),
  imageSize: z.number().min(0.05).max(0.5),
  margin: z.number().min(0).max(50),
  hideBackgroundDots: z.boolean(),
  logoMimeType: z.string().optional(),
  logoFileName: z.string().optional()
})

export const qrFrameSettingsSchema = z.object({
  type: z.enum(['none', 'bottom-badge', 'top-badge', 'full-card', 'speech-bubble']),
  text: z.string().max(40),
  textColor: z.string().min(1),
  frameColor: z.string().min(1),
  fontFamily: z.string().min(1)
})

export const qrDesignSchema = z.object({
  dots: qrDotsDesignSchema,
  cornersSquare: qrCornersSquareDesignSchema,
  cornersDot: qrCornersDotDesignSchema,
  background: qrBackgroundDesignSchema,
  logo: qrLogoSettingsSchema,
  frame: qrFrameSettingsSchema,
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']),
  margin: z.number().min(0).max(100)
})

/**
 * Schéma Zod strict pour la validation des imports JSON de projet
 */
export const projectJsonExportSchema = z.object({
  app: z.literal('QR Studio'),
  schemaVersion: z.number().int().min(1).max(1),
  exportedAt: z.string().min(1),
  name: z.string().min(1, 'Le nom du projet est obligatoire').max(60),
  content: qrContentSchema,
  design: qrDesignSchema,
  logoBase64: z
    .string()
    .refine((val) => val === '' || SAFE_IMAGE_DATA_URL_REGEX.test(val), 'Format Data URL de logo invalide')
    .optional()
})
