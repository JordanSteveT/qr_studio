/**
 * Utilitaire pur d'assainissement de fichiers SVG pour l'incrustation sécurisée de logos.
 * Neutralise les vecteurs XSS potentiels (<script>, <foreignObject>, on*, javascript:).
 */

/**
 * Nettoie une chaîne SVG brute avant son encodage Data-URL.
 */
export function sanitizeSvgContent(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== 'string') {
    return ''
  }

  let cleaned = rawSvg
    // Supprimer les blocs <script>...</script> et auto-fermants
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/\s*>/gi, '')
    // Supprimer <foreignObject> pouvant contenir du HTML actif
    .replace(/<foreignObject\b[^>]*>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<foreignObject\b[^>]*\/\s*>/gi, '')
    // Supprimer <iframe>, <object>, <embed>
    .replace(/<(iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(iframe|object|embed)\b[^>]*\/\s*>/gi, '')
    // Supprimer les gestionnaires d'événements inline (onload=, onclick=, onerror=, etc.)
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Neutraliser les URI javascript: / data:text/html dans href / xlink:href / src
    .replace(/(href|xlink:href|src)\s*=\s*(?:"\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^"]*"|'\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^']*')/gi, '$1="#"')

  // Assurer que la chaîne contient au moins une balise <svg
  if (!/<svg[\s>]/i.test(cleaned)) {
    return ''
  }

  return cleaned
}

/**
 * Encode une chaîne UTF-8 en Base64 sans erreur sur les caractères non-ASCII.
 */
export function utf8ToBase64(str: string): string {
  if (typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(str)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i]
      if (byte !== undefined) {
        binary += String.fromCharCode(byte)
      }
    }
    return btoa(binary)
  }
  return btoa(unescape(encodeURIComponent(str)))
}

