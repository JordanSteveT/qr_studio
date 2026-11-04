<script setup lang="ts">
import { ref, onMounted, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditorHeader from '~/components/editor/EditorHeader.vue'
import QrPreview from '~/components/qr/QrPreview.vue'
import QrExportPanel from '~/components/qr/QrExportPanel.vue'
import QrContentForm from '~/components/editor/QrContentForm.vue'
import QrDesignTabs from '~/components/editor/QrDesignTabs.vue'
import { DEFAULT_QR_DESIGN, type QrDesign } from '~/types/design'
import { DEFAULT_CONTENTS, type QrContent, type QrContentType } from '~/types/content'
import { useLocalProjects } from '~/composables/useLocalProjects'
import { ExportService } from '~/services/export/export.service'
import { downloadBlob, sanitizeFileName } from '~/utils/download.util'
import { SlidersHorizontal, Eye, Download, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-vue-next'

useSeoMeta({
  title: 'Créateur de QR Code en Ligne — QR Studio',
  description: 'Personnalisez vos QR codes avec couleurs, logos, cadres et exportez en haute résolution SVG ou PNG.',
  ogTitle: 'Créateur de QR Code en Ligne — QR Studio',
  ogDescription: 'Personnalisez vos QR codes avec couleurs, logos, cadres et exportez en haute résolution SVG ou PNG.'
})

const route = useRoute()
const router = useRouter()
const { saveProject, getProject, exportProjectToJson, importProjectFromJson } = useLocalProjects()

// État du projet dans l'éditeur
const currentProjectId = ref<string | null>(null)
const projectName = ref('Mon QR Code')
const isDirty = ref(false)
const isSaving = ref(false)
const activeMobileTab: Ref<'editor' | 'preview'> = ref('editor')
const fileImportInput = ref<HTMLInputElement | null>(null)
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { message, type }
  setTimeout(() => {
    toast.value = null
  }, 4000)
}

// Données du moteur QR et de contenu
const currentContent: Ref<QrContent> = ref({ ...DEFAULT_CONTENTS.URL })
const encodedData = ref('https://qrstudio.app')
const currentDesign: Ref<QrDesign> = ref({ ...DEFAULT_QR_DESIGN })

// Chargement initial d'un projet si l'URL contient ?id=xyz ou ?type=abc
onMounted(async () => {
  const queryId = route.query.id as string
  const queryType = (route.query.type as string)?.toUpperCase() as QrContentType

  if (queryId) {
    try {
      const project = await getProject(queryId)
      if (project) {
        currentProjectId.value = project.id
        projectName.value = project.name
        currentContent.value = { ...project.content }
        currentDesign.value = { ...project.design }
        isDirty.value = false
        showToast(`Projet "${project.name}" chargé avec succès.`)
        return
      }
    } catch (err) {
      console.error('[create.vue] Erreur lors du chargement du projet:', err)
      showToast('Impossible de charger le projet demandé.', 'error')
    }
  }

  // Pré-sélection du type de QR code demandé via URL (ex: /create?type=WIFI)
  if (queryType && DEFAULT_CONTENTS[queryType]) {
    currentContent.value = { ...DEFAULT_CONTENTS[queryType] }
  }
})

// Génère une vignette miniature 128x128 px
const generateThumbnailDataUrl = async (): Promise<string> => {
  try {
    const blob = await ExportService.generateExportBlob({
      format: 'png',
      data: encodedData.value,
      design: currentDesign.value,
      resolution: 1024,
      projectName: projectName.value
    })
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

// Handlers d'actions
const handleSave = async () => {
  if (isSaving.value) return
  isSaving.value = true
  try {
    const thumb = await generateThumbnailDataUrl()
    const saved = await saveProject({
      id: currentProjectId.value ?? undefined,
      name: projectName.value,
      content: currentContent.value,
      design: currentDesign.value,
      thumbnailDataUrl: thumb
    })
    currentProjectId.value = saved.id
    isDirty.value = false
    showToast(`Projet "${saved.name}" enregistré dans votre navigateur !`)
    // Mise à jour de l'URL sans rechargement
    if (!route.query.id || route.query.id !== saved.id) {
      router.replace({ query: { id: saved.id } })
    }
  } catch (err) {
    console.error('Erreur sauvegarde:', err)
    showToast('Erreur lors de l\'enregistrement local.', 'error')
  } finally {
    isSaving.value = false
  }
}

const handleRename = (newName: string) => {
  projectName.value = newName
  isDirty.value = true
}

const handleExportJson = () => {
  const exportData = {
    app: 'QR Studio' as const,
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    name: projectName.value,
    content: currentContent.value,
    design: currentDesign.value,
    ...(currentDesign.value.logo?.logoDataUrl ? { logoBase64: currentDesign.value.logo.logoDataUrl } : {})
  }
  const jsonStr = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' })
  downloadBlob(blob, sanitizeFileName(projectName.value, 'json'))
  showToast(`Configuration JSON de "${projectName.value}" téléchargée !`)
}

const handleTriggerImport = () => {
  if (fileImportInput.value) {
    fileImportInput.value.value = ''
    fileImportInput.value.click()
  }
}

const handleFileImported = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const imported = importProjectFromJson(text)
    projectName.value = imported.name
    currentContent.value = { ...imported.content }
    currentDesign.value = { ...imported.design }
    currentProjectId.value = null // Nouveau projet importé
    isDirty.value = true
    showToast(`Configuration "${imported.name}" importée avec succès !`)
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : 'Fichier JSON invalide.', 'error')
  }
}

