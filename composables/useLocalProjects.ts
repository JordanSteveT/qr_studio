import { ref, onMounted } from 'vue'
import { ProjectStorageService } from '~/services/storage/project-storage.service'
import type { QrProjectEntity, QrProjectJsonExport } from '~/types/project'
import type { QrContent } from '~/types/content'
import type { QrDesign } from '~/types/design'

/**
 * Composable Vue 3 pour la gestion réactive des projets locaux (IndexedDB)
 */
export function useLocalProjects() {
  const storageService = new ProjectStorageService()

  const projects = ref<QrProjectEntity[]>([])
  const isLoading = ref(false)
  const errorMessage = ref<string | null>(null)

  /**
   * Recharge la liste de tous les projets locaux
   */
  const loadProjects = async () => {
    if (typeof window === 'undefined') return
    isLoading.value = true
    errorMessage.value = null
    try {
      projects.value = await storageService.getAllProjects()
    } catch (err) {
      console.error('[useLocalProjects] Erreur de chargement:', err)
      errorMessage.value = 'Impossible de charger vos projets locaux.'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Sauvegarde un projet (création ou mise à jour)
   */
  const saveProject = async (project: {
    id?: string | undefined
    name: string
    content: QrContent
    design: QrDesign
    thumbnailDataUrl: string
    logoBlob?: Blob | undefined
  }): Promise<QrProjectEntity> => {
    errorMessage.value = null
    try {
      const saved = await storageService.saveProject(project)
      await loadProjects()
      return saved
    } catch (err) {
      console.error('[useLocalProjects] Erreur de sauvegarde:', err)
      errorMessage.value = 'Échec de la sauvegarde locale.'
      throw err
    }
  }

  /**
   * Récupère un projet par son ID
   */
  const getProject = async (id: string): Promise<QrProjectEntity | undefined> => {
    return storageService.getProjectById(id)
  }

  /**
   * Supprime un projet
   */
  const deleteProject = async (id: string): Promise<void> => {
    errorMessage.value = null
    try {
      await storageService.deleteProject(id)
      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err) {
      console.error('[useLocalProjects] Erreur de suppression:', err)
      errorMessage.value = 'Impossible de supprimer ce projet.'
      throw err
    }
  }

  /**
   * Duplique un projet
   */
  const duplicateProject = async (id: string): Promise<QrProjectEntity> => {
    errorMessage.value = null
    try {
      const duplicated = await storageService.duplicateProject(id)
      await loadProjects()
      return duplicated
    } catch (err) {
      console.error('[useLocalProjects] Erreur de duplication:', err)
      errorMessage.value = 'Impossible de dupliquer ce projet.'
      throw err
    }
  }

  /**
   * Efface l'intégralité des projets stockés (droit à l'effacement)
   */
  const clearAllProjects = async (): Promise<void> => {
    errorMessage.value = null
    try {
      await storageService.clearAll()
      projects.value = []
    } catch (err) {
      console.error('[useLocalProjects] Erreur de suppression globale:', err)
      errorMessage.value = 'Impossible de réinitialiser la base locale.'
      throw err
    }
  }

  /**
   * Exporte un projet en objet JSON autonome
   */
  const exportProjectToJson = (project: QrProjectEntity): QrProjectJsonExport => {
    return storageService.exportToJson(project)
  }

  /**
   * Valide et importe une chaîne de caractères JSON
   */
  const importProjectFromJson = (jsonStr: string): QrProjectJsonExport => {
    return storageService.importFromJsonString(jsonStr)
  }

  onMounted(() => {
    loadProjects()
  })

  return {
    projects,
    isLoading,
    errorMessage,
    loadProjects,
    saveProject,
    getProject,
    deleteProject,
    duplicateProject,
    clearAllProjects,
    exportProjectToJson,
    importProjectFromJson
  }
}
