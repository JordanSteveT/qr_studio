<script setup lang="ts">
import type { QrDesign, QrErrorCorrectionLevel } from '~/types/design'
import { Sliders, ShieldCheck } from 'lucide-vue-next'

const props = defineProps<{
  design: QrDesign
}>()

const emit = defineEmits<{
  (e: 'update:design', design: QrDesign): void
}>()

const errorLevels: { id: QrErrorCorrectionLevel; label: string; percent: string; desc: string }[] = [
  { id: 'L', label: 'Faible', percent: '~7%', desc: 'Haute clarté visuelle' },
  { id: 'M', label: 'Moyen', percent: '~15%', desc: 'Standard recommandé' },
  { id: 'Q', label: 'Élevé', percent: '~25%', desc: 'Idéal avec logo ou salissures' },
  { id: 'H', label: 'Maximum', percent: '~30%', desc: 'Robustesse maximale' }
]

const updateErrorCorrection = (level: QrErrorCorrectionLevel) => {
  emit('update:design', {
    ...props.design,
    errorCorrectionLevel: level
  })
}

const updateMargin = (margin: number) => {
  emit('update:design', {
    ...props.design,
    margin
  })
}
</script>

<template>
  <div class="advanced-settings">
    <!-- Niveau de correction d'erreur -->
    <div class="section-block">
      <div class="block-header">
        <ShieldCheck :size="16" aria-hidden="true" />
        <h4 class="block-title">Niveau de correction d’erreur (Reed-Solomon)</h4>
      </div>
      <p class="section-hint">
        Permet au QR code de rester lisible même s’il est partiellement endommagé ou masqué par un logo.
      </p>
      <div class="levels-grid">
        <button
          v-for="lvl in errorLevels"
          :key="lvl.id"
          type="button"
          :class="['level-card', { active: props.design.errorCorrectionLevel === lvl.id }]"
          @click="updateErrorCorrection(lvl.id)"
        >
          <div class="level-header">
            <span class="level-name">{{ lvl.label }} ({{ lvl.id }})</span>
            <span class="level-percent">{{ lvl.percent }}</span>
          </div>
          <span class="level-desc">{{ lvl.desc }}</span>
        </button>
      </div>
    </div>

    <!-- Marge extérieure (Quiet Zone) -->
    <div class="section-block">
      <div class="block-header">
        <Sliders :size="16" aria-hidden="true" />
        <h4 class="block-title">Zone de silence (Marge extérieure)</h4>
      </div>
      <div class="slider-row">
        <div class="slider-header">
          <span class="slider-title">Épaisseur de marge</span>
          <span class="slider-val">{{ props.design.margin }} px</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          step="2"
          class="slider-control"
          :value="props.design.margin"
          @input="updateMargin(parseInt(($event.target as HTMLInputElement).value, 10))"
        >
        <span class="slider-hint">
          Une marge minimale de 10 px est conseillée pour que les capteurs distinguent le QR code de son arrière-plan.
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.advanced-settings {
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

.section-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin: 0;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.level-card {
  display: flex;
  flex-direction: column;
  padding: 0.7rem 0.85rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.level-card:hover {
  border-color: var(--color-border-hover);
  background-color: var(--color-surface-hover);
}

.level-card.active {
  background-color: #d9f24a;
  border-color: #1a1523;
  box-shadow: 0 2px 0 #1a1523;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.level-name {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--color-text);
}

.level-card.active .level-name {
  color: #1a1523;
}

.level-percent {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.level-card.active .level-percent {
  color: #1a1523;
}

.level-desc {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}

.level-card.active .level-desc {
  color: #332c3f;
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.85rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.84rem;
}

.slider-title {
  font-weight: 600;
  color: var(--color-text);
}

.slider-val {
  font-weight: 700;
  color: var(--color-text);
}

.slider-control {
  width: 100%;
  accent-color: #1a1523;
  cursor: pointer;
}

.dark .slider-control {
  accent-color: #d9f24a;
}

.slider-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>
