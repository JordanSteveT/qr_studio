<script setup lang="ts">
import type { QrDesign, QrDotType, QrCornerSquareType, QrCornerDotType } from '~/types/design'

const props = defineProps<{
  design: QrDesign
}>()

const emit = defineEmits<{
  (e: 'update:design', design: QrDesign): void
}>()

const dotTypes: { id: QrDotType; label: string; desc: string }[] = [
  { id: 'rounded', label: 'Arrondi', desc: 'Coins adoucis élégants' },
  { id: 'square', label: 'Carré', desc: 'Classique et net' },
  { id: 'dots', label: 'Points', desc: 'Ronds circulaires doux' },
  { id: 'extra-rounded', label: 'Goutte', desc: 'Courbure prononcée' },
  { id: 'classy', label: 'Classique', desc: 'Coins biseautés modernes' },
  { id: 'classy-rounded', label: 'Élégant', desc: 'Biseau à terminaisons douces' }
]

const cornerSquareTypes: { id: QrCornerSquareType; label: string }[] = [
  { id: 'extra-rounded', label: 'Arrondi' },
  { id: 'square', label: 'Carré' },
  { id: 'dot', label: 'Rond' }
]

const cornerDotTypes: { id: QrCornerDotType; label: string }[] = [
  { id: 'dot', label: 'Rond' },
  { id: 'square', label: 'Carré' }
]

const selectDotType = (type: QrDotType) => {
  emit('update:design', {
    ...props.design,
    dots: {
      ...props.design.dots,
      type
    }
  })
}

const selectCornerSquare = (type: QrCornerSquareType) => {
  emit('update:design', {
    ...props.design,
    cornersSquare: {
      ...props.design.cornersSquare,
      type
    }
  })
}

const selectCornerDot = (type: QrCornerDotType) => {
  emit('update:design', {
    ...props.design,
    cornersDot: {
      ...props.design.cornersDot,
      type
    }
  })
}
</script>

<template>
  <div class="shape-editor">
    <!-- Forme des modules principaux -->
    <div class="section-block">
      <div class="block-header">
        <h4 class="block-title">Motif des modules</h4>
      </div>
      <div class="shape-grid">
        <button
          v-for="item in dotTypes"
          :key="item.id"
          type="button"
          :class="['shape-card', { active: props.design.dots.type === item.id }]"
          @click="selectDotType(item.id)"
        >
          <span class="shape-title">{{ item.label }}</span>
          <span class="shape-desc">{{ item.desc }}</span>
        </button>
      </div>
    </div>

    <!-- Forme des coins extérieurs (Yeux) -->
    <div class="section-block">
      <div class="block-header">
        <h4 class="block-title">Coins extérieurs</h4>
      </div>
      <div class="pill-group">
        <button
          v-for="item in cornerSquareTypes"
          :key="item.id"
          type="button"
          :class="['pill-btn', { active: props.design.cornersSquare.type === item.id }]"
          @click="selectCornerSquare(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <!-- Forme des pupilles intérieures -->
    <div class="section-block">
      <div class="block-header">
        <h4 class="block-title">Pupille intérieure</h4>
      </div>
      <div class="pill-group">
        <button
          v-for="item in cornerDotTypes"
          :key="item.id"
          type="button"
          :class="['pill-btn', { active: props.design.cornersDot.type === item.id }]"
          @click="selectCornerDot(item.id)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shape-editor {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.block-header {
  display: flex;
  align-items: center;
}

.block-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.shape-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.5rem;
}

.shape-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.65rem 0.8rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.shape-card:hover {
  border-color: var(--color-border-hover);
  background-color: var(--color-surface-hover);
}

.shape-card.active {
  background-color: #d9f24a;
  border-color: #1a1523;
  box-shadow: 0 2px 0 #1a1523;
}

.shape-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.shape-card.active .shape-title {
  color: #1a1523;
}

.shape-desc {
  font-size: 0.74rem;
  color: var(--color-text-subtle);
  margin-top: 0.15rem;
  line-height: 1.3;
}

.shape-card.active .shape-desc {
  color: #332c3f;
}

.pill-group {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.pill-btn {
  padding: 0.45rem 1rem;
  font-size: 0.84rem;
  font-weight: 600;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pill-btn:hover {
  border-color: var(--color-border-hover);
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.pill-btn.active {
  background-color: #d9f24a;
  border-color: #1a1523;
  color: #1a1523;
  font-weight: 700;
}
</style>
