<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Link2,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Code2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Maximize2,
  Printer,
  Download,
  Lock,
  Layers,
  Zap,
  HelpCircle,
  Eye,
  ChevronDown
} from 'lucide-vue-next'

// Configuration SEO exhaustive & Optimisation mots-clés
useSeoMeta({
  title: 'Générateur de QR Code Gratuit & 100% Local — SVG & Haute Définition | QR Studio',
  description: 'Créez, personnalisez et exportez des QR codes vectoriels SVG et PNG Ultra HD gratuitement. 100% confidentiel, zéro redirection, sans inscription et sans expiration.',
  keywords: 'générateur qr code gratuit, créer qr code sans compte, qr code svg haute résolution, qr code wifi, qr code vcard, qr code sans expiration, qr code confidentiel',
  ogTitle: 'Générateur de QR Code Gratuit, 100 % Local & Sans Expiration — QR Studio',
  ogDescription: 'Générez des QR codes professionnels haute définition en toute confidentialité. Vos données ne quittent jamais votre navigateur.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'QR Studio — Générateur de QR Code Professionnel & 100% Local',
  twitterDescription: 'Des QR codes statiques purs, sans redirection tierce, sans abonnement caché et valides à vie.'
})

// Données structurées JSON-LD (SoftwareApplication + FAQPage)
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'SoftwareApplication',
            'name': 'QR Studio',
            'applicationCategory': 'DesignApplication',
            'operatingSystem': 'Web Browser',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'EUR'
            },
            'description': 'Application web locale de création et personnalisation de QR codes statiques haute définition sans inscription ni expiration.'
          },
          {
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'Les QR codes créés sur QR Studio peuvent-ils expirer ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Non. QR Studio génère exclusivement des QR codes statiques purs. Les données sont directement gravées dans la matrice du QR code sans passer par une URL de redirection intermédiaire. Vos QR codes fonctionneront donc indéfiniment sans risque de lien brisé.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Mes informations personnelles ou mots de passe sont-ils envoyés sur un serveur ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Non. L’ensemble des opérations s’exécute à 100 % dans le moteur JavaScript de votre propre navigateur via l’API Canvas et SVG. Aucune coordonnée vCard, clé Wi-Fi ou adresse URL n’est transmise sur un réseau.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Quels sont les formats d’exportation disponibles pour l’imprimerie ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Vous pouvez exporter au format vectoriel SVG (infiniment redimensionnable sans perte de netteté) ainsi qu’en PNG haute résolution jusqu’à 4096×4096 px à 300 DPI, en WebP ou en JPEG avec fond opaque.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Puis-je utiliser ces QR codes pour un usage commercial ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Oui, absolument. Tous les QR codes générés sont 100 % libres de droits et utilisables sans restriction pour vos emballages, cartes de visite, affiches publicitaires, vitrines ou menus de restaurant.'
                }
              }
            ]
          }
        ]
      })
    }
  ]
})

// Démo interactive en direct sur la landing
const demoInput = ref('https://monsite.fr')
const demoType = ref<'URL' | 'WIFI' | 'VCARD'>('URL')
const activeFaq = ref<number | null>(null)

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

