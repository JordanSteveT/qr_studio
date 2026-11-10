<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
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
import { serializeQrContent } from '~/services/qr/serializers'
import { downloadBlob, sanitizeFileName } from '~/utils/download.util'
import { deepClone } from '~/utils/clone.util'
import { SlidersHorizontal, Eye, Download, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-vue-next'

useSeoMeta({
  title: 'Créateur de QR Code en Ligne — QR Studio',
  description: 'Personnalisez vos QR codes avec couleurs, logos, cadres et exportez en haute résolution SVG ou PNG.',
  ogTitle: 'Créateur de QR Code en Ligne — QR Studio',
  ogDescription: 'Personnalisez vos QR codes avec couleurs, logos, cadres et exportez en haute résolution SVG ou PNG.'
})

const route = useRoute()
const router = useRouter()
const { saveProject, getProject, importProjectFromJson } = useLocalProjects()

// État du projet dans l'éditeur
const currentProjectId = ref<string | null>(null)
const projectName = ref('Mon QR Code')
const isDirty = ref(false)
const isSaving = ref(false)
const isResetModalOpen = ref(false)
const activeMobileTab: Ref<'editor' | 'preview'> = ref('editor')
const fileImportInput = ref<HTMLInputElement | null>(null)
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  toast.value = { message, type }
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 4000)
}

// Données du moteur QR et de contenu (copies profondes pour éviter toute mutation globale)
const currentContent: Ref<QrContent> = ref(deepClone(DEFAULT_CONTENTS.URL))
const encodedData = ref(serializeQrContent(DEFAULT_CONTENTS.URL))
const currentDesign: Ref<QrDesign> = ref(deepClone(DEFAULT_QR_DESIGN))

const loadFromQuery = async () => {
  const queryId = typeof route.query.id === 'string' ? route.query.id : ''
  const queryType = typeof route.query.type === 'string'
    ? (route.query.type.toUpperCase() as QrContentType)
    : undefined

  if (queryId) {
    try {
      const project = await getProject(queryId)
      if (project) {
        currentProjectId.value = project.id
        projectName.value = project.name
        currentContent.value = deepClone(project.content)
        encodedData.value = serializeQrContent(project.content)
        currentDesign.value = deepClone(project.design)
        isDirty.value = false
        showToast(`Projet « ${project.name} » chargé.`)
        return
      }
      showToast('Projet introuvable dans ce navigateur.', 'error')
    } catch (err) {
      console.error('[create.vue] Erreur lors du chargement du projet:', err)
      showToast('Impossible de charger le projet demandé.', 'error')
    }
    return
  }

  if (queryType && DEFAULT_CONTENTS[queryType]) {
    const presetContent = deepClone(DEFAULT_CONTENTS[queryType])
    currentProjectId.value = null
    currentContent.value = presetContent
    encodedData.value = serializeQrContent(presetContent)
    isDirty.value = false
  }
}

onMounted(async () => {
  await loadFromQuery()
})

watch(() => [route.query.id, route.query.type], async () => {
  await loadFromQuery()
})

onUnmounted(() => {
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
})

/**
 * Génère une vignette légère (256x256 px) pour IndexedDB afin de préserver les performances.
 */
const generateThumbnailDataUrl = async (): Promise<string> => {
  try {
    const blob = await ExportService.generateExportBlob({
      format: 'png',
      data: encodedData.value,
      design: currentDesign.value,
      resolution: 1024,
      projectName: projectName.value
    })
    const objectUrl = URL.createObjectURL(blob)
    try {
      return await new Promise<string>((resolve) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 256
          canvas.height = 256
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, 256, 256)
            ctx.drawImage(img, 0, 0, 256, 256)
            resolve(canvas.toDataURL('image/png'))
          } else {
            resolve('')
          }
        }
        img.onerror = () => resolve('')
        img.src = objectUrl
      })
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
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
    showToast(`Projet « ${saved.name} » enregistré dans votre navigateur !`)
    if (!route.query.id || route.query.id !== saved.id) {
      await router.replace({ query: { id: saved.id } })
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
  showToast(`Configuration JSON de « ${projectName.value} » téléchargée !`)
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
    currentContent.value = deepClone(imported.content)
    encodedData.value = serializeQrContent(imported.content)
    currentDesign.value = deepClone(imported.design)
    currentProjectId.value = null
    isDirty.value = true
    showToast(`Configuration « ${imported.name} » importée avec succès !`)
  } catch (err: unknown) {
    showToast(err instanceof Error ? err.message : 'Fichier JSON invalide.', 'error')
  }
}

const requestReset = () => {
  isResetModalOpen.value = true
}

const confirmReset = async () => {
  isResetModalOpen.value = false
  currentProjectId.value = null
  projectName.value = 'Mon QR Code'
  currentContent.value = deepClone(DEFAULT_CONTENTS.URL)
  encodedData.value = serializeQrContent(DEFAULT_CONTENTS.URL)
  currentDesign.value = deepClone(DEFAULT_QR_DESIGN)
  isDirty.value = false
  await router.replace({ query: {} })
  showToast('Éditeur réinitialisé.')
}

