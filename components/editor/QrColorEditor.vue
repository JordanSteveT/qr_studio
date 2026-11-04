<script setup lang="ts">
import { computed } from 'vue'
import type { QrDesign, QrGradient } from '~/types/design'
import {
  calculateContrastRatio,
  getContrastAssessment
} from '~/services/qr/contrast-checker.service'
import { Palette, ShieldAlert, CheckCircle2, Blend } from 'lucide-vue-next'

const props = defineProps<{
  design: QrDesign
}>()

const emit = defineEmits<{
  (e: 'update:design', design: QrDesign): void
}>()

// État dégradé actif sur les modules
const isDotsGradientActive = computed(() => !!props.design.dots.gradient)

// Calcul du contraste en temps réel
const contrastRatio = computed(() => {
  if (props.design.background.isTransparent) {
    return 21 // Considéré neutre
  }
  const dotsColor = props.design.dots.color
  const bgColor = props.design.background.color
  return calculateContrastRatio(dotsColor, bgColor)
})

const contrastAssessment = computed(() => getContrastAssessment(contrastRatio.value))

// Handlers de mise à jour des couleurs
const updateDotsColor = (color: string) => {
  emit('update:design', {
    ...props.design,
    dots: {
      ...props.design.dots,
      color,
      gradient: undefined
    },
    cornersSquare: {
      ...props.design.cornersSquare,
      color
    },
    cornersDot: {
      ...props.design.cornersDot,
      color
    }
  })
}

const toggleDotsGradient = (active: boolean) => {
  if (active) {
    const gradient: QrGradient = {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: props.design.dots.color },
        { offset: 1, color: '#6366f1' }
      ]
    }
    emit('update:design', {
      ...props.design,
      dots: {
        ...props.design.dots,
        gradient
      }
    })
  } else {
    emit('update:design', {
      ...props.design,
      dots: {
        ...props.design.dots,
        gradient: undefined
      }
    })
  }
}

const updateGradientStop = (index: 0 | 1, color: string) => {
  if (!props.design.dots.gradient) return
  const currentStops = [...props.design.dots.gradient.colorStops] as [
    { offset: number; color: string },
    { offset: number; color: string }
  ]
  currentStops[index] = { ...currentStops[index], color }

  emit('update:design', {
    ...props.design,
    dots: {
      ...props.design.dots,
      gradient: {
        ...props.design.dots.gradient,
        colorStops: currentStops
      }
    }
  })
}

const updateBackgroundColor = (color: string) => {
  emit('update:design', {
    ...props.design,
    background: {
      ...props.design.background,
      color,
      isTransparent: false
    }
  })
}

const toggleBackgroundTransparent = (isTransparent: boolean) => {
  emit('update:design', {
    ...props.design,
    background: {
      ...props.design.background,
      isTransparent
    }
  })
}

// Palettes prédéfinies élégantes
const presetPalettes = [
  { label: 'Obsidienne', dots: '#0f172a', bg: '#ffffff' },
  { label: 'Indigo Royal', dots: '#4338ca', bg: '#f8fafc' },
  { label: 'Émeraude', dots: '#065f46', bg: '#ecfdf5' },
  { label: 'Rubis', dots: '#9f1239', bg: '#fff1f2' },
  { label: 'Ambre Tech', dots: '#b45309', bg: '#fefce8' },
  { label: 'Cyber Violet', dots: '#6b21a8', bg: '#faf5ff' }
]

const applyPreset = (preset: { dots: string; bg: string }) => {
  emit('update:design', {
    ...props.design,
    dots: {
      ...props.design.dots,
      color: preset.dots,
      gradient: undefined
    },
    cornersSquare: {
      ...props.design.cornersSquare,
      color: preset.dots
    },
    cornersDot: {
      ...props.design.cornersDot,
      color: preset.dots
    },
    background: {
      ...props.design.background,
      color: preset.bg,
      isTransparent: false
    }
  })
}
</script>

