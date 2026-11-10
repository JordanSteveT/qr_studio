<script setup lang="ts">
import type { QrContentType } from '~/types/content'
import {
  Link2,
  AlignLeft,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  Code
} from 'lucide-vue-next'

const props = defineProps<{
  activeType: QrContentType
}>()

const emit = defineEmits<{
  (e: 'select', type: QrContentType): void
}>()

interface TypeDefinition {
  id: QrContentType
  label: string
  icon: unknown
  description: string
}

const types: TypeDefinition[] = [
  { id: 'URL', label: 'Lien Web', icon: Link2, description: 'Site web, page, lien social' },
  { id: 'TEXT', label: 'Texte libre', icon: AlignLeft, description: 'Notes, messages, citations' },
  { id: 'WIFI', label: 'Wi-Fi', icon: Wifi, description: 'Connexion réseau sans fil' },
  { id: 'VCARD', label: 'Fiche contact', icon: Contact, description: 'Carte de visite virtuelle' },
  { id: 'EMAIL', label: 'E-mail', icon: Mail, description: 'Message et objet préparés' },
  { id: 'SMS', label: 'SMS', icon: MessageSquare, description: 'Texte vers un numéro' },
  { id: 'PHONE', label: 'Téléphone', icon: Phone, description: 'Numérotation automatique' },
  { id: 'GEO', label: 'Localisation', icon: MapPin, description: 'Coordonnées GPS et carte' },
  { id: 'EVENT', label: 'Événement', icon: Calendar, description: 'Invitation et calendrier' },
  { id: 'CUSTOM', label: 'Données brutes', icon: Code, description: 'Payload brut personnalisé' }
]

const handleSelect = (type: QrContentType) => {
  emit('select', type)
}
</script>

<template>
  <div class="qr-type-selector" role="tablist" aria-label="Types de QR codes disponibles">
    <div class="type-grid">
      <button
        v-for="t in types"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="props.activeType === t.id"
        :class="['type-pill', { active: props.activeType === t.id }]"
        :title="t.description"
        @click="handleSelect(t.id)"
      >
        <component :is="t.icon" class="type-icon" :size="17" aria-hidden="true" />
        <span class="type-label">{{ t.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.qr-type-selector {
  width: 100%;
  margin-bottom: 1.1rem;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(126px, 1fr));
  gap: 0.45rem;
}

.type-pill {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.75rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.type-pill:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.type-pill.active {
  background-color: #d9f24a;
  border-color: #1a1523;
  color: #1a1523;
  font-weight: 700;
  box-shadow: 0 2px 0 #1a1523;
}

.type-icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.type-pill.active .type-icon {
  opacity: 1;
}

.type-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .type-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
