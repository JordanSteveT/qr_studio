import { describe, it, expect } from 'vitest'
import {
  escapeWifiString,
  serializeUrl,
  serializeText,
  serializeWifi,
  serializeVCard,
  serializeEmail,
  serializeSms,
  serializePhone,
  serializeGeo,
  serializeEvent,
  serializeCustom,
  serializeQrContent
} from '~/services/qr/serializers'

describe('Services / Sérialiseurs de QR codes', () => {
  it('1. URL : normalise et préfixe https si nécessaire', () => {
    expect(serializeUrl({ type: 'URL', url: 'qrstudio.app' })).toBe('https://qrstudio.app')
    expect(serializeUrl({ type: 'URL', url: 'https://example.com/page?id=12' })).toBe('https://example.com/page?id=12')
    expect(serializeUrl({ type: 'URL', url: 'http://test.local' })).toBe('http://test.local')
  })

  it('2. Texte : renvoie la chaîne textuelle brute sans altération', () => {
    const raw = 'Ceci est un texte libre avec accents : é, à, ç, et retour\nà la ligne.'
    expect(serializeText({ type: 'TEXT', text: raw })).toBe(raw)
  })

  it('3. Wi-Fi : échappe correctement les caractères spéciaux (RFC / ZXing)', () => {
    // CA-TYP-01 : SSID MonReseau, Mot de passe Secret;123
    const wifiData = {
      type: 'WIFI' as const,
      ssid: 'MonReseau;Maison',
      password: 'Secret;123"\\,',
      encryption: 'WPA' as const,
      hidden: false
    }
    const result = serializeWifi(wifiData)
    expect(result).toBe('WIFI:S:MonReseau\\;Maison;T:WPA;P:Secret\\;123\\"\\\\\\,;H:false;;')

    // Wi-Fi ouvert
    const openWifi = {
      type: 'WIFI' as const,
      ssid: 'Public WiFi',
      encryption: 'nopass' as const,
      hidden: true
    }
    expect(serializeWifi(openWifi)).toBe('WIFI:S:Public WiFi;T:nopass;H:true;;')
  })

  it('4. vCard 3.0 : génère une fiche vCard conforme sans champs superflus', () => {
    const vcard = {
      type: 'VCARD' as const,
      firstName: 'Alice',
      lastName: 'Dupont',
      organization: 'Acme Corp',
      jobTitle: 'Ingénieure',
      phoneMobile: '+33612345678',
      email: 'alice@acme.com',
      website: 'acme.com',
      addressStreet: '10 rue de la Paix',
      addressCity: 'Paris',
      addressPostalCode: '75001',
      addressCountry: 'France',
      note: 'Rencontrée au salon'
    }

    const result = serializeVCard(vcard)
    expect(result).toContain('BEGIN:VCARD')
    expect(result).toContain('VERSION:3.0')
    expect(result).toContain('N:Dupont;Alice;;;')
    expect(result).toContain('FN:Alice Dupont')
    expect(result).toContain('ORG:Acme Corp')
    expect(result).toContain('TEL;TYPE=CELL,VOICE:+33612345678')
    expect(result).toContain('EMAIL;TYPE=INTERNET:alice@acme.com')
    expect(result).toContain('URL:https://acme.com')
    expect(result).toContain('ADR;TYPE=WORK:;;10 rue de la Paix;Paris;;75001;France')
    expect(result).toContain('NOTE:Rencontrée au salon')
    expect(result).toContain('END:VCARD')
  })

  it('5. E-mail : génère le lien mailto avec sujet et corps encodés', () => {
    const emailData = {
      type: 'EMAIL' as const,
      email: 'contact@qrstudio.app',
      subject: 'Demande de démo',
      body: 'Bonjour,\nJe souhaite une démo.'
    }
    const result = serializeEmail(emailData)
    expect(result).toBe(
      'mailto:contact@qrstudio.app?subject=Demande%20de%20d%C3%A9mo&body=Bonjour%2C%0AJe%20souhaite%20une%20d%C3%A9mo.'
    )
  })

  it('6. SMS : génère le schéma smsto: standard', () => {
    const sms = {
      type: 'SMS' as const,
      phoneNumber: '+33 6 12 34 56 78',
      message: 'Code de validation: 9876'
    }
    expect(serializeSms(sms)).toBe('smsto:+33612345678:Code de validation: 9876')
  })

  it('7. Téléphone : génère le schéma tel:', () => {
    expect(serializePhone({ type: 'PHONE', phoneNumber: '+33 1 40 50 60 70' })).toBe('tel:+33140506070')
  })

  it('8. Géo : génère le schéma geo: avec coordonnées GPS et libellé', () => {
    expect(serializeGeo({ type: 'GEO', latitude: 48.8584, longitude: 2.2945, query: 'Tour Eiffel' })).toBe(
      'geo:48.8584,2.2945?q=Tour%20Eiffel'
    )
    expect(serializeGeo({ type: 'GEO', latitude: 48.8584, longitude: 2.2945 })).toBe('geo:48.8584,2.2945')
  })

  it('9. Événement : génère le format iCalendar VEVENT standard', () => {
    const event = {
      type: 'EVENT' as const,
      title: 'Conférence Web 2026',
      location: 'Palais des Congrès',
      description: 'Présentation de QR Studio',
      startDate: '2026-11-15T09:00:00.000Z',
      endDate: '2026-11-15T18:00:00.000Z',
      allDay: false
    }
    const result = serializeEvent(event)
    expect(result).toContain('BEGIN:VCALENDAR')
    expect(result).toContain('BEGIN:VEVENT')
    expect(result).toContain('SUMMARY:Conférence Web 2026')
    expect(result).toContain('LOCATION:Palais des Congrès')
    expect(result).toContain('DTSTART:20261115T090000Z')
    expect(result).toContain('DTEND:20261115T180000Z')
    expect(result).toContain('END:VEVENT')
  })

  it('10. Custom : sérialise les données brutes', () => {
    expect(serializeCustom({ type: 'CUSTOM', rawPayload: 'RAW_DATA_12345' })).toBe('RAW_DATA_12345')
  })

  it('Point d’entrée unifié serializeQrContent dispatche sur tous les types', () => {
    expect(serializeQrContent({ type: 'URL', url: 'test.com' })).toBe('https://test.com')
    expect(serializeQrContent({ type: 'TEXT', text: 'hello' })).toBe('hello')
  })
})
