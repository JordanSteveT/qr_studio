<script setup lang="ts">
import { QrCode, PlusCircle } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'create'): void
}>()
</script>

<template>
  <div class="empty-state">
    <div class="icon-bubble">
      <QrCode :size="48" class="qr-icon" />
    </div>

    <h2 class="empty-title">Aucun projet enregistré</h2>
    <p class="empty-desc">
      Vos QR codes enregistrés apparaîtront ici. Ils sont stockés de manière 100 % locale et confidentielle dans la mémoire de votre navigateur.
    </p>

    <NuxtLink to="/create" class="create-btn">
      <PlusCircle :size="18" />
      <span>Créer mon premier QR Code</span>
    </NuxtLink>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1.5rem;
  background-color: var(--color-surface);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-xl);
  margin: 2rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.icon-bubble {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background-color: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.qr-icon {
  color: var(--color-primary);
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.empty-desc {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  max-width: 440px;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-primary);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.create-btn:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
</style>