const handleReset = () => {
  if (confirm('Voulez-vous réinitialiser ce QR code ? Toutes les modifications non enregistrées seront perdues.')) {
    currentProjectId.value = null
    projectName.value = 'Mon QR Code'
    currentContent.value = { ...DEFAULT_CONTENTS.URL }
    encodedData.value = 'https://qrstudio.app'
    currentDesign.value = { ...DEFAULT_QR_DESIGN }
    isDirty.value = false
    router.replace({ query: {} })
    showToast('Éditeur réinitialisé.')
  }
}

const handleContentUpdate = (newContent: QrContent) => {
  currentContent.value = newContent
}

const handleEncodedDataUpdate = (newData: string) => {
  encodedData.value = newData
  isDirty.value = true
}
</script>

<template>
  <div class="editor-page app-container">
    <!-- Input d'import masqué -->
    <input
      ref="fileImportInput"
      type="file"
      accept=".json,application/json"
      class="sr-only"
      aria-label="Importer un fichier JSON"
      @change="handleFileImported"
    >

    <!-- Notification Toast -->
    <div
      v-if="toast"
      class="toast-notification"
      :class="`toast-notification--${toast.type}`"
      role="status"
    >
      <CheckCircle2 v-if="toast.type === 'success'" :size="18" />
      <AlertTriangle v-else :size="18" />
      <span>{{ toast.message }}</span>
    </div>

    <!-- Barre de titre du projet & actions -->
    <EditorHeader
      :project-name="projectName"
      :is-dirty="isDirty"
      @save="handleSave"
      @rename="handleRename"
      @export-json="handleExportJson"
      @import-json="handleTriggerImport"
      @reset="handleReset"
    />

    <!-- Onglets de commutation sur Mobile (< 768px) -->
    <div class="mobile-tabs" role="tablist" aria-label="Sections de l'éditeur">
      <button
        type="button"
        role="tab"
        class="mobile-tab"
        :class="{ 'mobile-tab--active': activeMobileTab === 'editor' }"
        :aria-selected="activeMobileTab === 'editor'"
        @click="activeMobileTab = 'editor'"
      >
        <SlidersHorizontal :size="16" />
        <span>Contenu & Design</span>
      </button>

      <button
        type="button"
        role="tab"
        class="mobile-tab"
        :class="{ 'mobile-tab--active': activeMobileTab === 'preview' }"
        :aria-selected="activeMobileTab === 'preview'"
        @click="activeMobileTab = 'preview'"
      >
        <Eye :size="16" />
        <span>Aperçu & Export</span>
      </button>
    </div>

    <!-- Disposition Split-Screen (Desktop) / Onglets (Mobile) -->
    <div class="split-layout">
      <!-- PANNEAU GAUCHE : Saisie du Contenu & Personnalisation -->
      <section
        class="config-panel"
        :class="{ 'config-panel--hidden': activeMobileTab !== 'editor' }"
        aria-label="Configuration du QR Code"
      >
        <!-- Formulaire de saisie dynamique des 10 types de contenu (Phase QR-004) -->
        <QrContentForm
          :initial-content="currentContent"
          @update:content="handleContentUpdate"
          @update:encoded-data="handleEncodedDataUpdate"
          @change="isDirty = true"
        />

        <!-- Personnalisation graphique avancée, Logo et Cadres (Phase QR-005) -->
        <QrDesignTabs
          :design="currentDesign"
          @update:design="(newDesign: QrDesign) => currentDesign = newDesign"
          @change="isDirty = true"
        />
      </section>

      <!-- PANNEAU DROITE : Prévisualisation & Export (Sticky sur Desktop) -->
      <aside
        class="preview-panel"
        :class="{ 'preview-panel--hidden': activeMobileTab !== 'preview' }"
        aria-label="Aperçu et Export"
      >
        <div class="sticky-wrapper">
          <!-- Zone d'aperçu dynamique QR Code (QR-003) et Export -->
          <ClientOnly>
            <QrPreview :data="encodedData" :design="currentDesign" :size="300" />
            <QrExportPanel
              :data="encodedData"
              :design="currentDesign"
              :project-name="projectName"
            />
          </ClientOnly>
        </div>
      </aside>
    </div>

    <!-- Barre d'action inférieure flottante sur Mobile -->
    <div class="mobile-action-bar">
      <div class="bar-info">
        <span class="bar-name">{{ projectName }}</span>
        <span class="bar-sub">Prêt au téléchargement</span>
      </div>
      <button type="button" class="bar-btn" @click="activeMobileTab = 'preview'">
        <Download :size="16" />
        <span>Télécharger</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor-page {
  padding-bottom: 5rem;
}

