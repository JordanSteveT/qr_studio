<script setup lang="ts">
import type { QrDesign, QrFrameType } from '~/types/design'
import { Frame, Type } from 'lucide-vue-next'

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

const normalizeHexColor = (raw: string): string | null => {
  const trimmed = raw.trim()
  const match3 = trimmed.match(/^#?([0-9a-fA-F]{3})$/)
  if (match3?.[1]) {
    const [r, g, b] = match3[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  const match6 = trimmed.match(/^#?([0-9a-fA-F]{6})$/)
  if (match6?.[1]) {
    return `#${match6[1]}`.toLowerCase()
  }
  return null
}

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

const updateFrameColor = (rawColor: string) => {
  const frameColor = normalizeHexColor(rawColor)
  if (!frameColor) return
  emit('update:design', {
    ...props.design,
    frame: {
      ...props.design.frame,
      frameColor
    }
  })
}

const updateTextColor = (rawColor: string) => {
  const textColor = normalizeHexColor(rawColor)
  if (!textColor) return
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
          <h4 class="block-title">Texte d’appel à l’action</h4>
        </div>
        <div class="input-with-counter">
          <input
            type="text"
            class="form-control"
            maxlength="30"
            :value="props.design.frame.text"
            placeholder="ex: SCANNEZ-MOI"
            @input="updateText(($event.target as HTMLInputElement).value)"
          >
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
              aria-label="Couleur du cadre"
              :value="props.design.frame.frameColor"
              @input="updateFrameColor(($event.target as HTMLInputElement).value)"
            >
            <input
              type="text"
              class="hex-input"
              maxlength="7"
              aria-label="Code hex couleur du cadre"
              :value="props.design.frame.frameColor"
              @input="updateFrameColor(($event.target as HTMLInputElement).value)"
              @change="updateFrameColor(($event.target as HTMLInputElement).value)"
            >
          </div>
        </div>

        <div class="color-item">
          <label class="color-label">Couleur du texte</label>
          <div class="color-picker-box">
            <input
              type="color"
              class="native-color-picker"
              aria-label="Couleur du texte du cadre"
              :value="props.design.frame.textColor"
              @input="updateTextColor(($event.target as HTMLInputElement).value)"
            >
            <input
              type="text"
              class="hex-input"
              maxlength="7"
              aria-label="Code hex couleur du texte"
              :value="props.design.frame.textColor"
              @input="updateTextColor(($event.target as HTMLInputElement).value)"
              @change="updateTextColor(($event.target as HTMLInputElement).value)"
            >
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
  gap: 1.15rem;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.block-header {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text);
}

.block-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.frame-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(135px, 1fr));
  gap: 0.5rem;
}

.frame-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.75rem 0.85rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.frame-card:hover {
  border-color: var(--color-border-hover);
  background-color: var(--color-surface-hover);
}

.frame-card.active {
  background-color: #d9f24a;
  border-color: #1a1523;
  box-shadow: 0 2px 0 #1a1523;
}

.frame-title {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--color-text);
}

.frame-card.active .frame-title {
  color: #1a1523;
}

.frame-desc {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
}

.frame-card.active .frame-desc {
  color: #332c3f;
}

.frame-options-panel {
  display: flex;
  flex-direction: column;
  gap: 0.95rem;
  padding: 1rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.input-with-counter {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 0.65rem 0.9rem;
  padding-right: 4rem;
  font-size: 0.92rem;
  font-weight: 600;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  text-transform: uppercase;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-border-focus);
}

.char-counter {
  position: absolute;
  right: 0.8rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  pointer-events: none;
}

.presets-row {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.text-chip {
  padding: 0.28rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.text-chip:hover {
  border-color: #1a1523;
  background-color: #d9f24a;
  color: #1a1523;
}

.colors-row {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.color-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.color-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
}

.color-picker-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.native-color-picker {
  width: 34px;
  height: 34px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  padding: 2px;
}

.hex-input {
  width: 90px;
  padding: 0.4rem 0.55rem;
  font-family: var(--font-mono);
  font-size: 0.84rem;
  text-transform: uppercase;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text);
}
</style>
