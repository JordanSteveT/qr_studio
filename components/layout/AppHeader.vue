<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { QrCode, PlusCircle, FolderKanban, Moon, Sun, Menu, X, ArrowRight } from 'lucide-vue-next'

const route = useRoute()
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

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

const handleResize = () => {
  if (typeof window !== 'undefined' && window.innerWidth >= 810 && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

watch(() => route.fullPath, () => {
  closeMobileMenu()
})

onMounted(() => {
  const savedTheme = localStorage.getItem('qr_studio_theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
  }

  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<template>
  <header class="app-header">
    <div class="header-inner app-container">
      <!-- Marque QR Studio -->
      <NuxtLink to="/" class="logo-group" @click="closeMobileMenu">
        <div class="logo-icon-wrapper" aria-hidden="true">
          <QrCode class="logo-icon" :size="18" />
        </div>
        <span class="logo-title">QR Studio</span>
      </NuxtLink>

      <!-- Navigation Desktop -->
      <nav class="nav-desktop" aria-label="Navigation principale">
        <NuxtLink to="/create" class="nav-link" active-class="nav-link--active">
          <span>Éditeur QR</span>
        </NuxtLink>
        <NuxtLink to="/projects" class="nav-link" active-class="nav-link--active">
          <span>Mes projets</span>
        </NuxtLink>
        <NuxtLink to="/#formats" class="nav-link">
          <span>10 Formats</span>
        </NuxtLink>
        <NuxtLink to="/#faq" class="nav-link">
          <span>FAQ</span>
        </NuxtLink>
      </nav>

      <!-- Actions d'en-tête -->
      <div class="header-actions">
        <button
          type="button"
          class="icon-btn"
          :aria-label="isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'"
          :title="isDarkMode ? 'Mode clair' : 'Mode sombre'"
          @click="toggleDarkMode"
        >
          <Sun v-if="isDarkMode" :size="18" />
          <Moon v-else :size="18" />
        </button>

        <NuxtLink to="/create" class="header-cta-btn">
          <span>Créer gratuit</span>
          <ArrowRight :size="15" aria-hidden="true" />
        </NuxtLink>

        <button
          type="button"
          class="icon-btn mobile-only"
          :aria-label="isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'"
          :aria-expanded="isMobileMenuOpen"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <X v-if="isMobileMenuOpen" :size="20" />
          <Menu v-else :size="20" />
        </button>
      </div>
    </div>

    <!-- Tiroir Mobile -->
    <Transition name="slide-down">
      <div
        v-if="isMobileMenuOpen"
        class="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu mobile"
      >
        <nav class="mobile-nav-links">
          <NuxtLink to="/create" class="mobile-nav-item" @click="closeMobileMenu">
            <PlusCircle :size="18" aria-hidden="true" />
            <span>Créer un QR code</span>
          </NuxtLink>
          <NuxtLink to="/projects" class="mobile-nav-item" @click="closeMobileMenu">
            <FolderKanban :size="18" aria-hidden="true" />
            <span>Mes projets locaux</span>
          </NuxtLink>
          <NuxtLink to="/#formats" class="mobile-nav-item" @click="closeMobileMenu">
            <span>Les 10 formats pris en charge</span>
          </NuxtLink>
          <NuxtLink to="/#faq" class="mobile-nav-item" @click="closeMobileMenu">
            <span>Questions fréquentes</span>
          </NuxtLink>
        </nav>
        <div class="mobile-nav-footer">
          <NuxtLink to="/create" class="qr-btn qr-btn--lime mobile-cta-full" @click="closeMobileMenu">
            <span>Lancer le studio — Gratuit</span>
            <ArrowRight :size="16" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background-color: color-mix(in srgb, var(--color-bg) 90%, transparent);
  border-bottom: 1.5px solid var(--color-border);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4.25rem;
  gap: 1.25rem;
}

/* ── Logo ── */
.logo-group {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  background-color: #d9f24a;
  color: #1a1523;
  border: 2.5px solid #1a1523;
  box-shadow: 0 2px 0 #1a1523;
  transition: transform var(--transition-spring), background-color var(--transition-fast);
}

.logo-group:hover .logo-icon-wrapper {
  transform: rotate(-6deg) scale(1.05);
  background-color: #c2de2c;
}

.logo-title {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text);
  line-height: 1;
}

/* ── Nav desktop ── */
.nav-desktop {
  display: none;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  justify-content: center;
}

@media (min-width: 810px) {
  .nav-desktop {
    display: flex;
  }
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
  border-radius: var(--radius-full);
  transition: color var(--transition-normal), background-color var(--transition-fast);
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--color-text-muted);
  background-color: var(--color-surface-hover);
}

.nav-link--active {
  font-weight: 700;
  background-color: var(--color-accent-subtle);
  color: var(--color-text);
}

/* ── Actions ── */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.header-cta-btn {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 20px;
  font-size: 0.92rem;
  font-weight: 600;
  color: #fff8ee;
  background-color: #1a1523;
  border: 2.5px solid #1a1523;
  border-radius: 999px;
  text-decoration: none;
  white-space: nowrap;
  transition: gap var(--transition-normal), transform var(--transition-spring), background-color var(--transition-fast);
}

@media (min-width: 810px) {
  .header-cta-btn {
    display: inline-flex;
  }
}

.header-cta-btn:hover {
  gap: 12px;
  background-color: #332c3f;
  transform: translateY(-1px);
}

.dark .header-cta-btn {
  background-color: #d9f24a;
  color: #1a1523;
  border-color: #d9f24a;
}

.dark .header-cta-btn:hover {
  background-color: #c2de2c;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-hover);
}

.mobile-only {
  display: inline-flex;
}

@media (min-width: 810px) {
  .mobile-only {
    display: none;
  }
}

/* ── Tiroir mobile ── */
.mobile-nav-drawer {
  background-color: var(--color-bg);
  border-bottom: 2px solid var(--color-border);
  padding: 1rem 1.25rem 1.5rem;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.mobile-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast);
}

.mobile-nav-item:hover {
  background-color: var(--color-surface-hover);
}

.mobile-nav-footer {
  padding-top: 1rem;
  border-top: 1.5px solid var(--color-border);
}

.mobile-cta-full {
  width: 100%;
}
</style>