const handleContentUpdate = (newContent: QrContent) => {
  currentContent.value = newContent
}

const handleEncodedDataUpdate = (newData: string) => {
  encodedData.value = newData
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

    <!-- Modale de confirmation de réinitialisation -->
    <div
      v-if="isResetModalOpen"
      class="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmer la réinitialisation"
      @click.self="isResetModalOpen = false"
    >
      <div class="modal-card">
        <div class="modal-icon-warn">
          <RotateCcw :size="26" />
        </div>
        <h2 class="modal-title">Réinitialiser l’éditeur ?</h2>
        <p class="modal-desc">
          Toutes les modifications non enregistrées sur ce QR code seront perdues et remplacées par le modèle par défaut.
        </p>
        <div class="modal-actions">
          <button type="button" class="modal-btn modal-btn--cancel" @click="isResetModalOpen = false">
            Annuler
          </button>
          <button type="button" class="modal-btn modal-btn--danger" @click="confirmReset">
            Oui, réinitialiser
          </button>
        </div>
      </div>
    </div>

    <!-- Barre de titre du projet & actions -->
    <EditorHeader
      :project-name="projectName"
      :is-dirty="isDirty"
      @save="handleSave"
      @rename="handleRename"
      @export-json="handleExportJson"
      @import-json="handleTriggerImport"
      @reset="requestReset"
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
        <QrContentForm
          :initial-content="currentContent"
          @update:content="handleContentUpdate"
          @update:encoded-data="handleEncodedDataUpdate"
          @change="isDirty = true"
        />

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
          <ClientOnly>
            <QrPreview :data="encodedData" :design="currentDesign" :size="300" />
            <QrExportPanel
              :data="encodedData"
              :design="currentDesign"
              :project-name="projectName"
            />
            <template #fallback>
              <div class="ssr-preview-skeleton" aria-hidden="true">
                <div class="skeleton-box" />
                <div class="skeleton-bar" />
              </div>
            </template>
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
        <Download :size="15" />
        <span>Télécharger</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor-page {
  padding-bottom: 5.5rem;
}

/* Onglets Mobiles */
.mobile-tabs {
  display: flex;
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 999px;
  padding: 0.3rem;
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
  gap: 0.45rem;
  padding: 0.65rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
  border-radius: 999px;
  transition: all var(--transition-fast);
}

.mobile-tab--active {
  background-color: #d9f24a;
  color: #1a1523;
  font-weight: 700;
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
    grid-template-columns: 1fr 410px;
    align-items: start;
    gap: 2.25rem;
  }
}

@media (min-width: 1200px) {
  .split-layout {
    grid-template-columns: 1fr 440px;
  }
}

.config-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.preview-panel {
  width: 100%;
}

@media (min-width: 1024px) {
  .sticky-wrapper {
    position: sticky;
    top: 5.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

/* Skeleton SSR */
.ssr-preview-skeleton {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-box {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-alt);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-bar {
  height: 44px;
  border-radius: 999px;
  background-color: var(--color-bg-alt);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.4; }
}

@media (max-width: 767px) {
  .config-panel--hidden,
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
  border-top: 2px solid var(--color-border);
  padding: 0.75rem 1.25rem;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -6px 16px rgba(26, 21, 35, 0.08);
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
  font-size: 0.92rem;
  color: var(--color-text);
}

.bar-sub {
  font-size: 0.76rem;
  color: var(--color-text-muted);
}

.bar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.86rem;
  font-weight: 700;
  color: #1a1523;
  background-color: #d9f24a;
  border: 2px solid #1a1523;
  border-radius: 999px;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-size: 0.9rem;
  font-weight: 700;
  animation: slideUp 0.25s ease-out;
}

.toast-notification--success {
  background-color: #1a1523;
  color: #d9f24a;
  border: 2px solid #d9f24a;
}

.toast-notification--error {
  background-color: #ff5a36;
  color: #ffffff;
  border: 2px solid #1a1523;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Modale */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background-color: rgba(26, 21, 35, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  backdrop-filter: blur(4px);
}

.modal-card {
  background-color: var(--color-surface);
  border: 3px solid #1a1523;
  border-radius: var(--radius-2xl);
  padding: 2rem;
  max-width: 440px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.dark .modal-card {
  border-color: var(--color-accent);
}

.modal-icon-warn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #ffd84d;
  border: 2px solid #1a1523;
  color: #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.modal-desc {
  font-size: 0.92rem;
  color: var(--color-text-muted);
  line-height: 1.55;
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
  padding: 0.7rem 1rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-btn--cancel {
  background-color: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text);
}

.modal-btn--cancel:hover {
  background-color: var(--color-surface-hover);
}

.modal-btn--danger {
  background-color: #ff5a36;
  border: 2px solid #1a1523;
  color: #ffffff;
}

.modal-btn--danger:hover {
  opacity: 0.92;
}
</style>
