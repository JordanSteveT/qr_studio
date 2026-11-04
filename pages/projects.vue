<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocalProjects } from '~/composables/useLocalProjects'
import type { QrProjectEntity } from '~/types/project'
import ProjectCard from '~/components/projects/ProjectCard.vue'
import ProjectEmptyState from '~/components/projects/ProjectEmptyState.vue'
import { downloadBlob, sanitizeFileName } from '~/utils/download.util'
import {
  FolderOpen,
  PlusCircle,
  Search,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-vue-next'

useSeoMeta({
  title: 'Mes Projets Locaux — QR Studio',
  description: 'Gérez vos QR codes sauvegardés en local, dupliquez, exportez ou importez vos configurations.'
})

const router = useRouter()
const {
  projects,
  isLoading,
  errorMessage,
  deleteProject,
  duplicateProject,
  clearAllProjects,
  exportProjectToJson,
  importProjectFromJson,
  saveProject
} = useLocalProjects()

const searchQuery = ref('')
const selectedTypeFilter = ref<string>('ALL')
const isConfirmDeleteAllOpen = ref(false)
const notificationMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

const showToast = (text: string, type: 'success' | 'error' = 'success') => {
  notificationMessage.value = { text, type }
  setTimeout(() => {
    notificationMessage.value = null
  }, 4000)
}

// Filtrage réactif des projets
const filteredProjects = computed(() => {
  return projects.value.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim())
    const matchesType = selectedTypeFilter.value === 'ALL' || p.content.type === selectedTypeFilter.value
    return matchesSearch && matchesType
  })
})

const handleOpenProject = (id: string) => {
  router.push(`/create?id=${id}`)
}

const handleDuplicate = async (id: string) => {
  try {
    const dup = await duplicateProject(id)
    showToast(`Projet dupliqué sous le nom "${dup.name}"`)
  } catch {
    showToast('Erreur lors de la duplication du projet', 'error')
  }
}

const handleDelete = async (id: string) => {
  const target = projects.value.find(p => p.id === id)
  const name = target ? target.name : 'ce projet'
  if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${name}" ?`)) {
    try {
      await deleteProject(id)
      showToast(`Le projet "${name}" a été supprimé.`)
    } catch {
      showToast('Échec de la suppression', 'error')
    }
  }
}

const handleClearAll = async () => {
  isConfirmDeleteAllOpen.value = false
  try {
    await clearAllProjects()
    showToast('Tous vos projets locaux ont été supprimés.')
  } catch {
    showToast('Erreur lors de la suppression de la base.', 'error')
  }
}

const handleExportJson = (project: QrProjectEntity) => {
  const exportData = exportProjectToJson(project)
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, sanitizeFileName(project.name, 'json'))
  showToast(`Configuration JSON exportée pour "${project.name}"`)
}

const handleExportAllJson = () => {
  if (projects.value.length === 0) return
  const backup = projects.value.map(p => exportProjectToJson(p))
  const jsonStr = JSON.stringify(backup, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, `qr-studio-sauvegarde-globale-${new Date().toISOString().slice(0, 10)}.json`)
  showToast(`Sauvegarde de ${projects.value.length} projet(s) téléchargée`)
}

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
    fileInputRef.value.click()
  }
}

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    // Vérification s'il s'agit d'un import unitaire ou tableau global
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      let count = 0
      for (const item of parsed) {
        const validated = importProjectFromJson(JSON.stringify(item))
        await saveProject({
          name: validated.name,
          content: validated.content,
          design: validated.design,
          thumbnailDataUrl: validated.design.logo?.logoDataUrl || ''
        })
        count++
      }
      showToast(`${count} projet(s) importé(s) avec succès !`)
    } else {
      const validated = importProjectFromJson(text)
      await saveProject({
        name: validated.name,
        content: validated.content,
        design: validated.design,
        thumbnailDataUrl: validated.design.logo?.logoDataUrl || ''
      })
      showToast(`Projet "${validated.name}" importé avec succès !`)
    }
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : 'Erreur lors de l\'import du fichier.', 'error')
  }
}
</script>

