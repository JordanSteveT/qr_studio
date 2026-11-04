<script setup lang="ts">
import { ref, watch } from 'vue'
import { Save, Download, Upload, RotateCcw, Edit2, Check, AlertCircle } from 'lucide-vue-next'

interface Props {
  projectName?: string
  isDirty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  projectName: 'Mon QR Code',
  isDirty: false
})

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'rename', newName: string): void
  (e: 'export-json'): void
  (e: 'import-json'): void
  (e: 'reset'): void
}>()

const isEditingName = ref(false)
const localName = ref(props.projectName)

watch(() => props.projectName, (val) => {
  localName.value = val
})

const handleStartRename = () => {
  isEditingName.value = true
}

const handleConfirmRename = () => {
  isEditingName.value = false
  const trimmed = localName.value.trim()
  if (trimmed.length > 0) {
    emit('rename', trimmed)
  } else {
    localName.value = props.projectName
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleConfirmRename()
  } else if (event.key === 'Escape') {
    isEditingName.value = false
    localName.value = props.projectName
  }
}
</script>

<template>
  <div class="editor-header">
    <div class="header-left">
      <!-- Édition en ligne du nom du projet -->
      <div v-if="isEditingName" class="name-edit-form">
        <input
          v-model="localName"
          type="text"
          class="name-input"
          maxlength="50"
          autofocus
          aria-label="Nom du projet"
          @keydown="handleKeydown"
          @blur="handleConfirmRename"
        >
        <button
          type="button"
          class="name-confirm-btn"
          aria-label="Valider le nom"
          @click="handleConfirmRename"
        >
          <Check :size="16" />
        </button>
      </div>

      <div v-else class="name-display" @click="handleStartRename">
        <h1 class="project-title">{{ projectName }}</h1>
        <button type="button" class="rename-hint-btn" aria-label="Renommer le projet">
          <Edit2 :size="14" />
        </button>
      </div>

      <!-- Indicateur de modifications non sauvegardées -->
      <div v-if="isDirty" class="dirty-badge" title="Modifications non enregistrées">
        <span class="dirty-dot" aria-hidden="true" />
        <span class="dirty-text">Non enregistré</span>
      </div>
    </div>

    <!-- Actions rapides de la barre d'outils -->
    <div class="header-right">
      <button
        type="button"
        class="tool-btn"
        title="Importer un fichier de projet JSON"
        @click="emit('import-json')"
      >
        <Upload :size="16" />
        <span class="btn-label">Importer</span>
      </button>

      <button
        type="button"
        class="tool-btn"
        title="Exporter la configuration au format JSON"
        @click="emit('export-json')"
      >
        <Download :size="16" />
        <span class="btn-label">JSON</span>
      </button>

      <button
        type="button"
        class="tool-btn tool-btn--ghost"
        title="Réinitialiser le projet"
        @click="emit('reset')"
      >
        <RotateCcw :size="16" />
        <span class="btn-label">Réinitialiser</span>
      </button>

      <button
        type="button"
        class="save-btn"
        :class="{ 'save-btn--active': isDirty }"
        title="Enregistrer dans votre navigateur (IndexedDB)"
        @click="emit('save')"
      >
        <Save :size="16" />
        <span>Enregistrer</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.editor-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.75rem 0;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

@media (min-width: 640px) {
  .editor-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.name-display {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.name-display:hover {
  background-color: var(--color-surface-hover);
}

.project-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.rename-hint-btn {
  color: var(--color-text-subtle);
  display: inline-flex;
  align-items: center;
  opacity: 0.6;
}

.name-display:hover .rename-hint-btn {
  opacity: 1;
  color: var(--color-text);
}

.name-edit-form {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.name-input {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  outline: none;
}

.name-confirm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background-color: var(--color-primary);
  color: #ffffff;
  border-radius: var(--radius-sm);
}

.dirty-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
}

.dirty-dot {
  width: 5px;
  height: 5px;
  background-color: #f59e0b;
  border-radius: 50%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tool-btn:hover {
  color: var(--color-text);
  background-color: var(--color-surface);
  border-color: var(--color-border);
}

.tool-btn--ghost {
  color: var(--color-text-subtle);
}

.tool-btn--ghost:hover {
  color: var(--color-danger);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.save-btn:hover {
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.save-btn--active {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.save-btn--active:hover {
  background-color: var(--color-primary-hover);
}

@media (max-width: 480px) {
  .btn-label {
    display: none;
  }
}
</style>
