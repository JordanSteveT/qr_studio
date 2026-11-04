<script setup lang="ts">
import { computed } from 'vue'
import type { QrProjectEntity } from '~/types/project'
import {
  ExternalLink,
  Copy,
  Trash2,
  Download,
  Calendar,
  Globe,
  Wifi,
  FileText,
  User,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  CalendarDays,
  Code
} from 'lucide-vue-next'

const props = defineProps<{
  project: QrProjectEntity
}>()

const emit = defineEmits<{
  (e: 'open', id: string): void
  (e: 'duplicate', id: string): void
  (e: 'delete', id: string): void
  (e: 'export-json', project: QrProjectEntity): void
}>()

const formattedDate = computed(() => {
  const d = new Date(props.project.updatedAt)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
})

const contentTypeIcon = computed(() => {
  switch (props.project.content.type) {
    case 'URL': return Globe
    case 'WIFI': return Wifi
    case 'TEXT': return FileText
    case 'VCARD': return User
    case 'EMAIL': return Mail
    case 'SMS': return MessageSquare
    case 'PHONE': return Phone
    case 'GEO': return MapPin
    case 'EVENT': return CalendarDays
    default: return Code
  }
})
</script>

<template>
  <div class="project-card" :data-id="project.id">
    <!-- Vignette miniature du QR code -->
    <div class="card-preview" @click="emit('open', project.id)">
      <img
        :src="project.thumbnailDataUrl"
        :alt="`Aperçu ${project.name}`"
        class="thumbnail-img"
        loading="lazy"
      >
      <div class="preview-overlay">
        <span class="open-badge">
          <ExternalLink :size="14" />
          <span>Ouvrir</span>
        </span>
      </div>
    </div>

    <!-- Contenu descriptif du projet -->
    <div class="card-body">
      <div class="card-header-row">
        <div class="badge-type">
          <component :is="contentTypeIcon" :size="12" />
          <span>{{ project.content.type }}</span>
        </div>
        <div class="date-info">
          <Calendar :size="12" />
          <span>{{ formattedDate }}</span>
        </div>
      </div>

      <h3 class="card-title" :title="project.name" @click="emit('open', project.id)">
        {{ project.name }}
      </h3>

      <!-- Barre d'actions rapides -->
      <div class="card-actions">
        <button
          type="button"
          class="action-btn action-btn--primary"
          title="Ouvrir dans l'éditeur"
          @click="emit('open', project.id)"
        >
          <ExternalLink :size="14" />
          <span>Éditer</span>
        </button>

        <button
          type="button"
          class="action-btn"
          title="Dupliquer ce projet"
          @click="emit('duplicate', project.id)"
        >
          <Copy :size="14" />
        </button>

        <button
          type="button"
          class="action-btn"
          title="Exporter la configuration JSON"
          @click="emit('export-json', project)"
        >
          <Download :size="14" />
        </button>

        <button
          type="button"
          class="action-btn action-btn--danger"
          title="Supprimer définitivement"
          @click="emit('delete', project.id)"
        >
          <Trash2 :size="14" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: all var(--transition-fast);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.card-preview {
  position: relative;
  background-color: #ffffff;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  min-height: 160px;
}

.thumbnail-img {
  width: 128px;
  height: 128px;
  object-fit: contain;
  transition: transform var(--transition-fast);
}

.card-preview:hover .thumbnail-img {
  transform: scale(1.05);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.card-preview:hover .preview-overlay {
  opacity: 1;
}

.open-badge {
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  box-shadow: var(--shadow-md);
}

.card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
}

.badge-type {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  text-transform: uppercase;
}

.date-info {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-muted);
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-title:hover {
  color: var(--color-primary);
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: auto;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.4rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: transparent;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-text-muted);
}

.action-btn--primary {
  flex: 1;
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.action-btn--primary:hover {
  background-color: var(--color-primary-hover);
  color: #ffffff;
  border-color: var(--color-primary-hover);
}

.action-btn--danger:hover {
  color: var(--color-danger);
  border-color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.08);
}
</style>
