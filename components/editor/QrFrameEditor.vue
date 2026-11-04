<script setup lang="ts">
import type { QrDesign, QrFrameType } from '~/types/design'
import { Frame, Type, Palette } from 'lucide-vue-next'

const props = defineProps<{
  design: QrDesign
}>()

const emit = defineEmits<{
  (e: 'update:design', design: QrDesign): void
}>()

const frameStyles: { id: QrFrameType; label: string; desc: string }[] = [
  { id: 'none', label: 'Sans cadre', desc: 'Matrice pure' },
  { id: 'bottom-badge', label: 'Bandeau bas', desc: 'Cartouche d’appel inférieur' },
  { id: 'top-badge', label: 'Bandeau haut', desc: 'Cartouche d’appel supérieur' },
  { id: 'full-card', label: 'Carte complète', desc: 'Bordure enveloppante avec titre' },
  { id: 'speech-bubble', label: 'Bulle', desc: 'Bulle incitative vers le code' }
]

const quickTextPresets = [
  'SCANNEZ-MOI',
  'NOTRE MENU',
  'SUIVEZ-NOUS',
  'WIFI GRATUIT',
  'CONTACTEZ-NOUS'
]

const selectFrameType = (type: QrFrameType) => {
  emit('update:design', {
    ...props.design,
    frame: {
      ...props.design.frame,
      type
    }
  })
}

const updateText = (text: string) => {
  emit('update:design', {
    ...props.design,
    frame: {
      ...props.design.frame,
      text: text.slice(0, 30)
    }
  })
}

const updateFrameColor = (frameColor: string) => {
  emit('update:design', {
    ...props.design,
    frame: {
      ...props.design.frame,
      frameColor
    }
  })
}

const updateTextColor = (textColor: string) => {
  emit('update:design', {
    ...props.design,
    frame: {
      ...props.design.frame,
      textColor
    }
  })
}
</script>

<template>
  <div class="frame-editor">
    <!-- Sélection du style de cadre -->
    <div class="section-block">
      <div class="block-header">
        <Frame :size="16" aria-hidden="true" />
        <h4 class="block-title">Style de cadre décoratif</h4>
      </div>
      <div class="frame-grid">
        <button
          v-for="item in frameStyles"
          :key="item.id"
          type="button"
          :class="['frame-card', { active: props.design.frame.type === item.id }]"
          @click="selectFrameType(item.id)"
        >
          <span class="frame-title">{{ item.label }}</span>
          <span class="frame-desc">{{ item.desc }}</span>
        </button>
      </div>
    </div>

    <!-- Options du cadre si actif -->
    <div v-if="props.design.frame.type !== 'none'" class="frame-options-panel">
      <!-- Texte d'appel à l'action -->
      <div class="section-block">
        <div class="block-header">
          <Type :size="16" aria-hidden="true" />
          <h4 class="block-title">Texte d'appel à l'action (Call-to-Action)</h4>
        </div>
        <div class="input-with-counter">
          <input
            type="text"
            class="form-control"
            maxlength="30"
            :value="props.design.frame.text"
            placeholder="ex: SCANNEZ-MOI"
            @input="updateText(($event.target as HTMLInputElement).value)"
          />
          <span class="char-counter">{{ (props.design.frame.text || '').length }} / 30</span>
        </div>

        <!-- Presets rapides de texte -->
        <div class="presets-row">
          <button
            v-for="preset in quickTextPresets"
            :key="preset"
            type="button"
            class="text-chip"
            @click="updateText(preset)"
          >
            {{ preset }}
          </button>
        </div>
      </div>

      <!-- Couleurs du cadre et du texte -->
      <div class="colors-row">
        <div class="color-item">
          <label class="color-label">Couleur du cadre</label>
          <div class="color-picker-box">
            <input
              type="color"
              class="native-color-picker"
              :value="props.design.frame.frameColor"
              @input="updateFrameColor(($event.target as HTMLInputElement).value)"
            />
            <input
              type="text"
              class="hex-input"
              maxlength="7"
              :value="props.design.frame.frameColor"
              @change="updateFrameColor(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <div class="color-item">
          <label class="color-label">Couleur du texte</label>
          <div class="color-picker-box">
            <input
              type="color"
              class="native-color-picker"
              :value="props.design.frame.textColor"
              @input="updateTextColor(($event.target as HTMLInputElement).value)"
            />
            <input
              type="text"
              class="hex-input"
              maxlength="7"
              :value="props.design.frame.textColor"
              @change="updateTextColor(($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.frame-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.block-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.block-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.frame-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: var(--space-2);
}

.frame-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem 0.85rem;
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.frame-card:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg);
}

.frame-card.active {
  background-color: rgba(99, 102, 241, 0.1);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.frame-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.frame-card.active .frame-title {
  color: var(--color-primary);
}

.frame-desc {
  font-size: 0.725rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

.frame-options-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: 1rem;
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.input-with-counter {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.85rem;
  padding-right: 4rem;
  font-size: 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
  text-transform: uppercase;
}

.char-counter {
  position: absolute;
  right: 0.75rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  pointer-events: none;
}

.presets-row {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.text-chip {
  padding: 0.25rem 0.5rem;
  font-size: 0.725rem;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.text-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.colors-row {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.color-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text);
}

.color-picker-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.native-color-picker {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.hex-input {
  width: 85px;
  padding: 0.4rem 0.5rem;
  font-family: monospace;
  font-size: 0.825rem;
  text-transform: uppercase;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
}
</style>