<template>
  <div class="projects-page app-container">
    <!-- Input d'import masqué -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json,application/json"
      class="sr-only"
      aria-label="Importer un fichier JSON"
      @change="handleFileImport"
    >

    <!-- Notification Toast -->
    <div
      v-if="notificationMessage"
      class="toast-notification"
      :class="`toast-notification--${notificationMessage.type}`"
      role="status"
    >
      <CheckCircle2 v-if="notificationMessage.type === 'success'" :size="18" />
      <AlertTriangle v-else :size="18" />
      <span>{{ notificationMessage.text }}</span>
    </div>

    <!-- En-tête de la page -->
    <div class="projects-header">
      <div class="header-titles">
        <div class="title-with-badge">
          <h1 class="page-title">Mes Projets Locaux</h1>
          <span class="count-badge">{{ projects.length }}</span>
        </div>
        <p class="page-subtitle">
          Vos QR codes sont stockés exclusivement dans votre navigateur (IndexedDB). Zéro serveur, confidentialité garantie.
        </p>
      </div>

      <div class="header-actions">
        <NuxtLink to="/create" class="header-btn header-btn--primary">
          <PlusCircle :size="16" />
          <span>Nouveau QR Code</span>
        </NuxtLink>

        <button
          type="button"
          class="header-btn"
          title="Importer un fichier de sauvegarde JSON"
          @click="triggerFileInput"
        >
          <Upload :size="16" />
          <span>Importer</span>
        </button>

        <button
          v-if="projects.length > 0"
          type="button"
          class="header-btn"
          title="Exporter l'ensemble de vos projets en JSON"
          @click="handleExportAllJson"
        >
          <Download :size="16" />
          <span>Sauvegarde Globale</span>
        </button>

        <button
          v-if="projects.length > 0"
          type="button"
          class="header-btn header-btn--danger"
          title="Effacer tous les projets enregistrés"
          @click="isConfirmDeleteAllOpen = true"
        >
          <Trash2 :size="16" />
          <span>Tout effacer</span>
        </button>
      </div>
    </div>

    <!-- Barre d'outils et filtrage -->
    <div v-if="projects.length > 0" class="toolbar-section">
      <div class="search-box">
        <Search :size="16" class="search-icon" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher par nom..."
          class="search-input"
          aria-label="Rechercher un projet"
        >
      </div>

      <div class="type-filter-group">
        <select v-model="selectedTypeFilter" class="type-select" aria-label="Filtrer par type de contenu">
          <option value="ALL">Tous les types</option>
          <option value="URL">Lien Web (URL)</option>
          <option value="WIFI">Wi-Fi</option>
          <option value="TEXT">Texte libre</option>
          <option value="VCARD">Contact (vCard)</option>
          <option value="EMAIL">E-mail</option>
          <option value="SMS">SMS</option>
          <option value="PHONE">Téléphone</option>
          <option value="GEO">Localisation</option>
          <option value="EVENT">Événement</option>
        </select>
      </div>
    </div>

    <!-- État de chargement -->
    <div v-if="isLoading" class="loading-state">
      <Loader2 :size="32" class="spin-icon" />
      <span>Chargement de vos projets locaux...</span>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="errorMessage" class="error-banner" role="alert">
      <AlertTriangle :size="18" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Aucun projet sauvegardé -->
    <ProjectEmptyState v-else-if="projects.length === 0" />

    <!-- Résultats de recherche vides -->
    <div v-else-if="filteredProjects.length === 0" class="no-results-state">
      <p>Aucun projet ne correspond à votre recherche « <strong>{{ searchQuery }}</strong> ».</p>
      <button type="button" class="btn-reset-filters" @click="searchQuery = ''; selectedTypeFilter = 'ALL'">
        Réinitialiser les filtres
      </button>
    </div>

    <!-- Grille des projets -->
    <div v-else class="projects-grid">
      <ProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @open="handleOpenProject"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
        @export-json="handleExportJson"
      />
    </div>

    <!-- Modale de confirmation de suppression globale -->
    <div
      v-if="isConfirmDeleteAllOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation de suppression globale"
      @click.self="isConfirmDeleteAllOpen = false"
    >
      <div class="modal-card">
        <div class="modal-icon-danger">
          <AlertTriangle :size="32" />
        </div>
        <h2 class="modal-title">Effacer tous vos projets ?</h2>
        <p class="modal-desc">
          Cette action est irréversible. L'ensemble de vos <strong>{{ projects.length }}</strong> projet(s) sera définitivement supprimé de la mémoire de votre navigateur.
        </p>
        <div class="modal-actions">
          <button
            type="button"
            class="modal-btn modal-btn--cancel"
            @click="isConfirmDeleteAllOpen = false"
          >
            Annuler
          </button>
          <button
            type="button"
            class="modal-btn modal-btn--danger"
            @click="handleClearAll"
          >
            Oui, tout effacer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.projects-page {
  padding: 2rem 0 5rem 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: 0.9rem;
  font-weight: 600;
  animation: slideUp 0.25s ease-out;
}

.toast-notification--success {
  background-color: var(--color-surface);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.toast-notification--error {
  background-color: var(--color-surface);
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* En-tête */
.projects-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

@media (min-width: 768px) {
  .projects-header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
}

.count-badge {
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
}

.page-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-top: 0.35rem;
  max-width: 650px;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.header-btn:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-text-muted);
}

.header-btn--primary {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.header-btn--primary:hover {
  background-color: var(--color-primary-hover);
  color: #ffffff;
  border-color: var(--color-primary-hover);
}

.header-btn--danger {
  color: var(--color-danger);
}

.header-btn--danger:hover {
  background-color: rgba(239, 68, 68, 0.08);
  border-color: var(--color-danger);
}

/* Barre d'outils */
.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .toolbar-section {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  padding: 0.6rem 0.75rem 0.6rem 2.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.type-select {
  padding: 0.6rem 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Grille */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

/* États */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  color: var(--color-text-muted);
}

.spin-icon {
  animation: spin 1s linear infinite;
  color: var(--color-primary);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
}

.no-results-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-muted);
}

.btn-reset-filters {
  margin-top: 1rem;
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

/* Modale */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(2px);
}

.modal-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 450px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.modal-icon-danger {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.modal-desc {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.modal-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.modal-btn {
  flex: 1;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-btn--cancel {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.modal-btn--cancel:hover {
  background-color: var(--color-surface-hover);
}

.modal-btn--danger {
  background-color: var(--color-danger);
  border: 1px solid var(--color-danger);
  color: #ffffff;
}

.modal-btn--danger:hover {
  background-color: #dc2626;
}
</style>