// 10 Formats détaillés pour le SEO
const contentTypes = [
  {
    type: 'URL',
    title: 'Lien Web & URL',
    desc: 'Ouvrez directement n’importe quel site web, boutique en ligne ou page sociale.',
    icon: Link2,
    badge: 'Standard'
  },
  {
    type: 'WIFI',
    title: 'Connexion Wi-Fi',
    desc: 'Permettez à vos invités ou clients de se connecter au réseau sans saisir le mot de passe.',
    icon: Wifi,
    badge: 'Sans contact'
  },
  {
    type: 'VCARD',
    title: 'Carte de visite vCard',
    desc: 'Enregistrez vos coordonnées complètes (nom, poste, téléphone, e-mail) dans le smartphone.',
    icon: Contact,
    badge: 'Professionnel'
  },
  {
    type: 'EMAIL',
    title: 'Courriel pré-rempli',
    desc: 'Générez un e-mail avec adresse destinataire, objet et corps de texte prêts à l’envoi.',
    icon: Mail,
    badge: 'Messagerie'
  },
  {
    type: 'SMS',
    title: 'SMS direct',
    desc: 'Préparez un message texte prêt à être expédié vers un numéro mobile prédéfini.',
    icon: MessageSquare,
    badge: 'Mobile'
  },
  {
    type: 'PHONE',
    title: 'Numéro de téléphone',
    desc: 'Lancez un appel téléphonique immédiat en un seul scan, sans risque d’erreur de frappe.',
    icon: Phone,
    badge: 'Appel'
  },
  {
    type: 'GEO',
    title: 'Localisation GPS',
    desc: 'Indiquez un point géographique exact sur Google Maps ou Apple Maps pour vos locaux.',
    icon: MapPin,
    badge: 'Cartographie'
  },
  {
    type: 'EVENT',
    title: 'Invitation Calendrier',
    desc: 'Ajoutez une réunion, une conférence ou un événement dans l’agenda de vos participants.',
    icon: Calendar,
    badge: 'Agenda'
  },
  {
    type: 'TEXT',
    title: 'Texte libre & Notes',
    desc: 'Encodez jusqu’à 2 000 caractères de texte brut lisible hors connexion sans réseau.',
    icon: FileText,
    badge: 'Hors-ligne'
  },
  {
    type: 'CUSTOM',
    title: 'Données brutes (Payload)',
    desc: 'Intégrez des adresses cryptomonnaies, JSON ou syntaxes spécifiques industrielles.',
    icon: Code2,
    badge: 'Technique'
  }
]

// Questions fréquentes (FAQ)
const faqs = [
  {
    q: 'Quelle est la différence entre un QR code statique et un QR code dynamique ?',
    a: 'Un QR code statique contient directement la donnée finale (ex: l’URL réelle ou les identifiants Wi-Fi). Il ne dépend d’aucun serveur externe et fonctionne indéfiniment. Un QR code dynamique passe par un serveur de redirection qui peut tomber en panne, exiger un abonnement mensuel ou fermer boutique. QR Studio ne génère que des QR codes statiques, robustes et pérennes.'
  },
  {
    q: 'Comment s’assurer que le QR code s’imprime avec une lisibilité maximale ?',
    a: 'Pour une numérisation optimale, veillez à maintenir un contraste élevé entre le premier plan et l’arrière-plan (ratio minimal de 4:1 calculé en direct dans notre éditeur). Privilégiez l’export au format vectoriel SVG pour les imprimeurs professionnels, ou un PNG 2048 px / 4096 px pour l’impression grand format.'
  },
  {
    q: 'Pourquoi l’application garantit-elle une confidentialité absolue ?',
    a: 'QR Studio a été architecturé selon le principe de souveraineté locale (Client-Side Architecture). Le calcul mathématique de la matrice du QR code, le dessin vectoriel SVG et la génération des fichiers binaires sont réalisés par le navigateur sur votre appareil. Aucun serveur applicatif distant n’est sollicité.'
  },
  {
    q: 'Puis-je intégrer le logo de mon entreprise au centre du QR code ?',
    a: 'Oui. Vous pouvez téléverser votre propre logo (PNG, SVG, JPEG). L’application rehausse automatiquement le niveau de correction d’erreur de Reed-Solomon à 25 % (Q) ou 30 % (H) pour garantir un scan parfait même avec une surface recouverte par le logo.'
  },
  {
    q: 'Le service est-il réellement gratuit et sans engagement ?',
    a: 'Oui, 100 % gratuit, sans inscription, sans saisie de carte bancaire et sans abonnement récurrent. Vous générez autant de QR codes que nécessaire sans aucune limite de téléchargement.'
  }
]
</script>

