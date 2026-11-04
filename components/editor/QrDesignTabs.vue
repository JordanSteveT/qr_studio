<script setup lang="ts">
import { ref } from 'vue'
import type { QrDesign } from '~/types/design'
import { Shapes, Palette, Image as ImageIcon, Frame, Sliders } from 'lucide-vue-next'

import QrShapeEditor from '~/components/editor/QrShapeEditor.vue'
import QrColorEditor from '~/components/editor/QrColorEditor.vue'
import QrLogoEditor from '~/components/editor/QrLogoEditor.vue'
import QrFrameEditor from '~/components/editor/QrFrameEditor.vue'
import QrAdvancedSettings from '~/components/editor/QrAdvancedSettings.vue'

const props = defineProps<{
  design: QrDesign
}>()

const emit = defineEmits<{
  (e: 'update:design', design: QrDesign): void
  (e: 'change'): void
}>()

type DesignSubTab = 'shapes' | 'colors' | 'logo' | 'frame' | 'advanced'
const activeSubTab = ref<DesignSubTab>('shapes')

const tabs: { id: DesignSubTab; label: string; icon: any }[] = [
  { id: 'shapes', label: 'Formes', icon: Shapes },
  { id: 'colors', label: 'Couleurs', icon: Palette },
  { id: 'logo', label: 'Logo', icon: ImageIcon },
  { id: 'frame', label: 'Cadre', icon: Frame },
  { id: 'advanced', label: 'Avancé', icon: Sliders }
]

const handleDesignUpdate = (updatedDesign: QrDesign) => {
  emit('update:design', updatedDesign)
  emit('change')
}
</script>

<template>
  <div class="qr-design-card">
    <div class="card-header">
      <h3 class="card-title">Design & Personnalisation</h3>
    </div>

    <!-- Navigation par sous-onglets -->
    <div class="sub-tab-bar" role="tablist" aria-label="Sous-sections de personnalisation">
      <button
        v-for="t in tabs"
        :key="t.id"
        type="button"
        role="tab"
        :aria-selected="activeSubTab === t.id"
        :class="['sub-tab-btn', { active: activeSubTab === t.id }]"
        @click="activeSubTab = t.id"
      >
        <component :is="t.icon" :size="14" aria-hidden="true" />
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- Conteneur dynamique des éditeurs de design -->
    <div class="design-tab-content">
      <QrShapeEditor
        v-if="activeSubTab === 'shapes'"
        :design="props.design"
        @update:design="handleDesignUpdate"
      />

      <QrColorEditor
        v-else-if="activeSubTab === 'colors'"
        :design="props.design"
        @update:design="handleDesignUpdate"
      />

      <QrLogoEditor
        v-else-if="activeSubTab === 'logo'"
        :design="props.design"
        @update:design="handleDesignUpdate"
      />

      <QrFrameEditor
        v-else-if="activeSubTab === 'frame'"
        :design="props.design"
        @update:design="handleDesignUpdate"
      />

      <QrAdvancedSettings
        v-else-if="activeSubTab === 'advanced'"
        :design="props.design"
        @update:design="handleDesignUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.qr-design-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  margin-top: 1rem;
}

.card-header {
  margin-bottom: 0.75rem;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin: 0;
}

.sub-tab-bar {
  display: flex;
  gap: 0.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
  overflow-x: auto;
}

.sub-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.sub-tab-btn:hover {
  color: var(--color-text);
  background-color: var(--color-surface-hover);
}

.sub-tab-btn.active {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  font-weight: 600;
}

.design-tab-content {
  padding-top: 0.25rem;
}
</style>
