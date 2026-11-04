import { z } from 'zod'

/**
 * Expression régulière pour valider les numéros de téléphone internationaux
 */
export const PHONE_REGEX = /^\+?[0-9\s\-().]{3,30}$/

/**
 * 1. Schéma URL
 */
export const urlContentSchema = z.object({
  type: z.literal('URL'),
  url: z
    .string()
    .trim()
    .min(1, 'L’adresse URL est obligatoire')
    .refine((val) => {
      try {
        const full = /^https?:\/\//i.test(val) ? val : `https://${val}`
        const url = new URL(full)
        return url.hostname.includes('.') && url.hostname.length >= 3
      } catch {
        return false
      }
    }, 'Format d’URL invalide (ex: https://monsite.fr)')
})

/**
 * 2. Schéma Texte libre
 */
export const textContentSchema = z.object({
  type: z.literal('TEXT'),
  text: z.string().min(1, 'Le texte ne peut pas être vide')
})

/**
 * 3. Schéma Wi-Fi
 */
export const wifiContentSchema = z
  .object({
    type: z.literal('WIFI'),
    ssid: z
      .string()
      .trim()
      .min(1, 'Le nom du réseau (SSID) est obligatoire')
      .max(32, 'Le SSID ne peut pas dépasser 32 caractères'),
    encryption: z.enum(['WPA', 'WEP', 'nopass']),
    password: z.string().optional(),
    hidden: z.boolean().default(false)
  })
  .superRefine((data, ctx) => {
    if (data.encryption !== 'nopass') {
      const pwd = data.password ?? ''
      if (!pwd || pwd.length < (data.encryption === 'WPA' ? 8 : 5)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            data.encryption === 'WPA'
              ? 'Le mot de passe WPA/WPA2 doit comporter au moins 8 caractères'
              : 'Le mot de passe WEP doit comporter au moins 5 caractères',
          path: ['password']
        })
      }
    }
  })

/**
 * 4. Schéma vCard 3.0
 */
export const vcardContentSchema = z
  .object({
    type: z.literal('VCARD'),
    firstName: z.string().trim().default(''),
    lastName: z.string().trim().default(''),
    organization: z.string().trim().optional(),
    jobTitle: z.string().trim().optional(),
    phoneWork: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || PHONE_REGEX.test(val), 'Numéro de téléphone professionnel invalide'),
    phoneMobile: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || PHONE_REGEX.test(val), 'Numéro de portable invalide'),
    email: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || z.string().email().safeParse(val).success, 'Adresse e-mail invalide'),
    website: z
      .string()
      .trim()
      .optional()
      .refine((val) => {
        if (!val) return true
        try {
          const full = /^https?:\/\//i.test(val) ? val : `https://${val}`
          return new URL(full).hostname.includes('.')
        } catch {
          return false
        }
      }, 'URL de site web invalide'),
    addressStreet: z.string().trim().optional(),
    addressCity: z.string().trim().optional(),
    addressPostalCode: z.string().trim().optional(),
    addressCountry: z.string().trim().optional(),
    note: z.string().trim().optional()
  })
  .refine(
    (data) => (data.firstName && data.firstName.length > 0) || (data.lastName && data.lastName.length > 0),
    {
      message: 'Veuillez renseigner au moins un nom ou un prénom',
      path: ['lastName']
    }
  )

/**
 * 5. Schéma E-mail
 */
export const emailContentSchema = z.object({
  type: z.literal('EMAIL'),
  email: z.string().trim().email('Adresse e-mail invalide'),
  subject: z.string().trim().optional(),
  body: z.string().trim().optional()
})

/**
 * 6. Schéma SMS
 */
export const smsContentSchema = z.object({
  type: z.literal('SMS'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Le numéro de destinataire est obligatoire')
    .refine((val) => PHONE_REGEX.test(val), 'Numéro de téléphone invalide'),
  message: z.string().trim().optional()
})

/**
 * 7. Schéma Téléphone
 */
export const phoneContentSchema = z.object({
  type: z.literal('PHONE'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Le numéro de téléphone est obligatoire')
    .refine((val) => PHONE_REGEX.test(val), 'Numéro de téléphone invalide')
})

/**
 * 8. Schéma Géo
 */
export const geoContentSchema = z.object({
  type: z.literal('GEO'),
  latitude: z
    .number({ invalid_type_error: 'La latitude doit être un nombre' })
    .min(-90, 'La latitude doit être comprise entre -90 et +90')
    .max(90, 'La latitude doit être comprise entre -90 et +90'),
  longitude: z
    .number({ invalid_type_error: 'La longitude doit être un nombre' })
    .min(-180, 'La longitude doit être comprise entre -180 et +180')
    .max(180, 'La longitude doit être comprise entre -180 et +180'),
  query: z.string().trim().optional()
})

/**
 * 9. Schéma Événement (iCalendar)
 */
export const eventContentSchema = z
  .object({
    type: z.literal('EVENT'),
    title: z.string().trim().min(1, 'Le titre de l’événement est obligatoire'),
    location: z.string().trim().optional(),
    description: z.string().trim().optional(),
    startDate: z.string().min(1, 'La date de début est obligatoire'),
    endDate: z.string().min(1, 'La date de fin est obligatoire'),
    allDay: z.boolean().default(false)
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate).getTime()
      const end = new Date(data.endDate).getTime()
      if (isNaN(start) || isNaN(end)) return true
      return end >= start
    },
    {
      message: 'La date de fin ne peut pas être antérieure à la date de début',
      path: ['endDate']
    }
  )

/**
 * 10. Schéma Données brutes
 */
export const customContentSchema = z.object({
  type: z.literal('CUSTOM'),
  rawPayload: z.string().min(1, 'Le contenu brut ne peut pas être vide')
})

/**
 * Schéma unifié global pour n'importe quel QrContent
 */
export const qrContentSchema = z.union([
  urlContentSchema,
  textContentSchema,
  wifiContentSchema,
  vcardContentSchema,
  emailContentSchema,
  smsContentSchema,
  phoneContentSchema,
  geoContentSchema,
  eventContentSchema,
  customContentSchema
])
