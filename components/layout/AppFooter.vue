<script setup lang="ts">
import { QrCode, ShieldCheck, Heart } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner app-container">
      <div class="footer-top">
        <!-- Colonne Marque & Engagement -->
        <div class="footer-brand">
          <NuxtLink to="/" class="footer-logo">
            <div class="footer-logo-badge" aria-hidden="true">
              <QrCode :size="18" />
            </div>
            <span class="brand-name">QR Studio</span>
          </NuxtLink>
          <p class="brand-desc">
            Générateur de QR codes professionnels, haute définition et 100 % confidentiel. Conçu pour durer sans serveur ni abonnement.
          </p>
          <div class="privacy-notice">
            <ShieldCheck :size="15" class="notice-icon" aria-hidden="true" />
            <span>100 % local • Zéro donnée transmise</span>
          </div>
        </div>

        <!-- Colonnes de liens (style QRStudio footer) -->
        <div class="footer-links-grid">
          <div class="footer-col">
            <h4 class="col-title">Application</h4>
            <ul class="col-list">
              <li><NuxtLink to="/create">Éditeur de QR code</NuxtLink></li>
              <li><NuxtLink to="/projects">Mes projets locaux</NuxtLink></li>
              <li><NuxtLink to="/#etapes">Comment ça marche</NuxtLink></li>
              <li><NuxtLink to="/#usages">Cas d'usage métiers</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Formats populaires</h4>
            <ul class="col-list">
              <li><NuxtLink to="/create?type=URL">Lien Web & URL</NuxtLink></li>
              <li><NuxtLink to="/create?type=WIFI">Connexion Wi-Fi</NuxtLink></li>
              <li><NuxtLink to="/create?type=VCARD">Carte de visite vCard</NuxtLink></li>
              <li><NuxtLink to="/create?type=EMAIL">E-mail pré-rempli</NuxtLink></li>
              <li><NuxtLink to="/create?type=EVENT">Invitation Calendrier</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Ressources</h4>
            <ul class="col-list">
              <li><NuxtLink to="/#formats">Les 10 formats</NuxtLink></li>
              <li><NuxtLink to="/#comparatif">Statique vs Dynamique</NuxtLink></li>
              <li><NuxtLink to="/#impression">Normes d'impression PAO</NuxtLink></li>
              <li><NuxtLink to="/#faq">Foire aux questions</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} QR Studio — Générateur de QR codes libres, statiques et locaux.
        </p>
        <p class="made-with">
          Conçu avec <Heart :size="14" class="heart-icon" aria-hidden="true" /> pour un web libre et privé.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  background-color: #1a1523;
  color: #fff8ee;
  padding: 4.5rem 0 2.5rem;
  font-size: 0.92rem;
  border-top: 3px solid #1a1523;
}

.dark .app-footer {
  background-color: #100c17;
  border-top: 1.5px solid #2b2438;
}

.footer-top {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding-bottom: 3rem;
  border-bottom: 1.5px solid #332c3f;
}

@media (min-width: 860px) {
  .footer-top {
    flex-direction: row;
    justify-content: space-between;
    gap: 4rem;
  }
}

.footer-brand {
  max-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  width: fit-content;
}

.footer-logo-badge {
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 9px;
  background-color: #d9f24a;
  color: #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff8ee;
}

.brand-desc {
  line-height: 1.6;
  color: #c6bfd1;
  font-size: 0.92rem;
}

.privacy-notice {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  width: fit-content;
  border-radius: 999px;
  background-color: rgba(168, 230, 195, 0.12);
  border: 1px solid rgba(168, 230, 195, 0.3);
  font-size: 0.8rem;
  color: #a8e6c3;
  font-weight: 600;
}

.footer-links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2.25rem;
}

@media (min-width: 640px) {
  .footer-links-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }
}

.col-title {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 700;
  color: #d9f24a;
  letter-spacing: -0.01em;
  margin-bottom: 0.9rem;
}

.col-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.col-list a {
  color: #fff8ee;
  opacity: 0.85;
  font-size: 0.9rem;
  transition: opacity var(--transition-fast), color var(--transition-fast);
}

.col-list a:hover {
  opacity: 1;
  color: #d9f24a;
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  padding-top: 2rem;
  font-size: 0.85rem;
  color: #9e96aa;
}

@media (min-width: 640px) {
  .footer-bottom {
    flex-direction: row;
  }
}

.made-with {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.heart-icon {
  color: #ff5a36;
}
</style>