<template>
  <div class="color-editor">
    <!-- Palettes prédéfinies -->
    <div class="palette-row">
      <span class="palette-title">Palettes recommandées :</span>
      <div class="presets-list">
        <button
          v-for="p in presetPalettes"
          :key="p.label"
          type="button"
          class="preset-bubble"
          :title="p.label"
          @click="applyPreset(p)"
        >
          <span class="bubble-half" :style="{ backgroundColor: p.dots }"></span>
          <span class="bubble-half" :style="{ backgroundColor: p.bg }"></span>
        </button>
      </div>
    </div>

    <!-- Couleur des modules -->
    <div class="section-block">
      <div class="block-header">
        <Palette :size="16" aria-hidden="true" />
        <h4 class="block-title">Couleur des motifs (modules)</h4>
      </div>

      <div class="color-picker-row">
        <input
          id="dots-color-picker"
          type="color"
          class="native-color-picker"
          :value="props.design.dots.color"
          @input="updateDotsColor(($event.target as HTMLInputElement).value)"
        />
        <input
          type="text"
          class="hex-input"
          :value="props.design.dots.color"
          maxlength="7"
          @change="updateDotsColor(($event.target as HTMLInputElement).value)"
        />

        <button
          type="button"
          :class="['toggle-grad-btn', { active: isDotsGradientActive }]"
          @click="toggleDotsGradient(!isDotsGradientActive)"
        >
          <Blend :size="14" aria-hidden="true" />
          <span>{{ isDotsGradientActive ? 'Dégradé actif' : 'Activer un dégradé' }}</span>
        </button>
      </div>

      <!-- Commandes de dégradé si actif -->
      <div v-if="isDotsGradientActive && props.design.dots.gradient" class="gradient-panel">
        <div class="gradient-stop">
          <span class="stop-label">Couleur 1 :</span>
          <input
            type="color"
            class="native-color-picker"
            :value="props.design.dots.gradient.colorStops[0].color"
            @input="updateGradientStop(0, ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div class="gradient-stop">
          <span class="stop-label">Couleur 2 :</span>
          <input
            type="color"
            class="native-color-picker"
            :value="props.design.dots.gradient.colorStops[1].color"
            @input="updateGradientStop(1, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>

    <!-- Couleur d'arrière-plan -->
    <div class="section-block">
      <div class="block-header">
        <h4 class="block-title">Arrière-plan</h4>
      </div>

      <div class="color-picker-row">
        <input
          id="bg-color-picker"
          type="color"
          class="native-color-picker"
          :disabled="props.design.background.isTransparent"
          :value="props.design.background.color"
          @input="updateBackgroundColor(($event.target as HTMLInputElement).value)"
        />
        <input
          type="text"
          class="hex-input"
          :disabled="props.design.background.isTransparent"
          :value="props.design.background.color"
          maxlength="7"
          @change="updateBackgroundColor(($event.target as HTMLInputElement).value)"
        />

        <label class="transparent-checkbox">
          <input
            type="checkbox"
            :checked="props.design.background.isTransparent"
            @change="toggleBackgroundTransparent(($event.target as HTMLInputElement).checked)"
          />
          <span>Fond transparent</span>
        </label>
      </div>
    </div>

    <!-- Indicateur de lisibilité / Contraste WCAG -->
    <div
      class="contrast-banner"
      :class="[`contrast--${contrastAssessment.level}`]"
      role="status"
    >
      <div class="contrast-icon">
        <CheckCircle2 v-if="contrastAssessment.isScannable" :size="18" />
        <ShieldAlert v-else :size="18" />
      </div>
      <div class="contrast-content">
        <span class="contrast-score">Ratio : {{ contrastRatio }}:1</span>
        <span class="contrast-text">{{ contrastAssessment.message }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-editor {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.palette-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
  gap: var(--space-2);
}

.palette-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.presets-list {
  display: flex;
  gap: 0.5rem;
}

.preset-bubble {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  padding: 0;
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.preset-bubble:hover {
  transform: scale(1.15);
}

.bubble-half {
  flex: 1;
  height: 100%;
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

.color-picker-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.native-color-picker {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  background: transparent;
  padding: 0;
}

.hex-input {
  width: 90px;
  padding: 0.5rem 0.6rem;
  font-family: monospace;
  font-size: 0.875rem;
  text-transform: uppercase;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg);
  color: var(--color-text);
}

.toggle-grad-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-grad-btn.active {
  background-color: rgba(99, 102, 241, 0.15);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}

.gradient-panel {
  display: flex;
  gap: var(--space-4);
  padding: 0.75rem;
  background-color: var(--color-bg-alt);
  border-radius: var(--radius-md);
  margin-top: 0.25rem;
}

.gradient-stop {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stop-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.transparent-checkbox {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.contrast-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  border: 1px solid transparent;
}

.contrast--excellent,
.contrast--good {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3);
  color: #065f46;
}

.contrast--warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #92400e;
}

.contrast--danger {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #991b1b;
}

.contrast-content {
  display: flex;
  flex-direction: column;
}

.contrast-score {
  font-weight: 700;
}

.contrast-text {
  font-size: 0.8rem;
  margin-top: 0.1rem;
}
</style>
