import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { QrStudioDatabase } from '~/services/storage/db.service'
import { ProjectStorageService } from '~/services/storage/project-storage.service'
import { DEFAULT_CONTENTS } from '~/types/content'
import { DEFAULT_QR_DESIGN } from '~/types/design'

describe('QR Studio — Persistance Locale IndexedDB (QR-007)', () => {
  let db: QrStudioDatabase
  let storageService: ProjectStorageService

  beforeEach(() => {
    db = new QrStudioDatabase()
    storageService = new ProjectStorageService(db)
  })

  afterEach(async () => {
    await db.delete()
  })

  it('doit sauvegarder un nouveau projet et le retrouver par son ID', async () => {
    const saved = await storageService.saveProject({
      name: 'Mon Restaurant Wi-Fi',
      content: { type: 'WIFI', ssid: 'LeBistrot', encryption: 'WPA', hidden: false, password: 'password123' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:image/png;base64,sample'
    })

    expect(saved.id).toBeDefined()
    expect(saved.name).toBe('Mon Restaurant Wi-Fi')
    expect(saved.schemaVersion).toBe(1)
    expect(saved.createdAt).toBeGreaterThan(0)
    expect(saved.content.type).toBe('WIFI')

    const found = await storageService.getProjectById(saved.id)
    expect(found).toBeDefined()
    expect(found?.name).toBe('Mon Restaurant Wi-Fi')
  })

  it('doit mettre à jour un projet existant sans modifier son createdAt', async () => {
    const initial = await storageService.saveProject({
      name: 'Initial Name',
      content: { type: 'URL', url: 'https://qrstudio.app' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:image/png;base64,1'
    })

    // Attente brève pour garantir updatedAt > createdAt
    await new Promise(r => setTimeout(r, 10))

    const updated = await storageService.saveProject({
      id: initial.id,
      name: 'Updated Name',
      content: { type: 'URL', url: 'https://updated.org' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:image/png;base64,2'
    })

    expect(updated.id).toBe(initial.id)
    expect(updated.name).toBe('Updated Name')
    expect(updated.createdAt).toBe(initial.createdAt)
    expect(updated.updatedAt).toBeGreaterThanOrEqual(initial.updatedAt)

    const all = await storageService.getAllProjects()
    expect(all.length).toBe(1)
    expect(all[0]?.name).toBe('Updated Name')
  })

  it('doit dupliquer un projet avec le préfixe Copie de', async () => {
    const original = await storageService.saveProject({
      name: 'Projet Principal',
      content: { type: 'EMAIL', email: 'contact@domain.com' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:image/png;base64,thumb'
    })

    const copy = await storageService.duplicateProject(original.id)
    expect(copy.id).not.toBe(original.id)
    expect(copy.name).toBe('Copie de Projet Principal')
    expect(copy.content).toEqual(original.content)

    const all = await storageService.getAllProjects()
    expect(all.length).toBe(2)
  })

  it('doit supprimer un projet ciblé', async () => {
    const prj1 = await storageService.saveProject({
      name: 'Projet 1',
      content: { type: 'URL', url: 'https://qrstudio.app' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:1'
    })
    const prj2 = await storageService.saveProject({
      name: 'Projet 2',
      content: { type: 'URL', url: 'https://qrstudio.app' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:2'
    })

    await storageService.deleteProject(prj1.id)

    const all = await storageService.getAllProjects()
    expect(all.length).toBe(1)
    expect(all[0]?.id).toBe(prj2.id)
  })

  it('doit vider tous les projets via clearAll', async () => {
    await storageService.saveProject({
      name: 'P1',
      content: { type: 'URL', url: 'https://qrstudio.app' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:1'
    })
    await storageService.saveProject({
      name: 'P2',
      content: { type: 'URL', url: 'https://qrstudio.app' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:2'
    })

    await storageService.clearAll()
    const all = await storageService.getAllProjects()
    expect(all.length).toBe(0)
  })

  it('doit exporter en JSON et réimporter avec validation de schéma', async () => {
    const prj = await storageService.saveProject({
      name: 'Test Export',
      content: { type: 'TEXT', text: 'Hello World' },
      design: { ...DEFAULT_QR_DESIGN },
      thumbnailDataUrl: 'data:thumb'
    })

    const exported = storageService.exportToJson(prj)
    expect(exported.app).toBe('QR Studio')
    expect(exported.schemaVersion).toBe(1)
    expect(exported.name).toBe('Test Export')

    const jsonString = JSON.stringify(exported)
    const imported = storageService.importFromJsonString(jsonString)
    expect(imported.name).toBe('Test Export')
    expect(imported.content.type).toBe('TEXT')
  })

  it('doit rejeter un JSON invalide ou corrompu à l\'import', () => {
    expect(() => storageService.importFromJsonString('{ invalid json'))
      .toThrow('Le fichier sélectionné n\'est pas un JSON valide.')

    const invalidSchema = {
      app: 'Another App',
      schemaVersion: 99,
      content: { type: 'INVALID' }
    }
    expect(() => storageService.importFromJsonString(JSON.stringify(invalidSchema)))
      .toThrow('Fichier projet invalide')
  })
})
