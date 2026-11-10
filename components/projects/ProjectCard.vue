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
  Code,
  QrCode
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

const badgeBgColor = computed(() => {
  switch (props.project.content.type) {
    case 'URL': return '#d9f24a'
    case 'WIFI': return '#9cd2ff'
    case 'VCARD': return '#ffb3d9'
    case 'EMAIL': return '#ffd84d'
    case 'SMS': return '#a8e6c3'
    case 'EVENT': return '#c9b6ff'
    default: return '#ffd84d'
  }
})
</script>

<template>
  <div class="project-card" :data-id="project.id">
    <!-- Vignette miniature du QR code (avec fallback propre si vide) -->
    <div class="card-preview" @click="emit('open', project.id)">
      <img
        v-if="project.thumbnailDataUrl"
        :src="project.thumbnailDataUrl"
        :alt="`Aperçu ${project.name}`"
        class="thumbnail-img"
        loading="lazy"
      >
      <div v-else class="thumbnail-fallback" aria-label="Aperçu générique QR Code">
        <QrCode :size="68" :style="{ color: project.design?.dots?.color || '#1a1523' }" />
      </div>
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
        <div class="badge-type" :style="{ backgroundColor: badgeBgColor }">
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
          aria-label="Dupliquer ce projet"
          @click="emit('duplicate', project.id)"
        >
          <Copy :size="14" />
        </button>

        <button
          type="button"
          class="action-btn"
          title="Exporter la configuration JSON"
          aria-label="Exporter en JSON"
          @click="emit('export-json', project)"
        >
          <Download :size="14" />
        </button>

        <button
          type="button"
          class="action-btn action-btn--danger"
          title="Supprimer définitivement"
          aria-label="Supprimer ce projet"
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
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-spring), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-hover);
}

.card-preview {
  position: relative;
  background-color: #ffffff;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-bottom: 1.5px solid var(--color-border);
  min-height: 168px;
}

.thumbnail-img {
  width: 128px;
  height: 128px;
  object-fit: contain;
  transition: transform var(--transition-fast);
}

.thumbnail-fallback {
  width: 128px;
  height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff8ee;
  border-radius: 16px;
  border: 2px dashed #eadfce;
}

.card-preview:hover .thumbnail-img {
  transform: scale(1.05);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(26, 21, 35, 0.35);
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
  background-color: #d9f24a;
  color: #1a1523;
  border: 2px solid #1a1523;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  box-shadow: var(--shadow-md);
}

.card-body {
  padding: 1.15rem;
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
  gap: 0.3rem;
  color: #1a1523;
  border: 1.5px solid #1a1523;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  font-weight: 700;
  text-transform: uppercase;
}

.date-info {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: auto;
  padding-top: 0.65rem;
  border-top: 1.5px solid var(--color-border-subtle);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  border: 1.5px solid var(--color-border);
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.action-btn--primary {
  flex: 1;
  background-color: #d9f24a;
  color: #1a1523;
  border-color: #1a1523;
}

.action-btn--primary:hover {
  background-color: #c2de2c;
  color: #1a1523;
  border-color: #1a1523;
}

.action-btn--danger:hover {
  color: #ffffff;
  border-color: #1a1523;
  background-color: #ff5a36;
}
</style>
