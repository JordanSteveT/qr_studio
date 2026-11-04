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
        <h4 class="block-title">Niveau de correction d'erreur (Redondance Reed-Solomon)</h4>
      </div>
      <p class="section-hint">
        Permet au QR code de rester lisible même s'il est partiellement endommagé ou masqué par un logo.
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
        <h4 class="block-title">Zone de silence (Marge blanche extérieure)</h4>
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
        />
        <span class="slider-hint">
          Une marge minimale de 10 px est conseillée pour que les capteurs optiques distinguent le QR code de son arrière-plan.
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.advanced-settings {
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

.section-hint {
  font-size: 0.775rem;
  color: var(--color-text-muted);
  margin: 0;
}

.levels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
}

.level-card {
  display: flex;
  flex-direction: column;
  padding: 0.65rem 0.85rem;
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.level-card:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg);
}

.level-card.active {
  background-color: rgba(99, 102, 241, 0.1);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-name {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--color-text);
}

.level-card.active .level-name {
  color: var(--color-primary);
}

.level-percent {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
}

.level-desc {
  font-size: 0.725rem;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}

.slider-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem;
  background-color: var(--color-bg-alt);
  border-radius: var(--radius-md);
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.slider-title {
  font-weight: 500;
  color: var(--color-text);
}

.slider-val {
  color: var(--color-text-muted);
}

.slider-control {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.slider-hint {
  font-size: 0.725rem;
  color: var(--color-text-muted);
}
</style>
