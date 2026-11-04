<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import AppFooter from '~/components/layout/AppFooter.vue'
</script>

<template>
  <div class="qr-app-root">
    <AppHeader />
    <main class="qr-main-content">
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.qr-app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.qr-main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