/* Onglets Mobiles */
.mobile-tabs {
  display: flex;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.25rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .mobile-tabs {
    display: none;
  }
}

.mobile-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.mobile-tab--active {
  background-color: var(--color-primary);
  color: #ffffff;
}

/* Grille Split-Screen */
.split-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .split-layout {
    display: grid;
    grid-template-columns: 1fr 420px;
    align-items: start;
    gap: 2.5rem;
  }
}

@media (min-width: 1280px) {
  .split-layout {
    grid-template-columns: 1fr 460px;
  }
}

/* Panneau de configuration (Gauche) */
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Panneau de prévisualisation (Droite Sticky) */
.preview-panel {
  width: 100%;
}

@media (min-width: 1024px) {
  .sticky-wrapper {
    position: sticky;
    top: 5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

/* Masquage Mobile selon l'onglet actif */
@media (max-width: 767px) {
  .config-panel--hidden {
    display: none;
  }
  .preview-panel--hidden {
    display: none;
  }
}

/* Barre d'action inférieure flottante (Mobile) */
.mobile-action-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 0.75rem 1.25rem;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.05);
}

@media (max-width: 767px) {
  .mobile-action-bar {
    display: flex;
  }
}

.bar-info {
  display: flex;
  flex-direction: column;
}

.bar-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
}

.bar-sub {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.bar-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background-color: var(--color-primary);
  border-radius: var(--radius-md);
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
</style>
