<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { QrCode, PlusCircle, FolderKanban, Moon, Sun, Menu, X } from 'lucide-vue-next'

const isMobileMenuOpen = ref(false)
const isDarkMode = ref(false)

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  if (typeof document !== 'undefined') {
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('qr_studio_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      localStorage.setItem('qr_studio_theme', 'light')
    }
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('qr_studio_theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
  }
})

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner app-container">
      <!-- Logo de l'application -->
      <NuxtLink to="/" class="logo-group" @click="closeMobileMenu">
        <div class="logo-icon-wrapper" aria-hidden="true">
          <QrCode class="logo-icon" :size="18" />
        </div>
        <div class="logo-text">
          <span class="logo-title">QR Studio</span>
        </div>
      </NuxtLink>

      <!-- Navigation Desktop -->
      <nav class="nav-desktop" aria-label="Navigation principale">
        <NuxtLink to="/create" class="nav-link" active-class="nav-link--active">
          <PlusCircle :size="16" />
          <span>Créer un QR code</span>
        </NuxtLink>
        <NuxtLink to="/projects" class="nav-link" active-class="nav-link--active">
          <FolderKanban :size="16" />
          <span>Mes projets</span>
        </NuxtLink>
      </nav>

      <!-- Contrôles d'en-tête (Thème & Menu Mobile) -->
      <div class="header-actions">
        <button
          type="button"
          class="theme-toggle-btn"
          :aria-label="isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'"
          @click="toggleDarkMode"
        >
          <Sun v-if="isDarkMode" :size="18" class="theme-icon" />
          <Moon v-else :size="18" class="theme-icon" />
        </button>

        <button
          type="button"
          class="mobile-menu-btn"
          :aria-label="isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
          :aria-expanded="isMobileMenuOpen"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <X v-if="isMobileMenuOpen" :size="22" />
          <Menu v-else :size="22" />
        </button>
      </div>
    </div>

    <!-- Tiroir Mobile -->
    <div
      v-if="isMobileMenuOpen"
      class="mobile-nav-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Menu mobile"
    >
      <nav class="mobile-nav-links">
        <NuxtLink to="/create" class="mobile-nav-item" @click="closeMobileMenu">
          <PlusCircle :size="18" />
          <span>Créer un QR code</span>
        </NuxtLink>
        <NuxtLink to="/projects" class="mobile-nav-item" @click="closeMobileMenu">
          <FolderKanban :size="18" />
          <span>Mes projets</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(8px);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}

.logo-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  background-color: var(--color-text);
  color: var(--color-bg);
  box-shadow: var(--shadow-xs);
}

.logo-title {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.nav-desktop {
  display: none;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 768px) {
  .nav-desktop {
    display: flex;
  }
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-text);
  background-color: var(--color-surface-hover);
}

.nav-link--active {
  color: var(--color-text);
  font-weight: 600;
  background-color: var(--color-surface);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-toggle-btn,
.mobile-menu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.theme-toggle-btn:hover,
.mobile-menu-btn:hover {
  color: var(--color-text);
  background-color: var(--color-surface-hover);
}

.mobile-menu-btn {
  display: inline-flex;
}

@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;
  }
}

.mobile-nav-drawer {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 1rem 1.25rem 1.5rem;
  animation: slideDown 200ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.mobile-nav-item:hover {
  background-color: var(--color-surface-hover);
}
</style>
