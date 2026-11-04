/**
 * Nettoie une chaîne pour en faire un nom de fichier valide et intelligible
 */
export function sanitizeFileName(name: string, extension: string): string {
  const cleanExtension = extension.replace(/^\./, '').toLowerCase()

  const safeName = (name || 'qr-code')
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '') // Supprime les accents
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-') // Remplace les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, '') // Supprime les tirets de début/fin
    .slice(0, 50) || 'qr-code'

  return `qr-studio-${safeName}.${cleanExtension}`
}

/**
 * Déclenche le téléchargement d'un Blob dans le navigateur
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()

  // Révocation différée pour libérer immédiatement la mémoire vive
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  }, 1000)
}

/**
 * Déclenche le téléchargement d'un contenu texte (ex: SVG, JSON)
 */
export function downloadText(content: string, fileName: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  downloadBlob(blob, fileName)
}
