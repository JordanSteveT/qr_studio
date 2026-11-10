<script setup lang="ts">
import { QrCode, PlusCircle } from 'lucide-vue-next'
</script>

<template>
  <div class="empty-state">
    <div class="icon-bubble">
      <QrCode :size="44" class="qr-icon" />
    </div>

    <h2 class="empty-title">Aucun projet enregistré</h2>
    <p class="empty-desc">
      Vos QR codes enregistrés apparaîtront ici. Ils sont stockés de manière 100 % locale et confidentielle dans la mémoire de votre navigateur.
    </p>

    <NuxtLink to="/create" class="qr-btn qr-btn--lime">
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
  border: 2.5px dashed var(--color-border);
  border-radius: var(--radius-2xl);
  margin: 2rem auto;
  max-width: 600px;
}

.icon-bubble {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background-color: #d9f24a;
  border: 3px solid #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.qr-icon {
  color: #1a1523;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.empty-desc {
  font-size: 0.96rem;
  color: var(--color-text-muted);
  max-width: 440px;
  line-height: 1.55;
  margin-bottom: 2rem;
}
</style>
