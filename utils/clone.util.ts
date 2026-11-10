/**
 * Effectue une copie profonde sûre d'objets sérialisables (contenu & design QR)
 * afin d'éviter toute mutation accidentelle des constantes globales par défaut.
 */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

