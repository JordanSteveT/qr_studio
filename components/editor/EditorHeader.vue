<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Save, Download, Upload, RotateCcw, Edit2, Check } from 'lucide-vue-next'

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
const nameInputRef = ref<HTMLInputElement | null>(null)

watch(() => props.projectName, (val) => {
  localName.value = val
})

const handleStartRename = async () => {
  isEditingName.value = true
  await nextTick()
  nameInputRef.value?.focus()
  nameInputRef.value?.select()
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
          ref="nameInputRef"
          v-model="localName"
          type="text"
          class="name-input"
          maxlength="50"
          aria-label="Nom du projet"
          @keydown="handleKeydown"
          @blur="handleConfirmRename"
        >
        <button
          type="button"
          class="name-confirm-btn"
          aria-label="Valider le nom"
          @mousedown.prevent="handleConfirmRename"
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
        <Upload :size="15" />
        <span class="btn-label">Importer</span>
      </button>

      <button
        type="button"
        class="tool-btn"
        title="Exporter la configuration au format JSON"
        @click="emit('export-json')"
      >
        <Download :size="15" />
        <span class="btn-label">JSON</span>
      </button>

      <button
        type="button"
        class="tool-btn tool-btn--ghost"
        title="Réinitialiser le projet"
        @click="emit('reset')"
      >
        <RotateCcw :size="15" />
        <span class="btn-label">Réinitialiser</span>
      </button>

      <button
        type="button"
        class="save-btn"
        :class="{ 'save-btn--active': isDirty }"
        title="Enregistrer dans votre navigateur (IndexedDB)"
        @click="emit('save')"
      >
        <Save :size="15" />
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
  padding: 1rem 0 1.1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--color-border);
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
  gap: 0.6rem;
  min-width: 0;
}

.name-display {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.name-display:hover {
  background-color: var(--color-surface);
}

.project-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.rename-hint-btn {
  color: var(--color-text-subtle);
  display: inline-flex;
  align-items: center;
  opacity: 0.75;
}

.name-display:hover .rename-hint-btn {
  opacity: 1;
  color: var(--color-text);
}

.name-edit-form {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.name-input {
  font-size: 1rem;
  font-weight: 600;
  padding: 0.3rem 0.65rem;
  background-color: var(--color-surface);
  border: 2px solid var(--color-border-focus);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  outline: none;
}

.name-confirm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background-color: #d9f24a;
  color: #1a1523;
  border: 2px solid #1a1523;
  border-radius: var(--radius-sm);
}

.dirty-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1a1523;
  background-color: #ffd84d;
  border: 1.5px solid #1a1523;
  border-radius: var(--radius-full);
}

.dirty-dot {
  width: 6px;
  height: 6px;
  background-color: #ff5a36;
  border-radius: 50%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.8rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  transition: all var(--transition-fast);
}

.tool-btn:hover {
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.tool-btn--ghost:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.48rem 1.05rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 2px solid var(--color-border-hover);
  border-radius: 999px;
  transition: all var(--transition-fast);
}

.save-btn:hover {
  background-color: #d9f24a;
  color: #1a1523;
  border-color: #1a1523;
}

.save-btn--active {
  background-color: #d9f24a;
  color: #1a1523;
  border-color: #1a1523;
}

.save-btn--active:hover {
  background-color: #c2de2c;
}

@media (max-width: 480px) {
  .btn-label {
    display: none;
  }
}
</style>
