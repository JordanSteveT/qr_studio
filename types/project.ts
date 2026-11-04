import type { QrContent } from './content'
import type { QrDesign } from './design'

/**
 * Entité complète persistée dans IndexedDB (table 'projects')
 */
export interface QrProjectEntity {
  id: string                   // UUID v4 unique
  name: string                 // Nom donné par l'utilisateur ou auto-généré
  schemaVersion: number        // Version de schéma courante : 1
  createdAt: number            // Timestamp en millisecondes
  updatedAt: number            // Timestamp en millisecondes
  content: QrContent           // Données structurées du contenu
  design: QrDesign             // Options complètes de personnalisation graphique
  logoBlob?: Blob              // Fichier binaire du logo (isolé pour la performance)
  thumbnailDataUrl: string     // Vignette miniature Data-URL (128x128 px)
}

/**
 * Format d'échange pour l'import / export de configuration au format JSON autonome
 */
export interface QrProjectJsonExport {
  app: 'QR Studio'
  schemaVersion: number
  exportedAt: string           // Date ISO
  name: string
  content: QrContent
  design: QrDesign
  logoBase64?: string          // Chaîne data:image/...;base64,... si un logo est présent
}
