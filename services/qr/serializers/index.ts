import type {
  QrContent,
  QrUrlData,
  QrTextData,
  QrWifiData,
  QrVCardData,
  QrEmailData,
  QrSmsData,
  QrPhoneData,
  QrGeoData,
  QrEventData,
  QrCustomData
} from '~/types/content'

/**
 * Échappe les caractères réservés pour la syntaxe standard Wi-Fi (RFC / ZXing)
 * Caractères à échapper : \, ;, :, ,, "
 */
export function escapeWifiString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/:/g, '\\:')
    .replace(/,/g, '\\,')
    .replace(/"/g, '\\"')
}

/**
 * 1. Sérialisation URL
 */
export function serializeUrl(data: QrUrlData): string {
  const trimmed = data.url.trim()
  if (!trimmed) return ''
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

/**
 * 2. Sérialisation Texte brut
 */
export function serializeText(data: QrTextData): string {
  return data.text
}

/**
 * 3. Sérialisation Wi-Fi
 * Format : WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<password>;H:<true|false>;;
 */
export function serializeWifi(data: QrWifiData): string {
  const ssid = escapeWifiString(data.ssid.trim())
  const enc = data.encryption
  let passwordPart = ''

  if (enc !== 'nopass' && data.password) {
    const pwd = escapeWifiString(data.password)
    passwordPart = `P:${pwd};`
  }

  const hiddenPart = data.hidden ? 'H:true;' : 'H:false;'

  return `WIFI:S:${ssid};T:${enc};${passwordPart}${hiddenPart};`
}

/**
 * 4. Sérialisation vCard 3.0
 */
export function serializeVCard(data: QrVCardData): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  const lastName = (data.lastName ?? '').trim()
  const firstName = (data.firstName ?? '').trim()
  lines.push(`N:${lastName};${firstName};;;`)

  const formattedName = [firstName, lastName].filter(Boolean).join(' ')
  lines.push(`FN:${formattedName || 'Contact'}`)

  if (data.organization?.trim()) {
    lines.push(`ORG:${data.organization.trim()}`)
  }

  if (data.jobTitle?.trim()) {
    lines.push(`TITLE:${data.jobTitle.trim()}`)
  }

  if (data.phoneWork?.trim()) {
    lines.push(`TEL;TYPE=WORK,VOICE:${data.phoneWork.trim()}`)
  }

  if (data.phoneMobile?.trim()) {
    lines.push(`TEL;TYPE=CELL,VOICE:${data.phoneMobile.trim()}`)
  }

  if (data.email?.trim()) {
    lines.push(`EMAIL;TYPE=INTERNET:${data.email.trim()}`)
  }

  if (data.website?.trim()) {
    const url = data.website.trim()
    lines.push(`URL:${/^https?:\/\//i.test(url) ? url : `https://${url}`}`)
  }

  const hasAddress =
    data.addressStreet?.trim() ||
    data.addressCity?.trim() ||
    data.addressPostalCode?.trim() ||
    data.addressCountry?.trim()

  if (hasAddress) {
    const street = (data.addressStreet ?? '').trim()
    const city = (data.addressCity ?? '').trim()
    const postalCode = (data.addressPostalCode ?? '').trim()
    const country = (data.addressCountry ?? '').trim()
    lines.push(`ADR;TYPE=WORK:;;${street};${city};;${postalCode};${country}`)
  }

  if (data.note?.trim()) {
    lines.push(`NOTE:${data.note.trim().replace(/\n/g, '\\n')}`)
  }

  lines.push('END:VCARD')
  return lines.join('\n')
}

/**
 * 5. Sérialisation E-mail
 */
export function serializeEmail(data: QrEmailData): string {
  const email = data.email.trim()
  const params: string[] = []

  if (data.subject?.trim()) {
    params.push(`subject=${encodeURIComponent(data.subject.trim())}`)
  }

  if (data.body?.trim()) {
    params.push(`body=${encodeURIComponent(data.body.trim())}`)
  }

  return params.length > 0 ? `mailto:${email}?${params.join('&')}` : `mailto:${email}`
}

/**
 * 6. Sérialisation SMS
 */
export function serializeSms(data: QrSmsData): string {
  const phone = data.phoneNumber.trim().replace(/\s+/g, '')
  const message = data.message ? `:${data.message.trim()}` : ''
  return `smsto:${phone}${message}`
}

/**
 * 7. Sérialisation Téléphone
 */
export function serializePhone(data: QrPhoneData): string {
  const phone = data.phoneNumber.trim().replace(/\s+/g, '')
  return `tel:${phone}`
}

/**
 * 8. Sérialisation Géo
 */
export function serializeGeo(data: QrGeoData): string {
  const base = `geo:${data.latitude},${data.longitude}`
  if (data.query?.trim()) {
    return `${base}?q=${encodeURIComponent(data.query.trim())}`
  }
  return base
}

/**
 * Formate une date au format UTC iCalendar YYYYMMDDTHHmmssZ ou YYYYMMDD
 */
export function formatICalDate(dateStr: string, allDay: boolean): string {
  if (allDay) {
    const isoDatePrefix = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (isoDatePrefix) {
      return `${isoDatePrefix[1]}${isoDatePrefix[2]}${isoDatePrefix[3]}`
    }
  }

  const d = new Date(dateStr)
  if (isNaN(d.getTime())) {
    return ''
  }

  if (allDay) {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  const year = d.getUTCFullYear()
  const month = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  const hours = String(d.getUTCHours()).padStart(2, '0')
  const minutes = String(d.getUTCMinutes()).padStart(2, '0')
  const seconds = String(d.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * 9. Sérialisation Événement (iCalendar)
 */
export function serializeEvent(data: QrEventData): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${data.title.trim()}`
  ]

  if (data.location?.trim()) {
    lines.push(`LOCATION:${data.location.trim()}`)
  }

  if (data.description?.trim()) {
    lines.push(`DESCRIPTION:${data.description.trim().replace(/\n/g, '\\n')}`)
  }

  const startFormatted = formatICalDate(data.startDate, data.allDay)
  const endFormatted = formatICalDate(data.endDate, data.allDay)

  if (data.allDay) {
    if (startFormatted) lines.push(`DTSTART;VALUE=DATE:${startFormatted}`)
    if (endFormatted) lines.push(`DTEND;VALUE=DATE:${endFormatted}`)
  } else {
    if (startFormatted) lines.push(`DTSTART:${startFormatted}`)
    if (endFormatted) lines.push(`DTEND:${endFormatted}`)
  }

  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\n')
}

/**
 * 10. Sérialisation Données personnalisées
 */
export function serializeCustom(data: QrCustomData): string {
  return data.rawPayload
}

/**
 * Point d'entrée principal pour sérialiser n'importe quel QrContent
 */
export function serializeQrContent(content: QrContent): string {
  switch (content.type) {
    case 'URL':
      return serializeUrl(content)
    case 'TEXT':
      return serializeText(content)
    case 'WIFI':
      return serializeWifi(content)
    case 'VCARD':
      return serializeVCard(content)
    case 'EMAIL':
      return serializeEmail(content)
    case 'SMS':
      return serializeSms(content)
    case 'PHONE':
      return serializePhone(content)
    case 'GEO':
      return serializeGeo(content)
    case 'EVENT':
      return serializeEvent(content)
    case 'CUSTOM':
      return serializeCustom(content)
    default:
      return ''
  }
}
