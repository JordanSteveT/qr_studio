<script setup lang="ts">
import { QrCode, Shield, Heart } from 'lucide-vue-next'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner app-container">
      <div class="footer-top">
        <div class="footer-brand">
          <div class="footer-logo">
            <QrCode :size="20" class="brand-icon" />
            <span class="brand-name">QR Studio</span>
          </div>
          <p class="brand-desc">
            Le générateur de QR codes gratuit, sans compte et 100 % local.
            Conçu pour préserver votre vie privée et la pérennité de vos créations.
          </p>
          <div class="privacy-notice">
            <Shield :size="16" class="notice-icon" />
            <span>Aucune donnée saisie ne quitte votre navigateur.</span>
          </div>
        </div>

        <div class="footer-links-grid">
          <div class="footer-col">
            <h4 class="col-title">Application</h4>
            <ul class="col-list">
              <li><NuxtLink to="/create">Créateur de QR code</NuxtLink></li>
              <li><NuxtLink to="/projects">Mes projets sauvegardés</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Types de QR Codes</h4>
            <ul class="col-list">
              <li><NuxtLink to="/create?type=URL">Lien Web & URL</NuxtLink></li>
              <li><NuxtLink to="/create?type=WIFI">Connexion Wi-Fi sans contact</NuxtLink></li>
              <li><NuxtLink to="/create?type=VCARD">Carte de visite vCard</NuxtLink></li>
              <li><NuxtLink to="/create?type=EMAIL">E-mail pré-rempli</NuxtLink></li>
              <li><NuxtLink to="/create?type=EVENT">Invitation Calendrier</NuxtLink></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Ressources & Guides</h4>
            <ul class="col-list">
              <li><NuxtLink to="/#formats">Tous les formats pris en charge</NuxtLink></li>
              <li><NuxtLink to="/#comparatif">Pourquoi le 100 % local ?</NuxtLink></li>
              <li><NuxtLink to="/#faq">Foire aux questions</NuxtLink></li>
              <li><NuxtLink to="/#impression">Normes d'impression & PAO</NuxtLink></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p class="copyright">
          &copy; {{ currentYear }} QR Studio. Tous droits réservés. Logiciel libre sous licence MIT.
        </p>
        <p class="made-with">
          Fait avec <Heart :size="14" class="heart-icon" /> pour un web libre et privé.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: auto;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 3rem 0 2rem;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.footer-top {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid var(--color-border);
}

@media (min-width: 860px) {
  .footer-top {
    flex-direction: row;
    justify-content: space-between;
  }
}

.footer-brand {
  max-width: 380px;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
}

.brand-desc {
  line-height: 1.6;
}

.privacy-notice {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--color-success);
  font-weight: 600;
}

.footer-links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

@media (min-width: 640px) {
  .footer-links-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.col-title {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

.col-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.col-list a {
  color: var(--color-text-muted);
  transition: color var(--transition-fast);
}

.col-list a:hover {
  color: var(--color-primary);
}

.text-disabled {
  opacity: 0.6;
}

.footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 1.5rem;
  font-size: 0.85rem;
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
  color: var(--color-danger);
}
</style>
