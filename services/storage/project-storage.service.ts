import { getDatabase, QrStudioDatabase } from './db.service'
import type { QrProjectEntity, QrProjectJsonExport } from '~/types/project'
import { projectJsonExportSchema } from '~/services/validation/project.schema'
import type { QrContent } from '~/types/content'
import type { QrDesign } from '~/types/design'
import { sanitizeSvgContent, utf8ToBase64 } from '~/utils/svg-sanitizer.util'

export class ProjectStorageService {
  private db: QrStudioDatabase

  constructor(customDb?: QrStudioDatabase) {
    this.db = customDb ?? getDatabase()
  }

  /**
   * Récupère tous les projets triés du plus récent au plus ancien
   */
  public async getAllProjects(): Promise<QrProjectEntity[]> {
    return this.db.projects.orderBy('updatedAt').reverse().toArray()
  }

  /**
   * Récupère un projet par son ID
   */
  public async getProjectById(id: string): Promise<QrProjectEntity | undefined> {
    return this.db.projects.get(id)
  }

  /**
   * Sauvegarde un projet (création ou mise à jour)
   */
  public async saveProject(project: {
    id?: string | undefined
    name: string
    content: QrContent
    design: QrDesign
    thumbnailDataUrl: string
    logoBlob?: Blob | undefined
  }): Promise<QrProjectEntity> {
    const now = Date.now()
    const id = project.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prj_${now}_${Math.random().toString(36).substring(2, 9)}`)

    const existing = project.id ? await this.db.projects.get(project.id) : undefined

    const entity: QrProjectEntity = {
      id,
      name: project.name.trim() || 'Mon QR Code',
      schemaVersion: 1,
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
      content: JSON.parse(JSON.stringify(project.content)),
      design: JSON.parse(JSON.stringify(project.design)),
      thumbnailDataUrl: project.thumbnailDataUrl,
      ...(project.logoBlob ? { logoBlob: project.logoBlob } : {})
    }

    await this.db.projects.put(entity)
    return entity
  }

  /**
   * Supprime un projet par son ID
   */
  public async deleteProject(id: string): Promise<void> {
    await this.db.projects.delete(id)
  }

  /**
   * Duplique un projet existant
   */
  public async duplicateProject(id: string): Promise<QrProjectEntity> {
    const original = await this.db.projects.get(id)
    if (!original) {
      throw new Error(`Projet avec l'ID ${id} introuvable.`)
    }

    const now = Date.now()
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `prj_${now}_${Math.random().toString(36).substring(2, 9)}`

    const duplicated: QrProjectEntity = {
      ...JSON.parse(JSON.stringify(original)),
      id: newId,
      name: `Copie de ${original.name}`,
      createdAt: now,
      updatedAt: now,
      ...(original.logoBlob ? { logoBlob: original.logoBlob } : {})
    }

    await this.db.projects.put(duplicated)
    return duplicated
  }

  /**
   * Efface l'intégralité des projets stockés en local (droit à l'effacement)
   */
  public async clearAll(): Promise<void> {
    await this.db.projects.clear()
  }

  /**
   * Exporte un projet sous forme d'objet JSON autonome
   */
  public exportToJson(project: QrProjectEntity): QrProjectJsonExport {
    const exportData: QrProjectJsonExport = {
      app: 'QR Studio',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      name: project.name,
      content: JSON.parse(JSON.stringify(project.content)),
      design: JSON.parse(JSON.stringify(project.design)),
      ...(project.design.logo?.logoDataUrl ? { logoBase64: project.design.logo.logoDataUrl } : {})
    }
    return exportData
  }

  /**
   * Valide et importe une chaîne JSON ou un objet JSON
   */
  public importFromJsonString(jsonString: string): QrProjectJsonExport {
    let parsed: unknown
    try {
      parsed = JSON.parse(jsonString)
    } catch {
      throw new Error('Le fichier sélectionné n\'est pas un JSON valide.')
    }

    const validationResult = projectJsonExportSchema.safeParse(parsed)
    if (!validationResult.success) {
      const firstIssue = validationResult.error.issues[0]
      const msg = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Format de configuration QR Studio non conforme.'
      throw new Error(`Fichier projet invalide : ${msg}`)
    }

    const data = validationResult.data as QrProjectJsonExport

    // Si un logo SVG est embarqué dans le JSON importé, l'assainir avant usage
    const rawLogo = data.design.logo?.logoDataUrl || data.logoBase64
    if (rawLogo && /^data:image\/svg\+xml;base64,/i.test(rawLogo)) {
      try {
        const base64Part = rawLogo.split(',')[1] ?? ''
        const decoded = atob(base64Part)
        const sanitized = sanitizeSvgContent(decoded)
        const safeUrl = sanitized ? `data:image/svg+xml;base64,${utf8ToBase64(sanitized)}` : undefined
        data.design.logo.logoDataUrl = safeUrl
        if (!safeUrl) {
          data.design.logo.hasLogo = false
        }
      } catch {
        data.design.logo.logoDataUrl = undefined
        data.design.logo.hasLogo = false
      }
    }

    return data
  }
}