<template>
  <div class="landing-page">
    <!-- 1. SECTION HERO MINIMALISTE & SOIGNÉE -->
    <section class="hero-section app-container" aria-labelledby="hero-title">
      <div class="hero-badge">
        <ShieldCheck :size="14" class="badge-icon" />
        <span>100 % Local • Zéro Tracking • Fichiers Vectoriels</span>
      </div>

      <h1 id="hero-title" class="hero-title">
        Le générateur de QR code <br class="hidden-mobile">
        <span class="text-highlight">gratuit, précis & 100 % confidentiel</span>.
      </h1>

      <p class="hero-description">
        Créez et téléchargez instantanément des QR codes statiques haute résolution (SVG vectoriel, PNG jusqu’à 4096 px).
        Aucun compte requis, aucune redirection publicitaire, et vos créations n’expirent jamais.
      </p>

      <div class="hero-cta-group">
        <NuxtLink to="/create" class="btn btn-primary">
          <span>Créer un QR code maintenant</span>
          <ArrowRight :size="16" />
        </NuxtLink>
        <a href="#formats" class="btn btn-secondary">
          <span>Explorer les 10 formats</span>
        </a>
      </div>

      <!-- Aperçu visuel sobre & interactif -->
      <div class="hero-preview-frame">
        <div class="preview-card-clean">
          <div class="preview-stage-clean">
            <!-- QR code vectoriel SVG pur de démonstration -->
            <svg class="demo-qr-svg" viewBox="0 0 250 250" width="220" height="220" role="img" aria-label="Exemple de QR Code">
              <rect width="100%" height="100%" fill="#ffffff" />
              <!-- Repères de coins extérieurs sobres -->
              <rect x="20" y="20" width="56" height="56" rx="8" fill="none" stroke="#09090b" stroke-width="8" />
              <rect x="36" y="36" width="24" height="24" rx="4" fill="#09090b" />
              <rect x="174" y="20" width="56" height="56" rx="8" fill="none" stroke="#09090b" stroke-width="8" />
              <rect x="190" y="36" width="24" height="24" rx="4" fill="#09090b" />
              <rect x="20" y="174" width="56" height="56" rx="8" fill="none" stroke="#09090b" stroke-width="8" />
              <rect x="36" y="190" width="24" height="24" rx="4" fill="#09090b" />
              <!-- Modules de données décoratifs précis -->
              <circle cx="100" cy="35" r="4" fill="#09090b" />
              <circle cx="120" cy="35" r="4" fill="#09090b" />
              <circle cx="140" cy="35" r="4" fill="#09090b" />
              <circle cx="100" cy="55" r="4" fill="#09090b" />
              <circle cx="140" cy="55" r="4" fill="#09090b" />
              <circle cx="95" cy="95" r="4" fill="#09090b" />
              <circle cx="115" cy="95" r="4" fill="#09090b" />
              <circle cx="135" cy="95" r="4" fill="#09090b" />
              <circle cx="155" cy="95" r="4" fill="#09090b" />
              <circle cx="100" cy="115" r="4" fill="#09090b" />
              <circle cx="125" cy="115" r="4" fill="#09090b" />
              <circle cx="145" cy="115" r="4" fill="#09090b" />
              <circle cx="35" cy="100" r="4" fill="#09090b" />
              <circle cx="55" cy="100" r="4" fill="#09090b" />
              <circle cx="35" cy="120" r="4" fill="#09090b" />
              <circle cx="55" cy="120" r="4" fill="#09090b" />
              <circle cx="35" cy="140" r="4" fill="#09090b" />
              <circle cx="100" cy="180" r="4" fill="#09090b" />
              <circle cx="120" cy="180" r="4" fill="#09090b" />
              <circle cx="140" cy="180" r="4" fill="#09090b" />
              <circle cx="100" cy="205" r="4" fill="#09090b" />
              <circle cx="130" cy="205" r="4" fill="#09090b" />
              <circle cx="190" cy="100" r="4" fill="#09090b" />
              <circle cx="210" cy="100" r="4" fill="#09090b" />
              <circle cx="180" cy="125" r="4" fill="#09090b" />
              <circle cx="205" cy="125" r="4" fill="#09090b" />
              <circle cx="190" cy="155" r="4" fill="#09090b" />
              <circle cx="210" cy="155" r="4" fill="#09090b" />
              <circle cx="175" cy="190" r="4" fill="#09090b" />
              <circle cx="195" cy="190" r="4" fill="#09090b" />
              <circle cx="215" cy="190" r="4" fill="#09090b" />
            </svg>
          </div>
          <div class="preview-card-footer">
            <span class="preview-badge-status">
              <CheckCircle2 :size="14" class="text-success" />
              <span>Format vectoriel SVG • Lisibilité 100%</span>
            </span>
            <NuxtLink to="/create" class="preview-link-btn">
              Personnaliser ce modèle
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. SECTION AVANTAGES CLÉS (RÉASSURANCE & CONFIANCE) -->
    <section class="features-overview-section" aria-labelledby="features-heading">
      <div class="app-container">
        <div class="section-header-centered">
          <h2 id="features-heading" class="section-title">
            Conçu pour durer, pensé pour la vie privée.
          </h2>
          <p class="section-subtitle">
            Pourquoi des milliers de professionnels et de créateurs privilégient QR Studio.
          </p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon-box">
              <Lock :size="20" />
            </div>
            <h3 class="feature-title">Zéro transmission réseau</h3>
            <p class="feature-text">
              100 % des calculs s’effectuent dans votre navigateur. Vos données confidentielles (mots de passe Wi-Fi, coordonnées personnelles) ne transitent jamais sur nos serveurs.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <Zap :size="20" />
            </div>
            <h3 class="feature-title">Pérennité garantie à vie</h3>
            <p class="feature-text">
              Aucune URL de redirection tierce. Le code contient directement votre donnée. Vos affiches et emballages restent fonctionnels pour toujours sans abonnement requis.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon-box">
              <Printer :size="20" />
            </div>
            <h3 class="feature-title">Standards PAO & Imprimerie</h3>
            <p class="feature-text">
              Téléchargez des fichiers vectoriels SVG nets à l’infini ou des images PNG Ultra HD jusqu’à 4096 px à 300 DPI, avec test de contraste WCAG intégré.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. SECTION LES 10 FORMATS PRIS EN CHARGE (SEO & MAILLAGE INTERNE) -->
    <section id="formats" class="formats-section" aria-labelledby="formats-heading">
      <div class="app-container">
        <div class="section-header-centered">
          <span class="section-eyebrow">Polyvalence universelle</span>
          <h2 id="formats-heading" class="section-title">
            10 formats standardisés pour tous vos besoins.
          </h2>
          <p class="section-subtitle">
            Chaque type respecte scrupuleusement les RFCs et spécifications internationales pour une compatibilité totale avec tous les smartphones iOS et Android.
          </p>
        </div>

        <div class="types-grid">
          <NuxtLink
            v-for="item in contentTypes"
            :key="item.type"
            :to="`/create?type=${item.type}`"
            class="type-item-card"
          >
            <div class="type-item-top">
              <div class="type-icon-wrapper">
                <component :is="item.icon" :size="20" />
              </div>
              <span class="type-badge">{{ item.badge }}</span>
            </div>
            <h3 class="type-item-title">{{ item.title }}</h3>
            <p class="type-item-desc">{{ item.desc }}</p>
            <div class="type-item-action">
              <span>Créer</span>
              <ArrowRight :size="14" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 4. SECTION COMPARATIF TECHNIQUE (TRANSPARENCE TOTALE) -->
    <section id="comparatif" class="comparison-section" aria-labelledby="comp-heading">
      <div class="app-container">
        <div class="section-header-centered">
          <span class="section-eyebrow">Comparatif direct</span>
          <h2 id="comp-heading" class="section-title">
            QR Studio face aux générateurs commerciaux.
          </h2>
          <p class="section-subtitle">
            Comprenez pourquoi les QR codes dynamiques payants représentent un piège pour votre entreprise.
          </p>
        </div>

        <div class="comparison-table-wrapper">
          <table class="comparison-table">
            <thead>
              <tr>
                <th scope="col" class="th-feature">Critère</th>
                <th scope="col" class="th-studio">QR Studio</th>
                <th scope="col" class="th-others">Autres générateurs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="td-feature">Lien direct sans redirection</td>
                <td class="td-studio"><CheckCircle2 :size="16" class="text-success" /> Encodage direct et pur</td>
                <td class="td-others">Redirection via serveur tiers</td>
              </tr>
              <tr>
                <td class="td-feature">Durée de validité</td>
                <td class="td-studio"><CheckCircle2 :size="16" class="text-success" /> Valide à vie (Aucune expiration)</td>
                <td class="td-others">Désactivé après 14 jours d’essai</td>
              </tr>
              <tr>
                <td class="td-feature">Protection de la vie privée</td>
                <td class="td-studio"><CheckCircle2 :size="16" class="text-success" /> 100 % local (Zéro cookie, zéro serveur)</td>
                <td class="td-others">Adresses IP et scans profilés</td>
              </tr>
              <tr>
                <td class="td-feature">Formats d’exportation</td>
                <td class="td-studio"><CheckCircle2 :size="16" class="text-success" /> SVG vectoriel + PNG 4096 px</td>
                <td class="td-others">PNG basse résolution (SVG payant)</td>
              </tr>
              <tr>
                <td class="td-feature">Tarif d’utilisation</td>
                <td class="td-studio"><CheckCircle2 :size="16" class="text-success" /> 100 % gratuit & Open Source</td>
                <td class="td-others">Abonnement de 15 € à 40 € / mois</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- 5. SECTION NORMES D'IMPRESSION & PAO -->
    <section id="impression" class="print-guide-section" aria-labelledby="print-heading">
      <div class="app-container">
        <div class="print-box">
          <div class="print-content">
            <span class="section-eyebrow">Précision typographique</span>
            <h2 id="print-heading" class="section-title">
              Idéal pour vos supports imprimés de haute exigence.
            </h2>
            <p class="print-text">
              Les imprimeurs professionnels recommandent le format vectoriel SVG pour éviter tout flou lors de l’agrandissement.
              QR Studio intègre également un calcul automatique du contraste WCAG en temps réel pour prévenir les échecs de scan sur papier glacé, enseignes ou cartes texturées.
            </p>
            <div class="print-checklist">
              <div class="check-item">
                <CheckCircle2 :size="16" class="text-success" />
                <span>Format SVG pur compatible Illustrator, InDesign & Figma</span>
              </div>
              <div class="check-item">
                <CheckCircle2 :size="16" class="text-success" />
                <span>Export PNG jusqu’à 4096×4096 pixels à 300 DPI</span>
              </div>
              <div class="check-item">
                <CheckCircle2 :size="16" class="text-success" />
                <span>Niveau de correction d’erreur Reed-Solomon réglable (L, M, Q, H)</span>
              </div>
            </div>
            <div class="print-cta">
              <NuxtLink to="/create" class="btn btn-primary">
                Créer un QR code pour l'impression
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. SECTION FOIRE AUX QUESTIONS (FAQ SEO ENRICHI) -->
    <section id="faq" class="faq-section" aria-labelledby="faq-heading">
      <div class="app-container">
        <div class="section-header-centered">
          <span class="section-eyebrow">Questions fréquentes</span>
          <h2 id="faq-heading" class="section-title">
            Tout ce que vous devez savoir sur les QR codes.
          </h2>
          <p class="section-subtitle">
            Des réponses techniques claires pour réussir vos projets personnels et professionnels.
          </p>
        </div>

        <div class="faq-list">
          <div
            v-for="(item, idx) in faqs"
            :key="idx"
            class="faq-card"
            :class="{ 'faq-card--open': activeFaq === idx }"
          >
            <button
              type="button"
              class="faq-question-btn"
              :aria-expanded="activeFaq === idx"
              @click="toggleFaq(idx)"
            >
              <span class="faq-question-text">{{ item.q }}</span>
              <ChevronDown :size="18" class="faq-icon" />
            </button>
            <div v-show="activeFaq === idx" class="faq-answer">
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 7. SECTION BANNIÈRE FINALE (CALL TO ACTION) -->
    <section class="final-cta-section" aria-label="Passer à l'action">
      <div class="app-container">
        <div class="final-cta-card">
          <h2 class="final-cta-title">
            Prêt à concevoir votre QR code pérenne ?
          </h2>
          <p class="final-cta-sub">
            Gratuit, immédiat, sans création de compte et sans aucune publicité intrusive.
          </p>
          <div class="final-cta-action">
            <NuxtLink to="/create" class="btn btn-primary btn-large">
              <span>Lancer le studio de création</span>
              <ArrowRight :size="18" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  gap: 5rem;
  padding-bottom: 5rem;
}

