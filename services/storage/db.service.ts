import Dexie, { type EntityTable } from 'dexie'
import type { QrProjectEntity } from '~/types/project'

/**
 * Base de données locale IndexedDB de QR Studio
 */
export class QrStudioDatabase extends Dexie {
  projects!: EntityTable<QrProjectEntity, 'id'>

  constructor() {
    super('QrStudioDB')

    // Schéma version 1 : table projects indexée sur id, name, schemaVersion, createdAt, updatedAt
    this.version(1).stores({
      projects: 'id, name, schemaVersion, createdAt, updatedAt'
    })
  }
}

// Instance singleton côté client
let dbInstance: QrStudioDatabase | null = null

export function getDatabase(): QrStudioDatabase {
  if (!dbInstance) {
    dbInstance = new QrStudioDatabase()
  }
  return dbInstance
}
