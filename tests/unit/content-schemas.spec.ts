import { describe, it, expect } from 'vitest'
import {
  urlContentSchema,
  wifiContentSchema,
  vcardContentSchema,
  emailContentSchema,
  geoContentSchema,
  eventContentSchema,
  qrContentSchema
} from '~/services/validation/content.schema'

describe('Services / Schémas de validation Zod de contenu', () => {
  it('Valide une URL correcte et rejette une URL invalide', () => {
    expect(urlContentSchema.safeParse({ type: 'URL', url: 'https://qrstudio.app' }).success).toBe(true)
    expect(urlContentSchema.safeParse({ type: 'URL', url: 'qrstudio.app' }).success).toBe(true)
    expect(urlContentSchema.safeParse({ type: 'URL', url: '   ' }).success).toBe(false)
    expect(urlContentSchema.safeParse({ type: 'URL', url: 'invalid-url' }).success).toBe(false)
  })

  it('Valide la configuration Wi-Fi et contrôle la taille minimale du mot de passe', () => {
    // WPA avec mot de passe valide (>= 8 chars)
    expect(
      wifiContentSchema.safeParse({
        type: 'WIFI',
        ssid: 'MonWifi',
        encryption: 'WPA',
        password: 'password123',
        hidden: false
      }).success
    ).toBe(true)

    // WPA avec mot de passe trop court (< 8 chars)
    expect(
      wifiContentSchema.safeParse({
        type: 'WIFI',
        ssid: 'MonWifi',
        encryption: 'WPA',
        password: 'short',
        hidden: false
      }).success
    ).toBe(false)

    // Wi-Fi ouvert sans mot de passe
    expect(
      wifiContentSchema.safeParse({
        type: 'WIFI',
        ssid: 'WifiPublic',
        encryption: 'nopass',
        hidden: false
      }).success
    ).toBe(true)
  })

  it('Valide la présence minimale d’un nom ou prénom pour la vCard', () => {
    expect(
      vcardContentSchema.safeParse({
        type: 'VCARD',
        firstName: 'Jean',
        lastName: ''
      }).success
    ).toBe(true)

    expect(
      vcardContentSchema.safeParse({
        type: 'VCARD',
        firstName: '',
        lastName: ''
      }).success
    ).toBe(false)
  })

  it('Valide les formats email', () => {
    expect(emailContentSchema.safeParse({ type: 'EMAIL', email: 'test@example.com' }).success).toBe(true)
    expect(emailContentSchema.safeParse({ type: 'EMAIL', email: 'invalid-email' }).success).toBe(false)
  })

  it('Valide les limites de latitude (-90 à +90) et longitude (-180 à +180)', () => {
    expect(geoContentSchema.safeParse({ type: 'GEO', latitude: 45, longitude: 2 }).success).toBe(true)
    expect(geoContentSchema.safeParse({ type: 'GEO', latitude: 95, longitude: 2 }).success).toBe(false)
    expect(geoContentSchema.safeParse({ type: 'GEO', latitude: 45, longitude: 200 }).success).toBe(false)
  })

  it('Valide que la date de fin d’événement est postérieure ou égale à la date de début', () => {
    expect(
      eventContentSchema.safeParse({
        type: 'EVENT',
        title: 'Réunion',
        startDate: '2026-11-15T10:00:00.000Z',
        endDate: '2026-11-15T11:00:00.000Z',
        allDay: false
      }).success
    ).toBe(true)

    expect(
      eventContentSchema.safeParse({
        type: 'EVENT',
        title: 'Réunion',
        startDate: '2026-11-15T12:00:00.000Z',
        endDate: '2026-11-15T11:00:00.000Z',
        allDay: false
      }).success
    ).toBe(false)
  })

  it('Union discriminée qrContentSchema valide l’ensemble des types', () => {
    expect(qrContentSchema.safeParse({ type: 'URL', url: 'https://test.com' }).success).toBe(true)
    expect(qrContentSchema.safeParse({ type: 'TEXT', text: 'Mon message' }).success).toBe(true)
    expect(qrContentSchema.safeParse({ type: 'CUSTOM', rawPayload: 'TEST' }).success).toBe(true)
  })
})