/* 1. HERO SECTION */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 4.5rem;
  padding-bottom: 2rem;
  max-width: 960px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background-color: var(--color-surface-hover);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  margin-bottom: 1.5rem;
}

.badge-icon {
  color: var(--color-success);
}

.hero-title {
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.15;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.75rem;
  }
}

.text-highlight {
  color: var(--color-text);
  background: linear-gradient(180deg, var(--color-text) 0%, var(--color-text-muted) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: 1.15rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 720px;
  margin-bottom: 2.5rem;
}

.hero-cta-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn-large {
  padding: 0.9rem 2rem;
  font-size: 1.05rem;
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-bg);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-text-muted);
}

/* Aperçu carte épurée */
.hero-preview-frame {
  width: 100%;
  max-width: 420px;
}

.preview-card-clean {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.preview-stage-clean {
  background-color: #ffffff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.demo-qr-svg {
  display: block;
  max-width: 100%;
  height: auto;
}

.preview-card-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border-subtle);
}

.preview-badge-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.preview-link-btn {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
}

.preview-link-btn:hover {
  text-decoration: underline;
}

/* 2. SECTION AVANTAGES CLÉS */
.features-overview-section {
  background-color: var(--color-bg-subtle);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 5rem 0;
}

.section-header-centered {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 3.5rem;
}

