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

const tabs: { id: DesignSubTab; label: string; icon: unknown }[] = [
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
      <h3 class="card-title">2. Design & Personnalisation</h3>
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
        <component :is="t.icon" :size="15" aria-hidden="true" />
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
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.card-header {
  margin-bottom: 0.9rem;
}

.card-title {
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}

.sub-tab-bar {
  display: flex;
  gap: 0.4rem;
  padding-bottom: 0.9rem;
  border-bottom: 1.5px solid var(--color-border);
  margin-bottom: 1.15rem;
  overflow-x: auto;
}

.sub-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.sub-tab-btn:hover {
  color: var(--color-text);
  border-color: var(--color-border-hover);
}

.sub-tab-btn.active {
  color: #1a1523;
  background-color: #d9f24a;
  border-color: #1a1523;
  font-weight: 700;
}

.design-tab-content {
  padding-top: 0.25rem;
}
</style>
