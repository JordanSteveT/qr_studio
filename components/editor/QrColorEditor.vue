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

/**
 * Normalise un code hex (#RGB ou #RRGGBB) en #rrggbb valide, ou null si invalide.
 */
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

// État dégradé actif sur les modules
const isDotsGradientActive = computed(() => !!props.design.dots.gradient)

// Calcul du contraste en temps réel
const contrastRatio = computed(() => {
  if (props.design.background.isTransparent) {
    return 21
  }
  const dotsColor = props.design.dots.color
  const bgColor = props.design.background.color
  return calculateContrastRatio(dotsColor, bgColor)
})

const contrastAssessment = computed(() => getContrastAssessment(contrastRatio.value))

// Handlers de mise à jour des couleurs
const updateDotsColor = (rawColor: string) => {
  const color = normalizeHexColor(rawColor)
  if (!color) return

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
        { offset: 1, color: '#2d5b94' }
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

const updateGradientStop = (index: 0 | 1, rawColor: string) => {
  if (!props.design.dots.gradient) return
  const color = normalizeHexColor(rawColor)
  if (!color) return

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

const updateGradientType = (type: 'linear' | 'radial') => {
  if (!props.design.dots.gradient) return
  emit('update:design', {
    ...props.design,
    dots: {
      ...props.design.dots,
      gradient: {
        ...props.design.dots.gradient,
        type
      }
    }
  })
}

const updateBackgroundColor = (rawColor: string) => {
  const color = normalizeHexColor(rawColor)
  if (!color) return

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

// Palettes prédéfinies harmonisées avec le thème QRStudio
const presetPalettes = [
  { label: 'Encre & Blanc', dots: '#1a1523', bg: '#ffffff' },
  { label: 'Encre & Crème', dots: '#1a1523', bg: '#fff8ee' },
  { label: 'Bleu Marine', dots: '#2d5b94', bg: '#ffffff' },
  { label: 'Émeraude', dots: '#065f46', bg: '#ecfdf5' },
  { label: 'Corail Studio', dots: '#9f1239', bg: '#fff1f2' },
  { label: 'Violet Profond', dots: '#4c1d95', bg: '#faf5ff' }
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
          :aria-label="`Appliquer la palette ${p.label}`"
          @click="applyPreset(p)"
        >
          <span class="bubble-half" :style="{ backgroundColor: p.dots }" />
          <span class="bubble-half" :style="{ backgroundColor: p.bg }" />
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
          aria-label="Sélecteur visuel couleur des modules"
          :value="props.design.dots.color"
          @input="updateDotsColor(($event.target as HTMLInputElement).value)"
        >
        <input
          type="text"
          class="hex-input"
          aria-label="Code hexadécimal des modules"
          :value="props.design.dots.color"
          maxlength="7"
          @input="updateDotsColor(($event.target as HTMLInputElement).value)"
          @change="updateDotsColor(($event.target as HTMLInputElement).value)"
        >

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
            aria-label="Dégradé couleur 1"
            :value="props.design.dots.gradient.colorStops[0].color"
            @input="updateGradientStop(0, ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div class="gradient-stop">
          <span class="stop-label">Couleur 2 :</span>
          <input
            type="color"
            class="native-color-picker"
            aria-label="Dégradé couleur 2"
            :value="props.design.dots.gradient.colorStops[1].color"
            @input="updateGradientStop(1, ($event.target as HTMLInputElement).value)"
          >
        </div>
        <div class="gradient-stop">
          <span class="stop-label">Style :</span>
          <select
            class="grad-select"
            :value="props.design.dots.gradient.type"
            aria-label="Type de dégradé"
            @change="updateGradientType(($event.target as HTMLSelectElement).value as 'linear' | 'radial')"
          >
            <option value="linear">Linéaire</option>
            <option value="radial">Radial</option>
          </select>
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
          aria-label="Sélecteur visuel couleur d'arrière-plan"
          :disabled="props.design.background.isTransparent"
          :value="props.design.background.color"
          @input="updateBackgroundColor(($event.target as HTMLInputElement).value)"
        >
        <input
          type="text"
          class="hex-input"
          aria-label="Code hexadécimal de l'arrière-plan"
          :disabled="props.design.background.isTransparent"
          :value="props.design.background.color"
          maxlength="7"
          @input="updateBackgroundColor(($event.target as HTMLInputElement).value)"
          @change="updateBackgroundColor(($event.target as HTMLInputElement).value)"
        >

        <label class="transparent-checkbox">
          <input
            type="checkbox"
            :checked="props.design.background.isTransparent"
            @change="toggleBackgroundTransparent(($event.target as HTMLInputElement).checked)"
          >
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
  gap: 1.15rem;
}

.palette-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.95rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  flex-wrap: wrap;
  gap: 0.65rem;
}

.palette-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.presets-list {
  display: flex;
  gap: 0.5rem;
}

.preset-bubble {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-border-hover);
  padding: 0;
  display: flex;
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition-spring);
}

.preset-bubble:hover {
  transform: scale(1.16);
}

.bubble-half {
  flex: 1;
  height: 100%;
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

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.native-color-picker {
  width: 38px;
  height: 38px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: transparent;
  padding: 2px;
}

.native-color-picker:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.hex-input {
  width: 96px;
  padding: 0.5rem 0.65rem;
  font-family: var(--font-mono);
  font-size: 0.88rem;
  text-transform: uppercase;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg);
  color: var(--color-text);
}

.hex-input:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.toggle-grad-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-grad-btn:hover {
  border-color: var(--color-border-hover);
}

.toggle-grad-btn.active {
  background-color: #d9f24a;
  border-color: #1a1523;
  color: #1a1523;
  font-weight: 700;
}

.gradient-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-top: 0.25rem;
}

.gradient-stop {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.stop-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.grad-select {
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.82rem;
  font-weight: 600;
}

.transparent-checkbox {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.contrast-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  border: 1.5px solid transparent;
}

.contrast--excellent,
.contrast--good {
  background-color: var(--color-success-bg);
  border-color: color-mix(in srgb, var(--color-success) 35%, transparent);
  color: var(--color-success);
}

.contrast--warning {
  background-color: var(--color-warning-bg);
  border-color: color-mix(in srgb, var(--color-warning) 35%, transparent);
  color: var(--color-warning);
}

.contrast--danger {
  background-color: var(--color-danger-bg);
  border-color: color-mix(in srgb, var(--color-danger) 35%, transparent);
  color: var(--color-danger);
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