.section-eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--color-text);
  margin-bottom: 0.85rem;
}

@media (min-width: 768px) {
  .section-title {
    font-size: 2.5rem;
  }
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.feature-icon-box {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-md);
  background-color: var(--color-surface-hover);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.feature-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
}

.feature-text {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.55;
}

/* 3. SECTION 10 FORMATS */
.formats-section {
  padding: 2rem 0;
}

.types-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .types-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .types-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.type-item-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.type-item-card:hover {
  border-color: var(--color-text-muted);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.type-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.type-icon-wrapper {
  color: var(--color-text);
}

.type-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  background-color: var(--color-surface-hover);
  color: var(--color-text-muted);
  border-radius: var(--radius-full);
}

.type-item-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
}

.type-item-desc {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  flex-grow: 1;
}

.type-item-action {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
  margin-top: 0.5rem;
}

/* 4. SECTION COMPARATIF */
.comparison-section {
  background-color: var(--color-bg-subtle);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 5rem 0;
}

.comparison-table-wrapper {
  overflow-x: auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.95rem;
}

.comparison-table th,
.comparison-table td {
  padding: 1.15rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.comparison-table th {
  font-weight: 600;
  background-color: var(--color-surface-hover);
  color: var(--color-text);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.th-studio {
  color: var(--color-primary);
  font-weight: 700;
}

.td-feature {
  font-weight: 600;
  color: var(--color-text);
}

.td-studio {
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.td-others {
  color: var(--color-text-muted);
}

/* 5. NORMES D'IMPRESSION */
.print-box {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.print-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.print-text {
  font-size: 1.05rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.print-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0.5rem 0 1rem;
}

.check-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text);
}

.text-success {
  color: var(--color-success);
}

/* 6. FAQ SECTION */
.faq-section {
  padding: 2rem 0;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.faq-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.faq-card--open {
  border-color: var(--color-text-muted);
}

.faq-question-btn {
  width: 100%;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
  font-size: 1.02rem;
  font-weight: 600;
  color: var(--color-text);
}

.faq-icon {
  color: var(--color-text-muted);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}

.faq-card--open .faq-icon {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 1.5rem 1.25rem;
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* 7. BANNIÈRE FINALE */
.final-cta-section {
  padding: 1rem 0;
}

.final-cta-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 4rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.final-cta-title {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

.final-cta-sub {
  font-size: 1.1rem;
  color: var(--color-text-muted);
  max-width: 580px;
}

@media (max-width: 640px) {
  .hidden-mobile {
    display: none;
  }
}
</style>
