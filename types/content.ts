/**
 * Types de contenus pris en charge par QR Studio
 */
export type QrContentType =
  | 'URL'
  | 'TEXT'
  | 'WIFI'
  | 'VCARD'
  | 'EMAIL'
  | 'SMS'
  | 'PHONE'
  | 'GEO'
  | 'EVENT'
  | 'CUSTOM'

// 1. URL
export interface QrUrlData {
  type: 'URL'
  url: string
}

// 2. Texte libre
export interface QrTextData {
  type: 'TEXT'
  text: string
}

// 3. Réseau Wi-Fi
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass'

export interface QrWifiData {
  type: 'WIFI'
  ssid: string
  password?: string
  encryption: WifiEncryption
  hidden: boolean
}

// 4. Contact vCard
export interface QrVCardData {
  type: 'VCARD'
  firstName: string
  lastName: string
  organization?: string
  jobTitle?: string
  phoneWork?: string
  phoneMobile?: string
  email?: string
  website?: string
  addressStreet?: string
  addressCity?: string
  addressPostalCode?: string
  addressCountry?: string
  note?: string
}

// 5. E-mail pré-rempli
export interface QrEmailData {
  type: 'EMAIL'
  email: string
  subject?: string
  body?: string
}

// 6. SMS pré-rempli
export interface QrSmsData {
  type: 'SMS'
  phoneNumber: string
  message?: string
}

// 7. Appel téléphonique direct
export interface QrPhoneData {
  type: 'PHONE'
  phoneNumber: string
}

// 8. Coordonnées géographiques GPS
export interface QrGeoData {
  type: 'GEO'
  latitude: number
  longitude: number
  query?: string
}

// 9. Événement calendrier
export interface QrEventData {
  type: 'EVENT'
  title: string
  location?: string
  description?: string
  startDate: string
  endDate: string
  allDay: boolean
}

// 10. Données personnalisées brutes
export interface QrCustomData {
  type: 'CUSTOM'
  rawPayload: string
}

/**
 * Union discriminée représentant l'ensemble des contenus possibles
 */
export type QrContent =
  | QrUrlData
  | QrTextData
  | QrWifiData
  | QrVCardData
  | QrEmailData
  | QrSmsData
  | QrPhoneData
  | QrGeoData
  | QrEventData
  | QrCustomData

export const DEFAULT_CONTENTS: Record<QrContentType, QrContent> = {
  URL: {
    type: 'URL',
    url: 'https://qrstudio.app'
  },
  TEXT: {
    type: 'TEXT',
    text: 'Bienvenue sur QR Studio !'
  },
  WIFI: {
    type: 'WIFI',
    ssid: 'MonReseauWifi',
    password: 'motdepassewifi',
    encryption: 'WPA',
    hidden: false
  },
  VCARD: {
    type: 'VCARD',
    firstName: 'Jean',
    lastName: 'Dupont',
    organization: 'Mon Entreprise',
    jobTitle: 'Consultant',
    phoneMobile: '+33612345678',
    email: 'contact@exemple.fr',
    website: 'https://monsite.fr'
  },
  EMAIL: {
    type: 'EMAIL',
    email: 'contact@qrstudio.app',
    subject: 'Renseignement',
    body: 'Bonjour, je vous contacte concernant...'
  },
  SMS: {
    type: 'SMS',
    phoneNumber: '+33612345678',
    message: 'Bonjour !'
  },
  PHONE: {
    type: 'PHONE',
    phoneNumber: '+33123456789'
  },
  GEO: {
    type: 'GEO',
    latitude: 48.8584,
    longitude: 2.2945,
    query: 'Tour Eiffel'
  },
  EVENT: {
    type: 'EVENT',
    title: 'Conférence Tech',
    location: 'Paris',
    description: 'Présentation des nouveautés',
    startDate: '2026-11-15T09:00',
    endDate: '2026-11-15T18:00',
    allDay: false
  },
  CUSTOM: {
    type: 'CUSTOM',
    rawPayload: 'RAW-DATA-STREAM'
  }
}
