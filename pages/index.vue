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
  Printer,
  Lock,
  Zap,
  Plus,
  Sparkles,
  Star,
  Utensils,
  Store,
  Briefcase,
  Building2,
  Ticket,
  Wrench,
  Layers,
  ScanLine
} from 'lucide-vue-next'

// SEO complet
useSeoMeta({
  title: 'QR Studio — Générateur de QR Code Gratuit, Vectoriel & 100% Confidentiel',
  description: 'Créez des QR codes professionnels sur mesure en SVG vectoriel et PNG 4K directement dans votre navigateur. Sans compte, sans expiration, sans aucune donnée envoyée sur un serveur.',
  keywords: 'générateur qr code gratuit, créer qr code sans compte, qr code svg haute résolution, qr code wifi, qr code vcard, qr code sans expiration, qr code confidentiel, qr code vectoriel',
  ogTitle: 'QR Studio — Générateur de QR Code 100% Local, Gratuit & Vectoriel',
  ogDescription: 'Des QR codes vectoriels haute définition créés directement dans votre navigateur. Vos données ne quittent jamais votre appareil.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'QR Studio — QR Codes Pro, Gratuits & Privés',
  twitterDescription: 'QR codes statiques purs : sans redirection, sans abonnement, valides à vie.'
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
                  'text': 'Non. QR Studio génère exclusivement des QR codes statiques purs. Les données sont directement encodées dans la matrice du QR code sans URL de redirection intermédiaire. Ils fonctionnent indéfiniment sans risque de coupure.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Mes informations personnelles ou mots de passe sont-ils envoyés sur un serveur ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Jamais. Toutes les opérations s’exécutent à 100 % dans votre navigateur via les API Canvas et SVG. Aucune clé Wi-Fi, coordonnée vCard ou URL ne transite sur un réseau.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Quels formats d’exportation sont disponibles pour l’imprimerie ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Vous pouvez exporter au format vectoriel SVG (redimensionnable à l’infini sans perte de netteté), en PNG jusqu’à 4096×4096 px (300 DPI), en WebP ou en JPEG avec fond opaque.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Puis-je utiliser ces QR codes pour un usage commercial ?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Oui, sans aucune restriction. Tous les QR codes générés sont libres de droits et prêts pour vos menus, packagings, cartes de visite, affiches et vitrines.'
                }
              }
            ]
          }
        ]
      })
    }
  ]
})

// Sélecteur de style interactif dans le téléphone Hero
interface HeroPreset {
  id: string
  label: string
  fg: string
  accent: string
  cta: string
}

const heroPresets: HeroPreset[] = [
  { id: 'ink', label: 'Encre & Lime', fg: '#1a1523', accent: '#d9f24a', cta: 'SCANNEZ-MOI' },
  { id: 'coral', label: 'Corail Studio', fg: '#1a1523', accent: '#ff5a36', cta: 'VOIR LE MENU' },
  { id: 'sky', label: 'Ciel Épuré', fg: '#1e3a5f', accent: '#9cd2ff', cta: 'WI-FI INVITÉS' },
  { id: 'pink', label: 'Pop Pastel', fg: '#1a1523', accent: '#ffb3d9', cta: 'MON CONTACT' }
]
const activeHeroPreset = ref<HeroPreset>(heroPresets[0]!)

// Marquee d'usages réels (doublé pour boucle fluide)
const marqueeBadges = [
  { label: 'Menus de restaurant', color: '#ffd84d' },
  { label: 'Wi-Fi invités sans saisie', color: '#9cd2ff' },
  { label: 'Cartes de visite vCard', color: '#ffb3d9' },
  { label: 'Affiches & vitrines', color: '#a8e6c3' },
  { label: 'Billets d’événements', color: '#c9b6ff' },
  { label: 'Emballages & étiquettes', color: '#d9f24a' },
  { label: 'Avis clients & liens', color: '#ffd84d' },
  { label: 'Coordonnées GPS', color: '#9cd2ff' }
]

// Sélecteur de cas d'usage métier (inspiré du Business Picker QRStudio)
interface UseCaseItem {
  id: string
  label: string
  icon: unknown
  qrType: string
  badgeColor: string
  title: string
  desc: string
  samplePayload: string
  frameText: string
  qrColor: string
  highlights: string[]
}

const useCases: UseCaseItem[] = [
  {
    id: 'restaurants',
    label: 'Restaurants & Cafés',
    icon: Utensils,
    qrType: 'URL',
    badgeColor: '#ffd84d',
    title: 'Carte interactive & Wi-Fi de table',
    desc: 'Affichez votre menu du jour ou connectez vos clients au Wi-Fi en un scan, sans application ni réimpression coûteuse.',
    samplePayload: 'https://bistrot-du-marche.fr/carte',
    frameText: 'NOTRE CARTE',
    qrColor: '#1a1523',
    highlights: ['Export SVG net sur chevalets de table', 'Logo du restaurant centré et protégé', 'Aucune expiration entre deux saisons']
  },
  {
    id: 'freelance',
    label: 'Indépendants & vCard',
    icon: Briefcase,
    qrType: 'VCARD',
    badgeColor: '#ffb3d9',
    title: 'Carte de visite enregistrée en 1 seconde',
    desc: 'Vos prospects ajoutent nom, téléphone, e-mail, entreprise et site web directement dans leur carnet d’adresses.',
    samplePayload: 'BEGIN:VCARD — Camille Laurent, Architecte',
    frameText: 'MON CONTACT',
    qrColor: '#332c3f',
    highlights: ['Compatible carnet iOS & Android natif', 'Coordonnées 100 % privées sans cloud', 'Prêt pour cartes papier 300 DPI']
  },
  {
    id: 'wifi',
    label: 'Bureaux & Hôtels',
    icon: Building2,
    qrType: 'WIFI',
    badgeColor: '#9cd2ff',
    title: 'Accès Wi-Fi sécurisé sans épeler la clé',
    desc: 'Vos visiteurs rejoignent le réseau WPA/WPA2 automatiquement. Votre mot de passe ne transite jamais par un serveur tiers.',
    samplePayload: 'WIFI:S:Studio_Invites;T:WPA;P:••••••;;',
    frameText: 'WIFI GRATUIT',
    qrColor: '#1e3a5f',
    highlights: ['Compatible WPA, WPA2, WPA3 et WEP', 'Génération hors-ligne garantie', 'Zéro fuite de mot de passe']
  },
  {
    id: 'retail',
    label: 'Commerces & Vitrines',
    icon: Store,
    qrType: 'URL',
    badgeColor: '#a8e6c3',
    title: 'Boutique, horaires & avis Google',
    desc: 'Transformez vos vitrines, sacs et tickets de caisse en points d’entrée vers votre boutique en ligne ou votre page d’avis.',
    samplePayload: 'https://atelier-nord.fr/nouveautes',
    frameText: 'DÉCOUVRIR',
    qrColor: '#065f46',
    highlights: ['Contraste WCAG vérifié en direct', 'Cadres d’appel personnalisables', 'Haute définition jusqu’à 4096 px']
  },
  {
    id: 'events',
    label: 'Événements & Ateliers',
    icon: Ticket,
    qrType: 'EVENT',
    badgeColor: '#c9b6ff',
    title: 'Ajout direct au calendrier des invités',
    desc: 'Encodez lieu, horaires et description au format iCalendar pour que vos participants bloquent la date en un geste.',
    samplePayload: 'BEGIN:VEVENT — Salon Créateurs 2026',
    frameText: 'AJOUTER AGENDA',
    qrColor: '#3b2063',
    highlights: ['Support journée entière ou créneau horaire', 'Fonctionne hors connexion', 'Format standard iCalendar 2.0']
  },
  {
    id: 'trades',
    label: 'Artisans & Services',
    icon: Wrench,
    qrType: 'PHONE',
    badgeColor: '#d9f24a',
    title: 'Appel direct ou SMS pré-rempli',
    desc: 'Sur un véhicule utilitaire, une facture ou un devis, permettez à vos clients de vous appeler sans erreur de numéro.',
    samplePayload: 'tel:+33612345678',
    frameText: 'APPELER',
    qrColor: '#1a1523',
    highlights: ['Déclenche le composeur en un scan', 'Lisible même à distance', 'Idéal pour véhicules et enseignes']
  }
]

const activeUseCaseId = ref<string>('restaurants')
const activeUseCase = computed(() => useCases.find(u => u.id === activeUseCaseId.value) ?? useCases[0]!)

// 3 étapes
const steps = [
  {
    num: '01',
    title: 'Choisissez votre format',
    desc: 'URL, Wi-Fi, vCard, e-mail, événement, GPS ou texte brut : sélectionnez l’un des 10 standards conformes aux RFC.',
    badgeColor: '#d9f24a',
    tilt: '-1.5deg'
  },
  {
    num: '02',
    title: 'Habillez-le à votre image',
    desc: 'Ajustez la forme des modules, les dégradés, votre logo centré avec redondance automatique et un cadre d’appel sur mesure.',
    badgeColor: '#9cd2ff',
    tilt: '1.2deg'
  },
  {
    num: '03',
    title: 'Exportez sans aucune limite',
    desc: 'Téléchargez votre SVG vectoriel ou votre PNG Ultra HD 4096 px en un clic, ou sauvegardez le projet en local dans votre navigateur.',
    badgeColor: '#ffb3d9',
    tilt: '-1deg'
  }
]

// 10 Formats détaillés
const contentTypes = [
  {
    type: 'URL',
    title: 'Lien Web & URL',
    desc: 'Ouvrez directement un site web, une boutique en ligne, un menu PDF ou une page sociale.',
    icon: Link2,
    badge: 'Standard',
    color: '#d9f24a'
  },
  {
    type: 'WIFI',
    title: 'Connexion Wi-Fi',
    desc: 'Connectez vos invités ou clients au réseau sans jamais dicter ou saisir de mot de passe.',
    icon: Wifi,
    badge: 'Sans contact',
    color: '#9cd2ff'
  },
  {
    type: 'VCARD',
    title: 'Carte de visite vCard',
    desc: 'Enregistrez nom, fonction, téléphone, e-mail et adresse en un scan dans le smartphone.',
    icon: Contact,
    badge: 'Professionnel',
    color: '#ffb3d9'
  },
  {
    type: 'EMAIL',
    title: 'E-mail pré-rempli',
    desc: 'Préparez un courriel complet avec destinataire, objet et message déjà rédigés.',
    icon: Mail,
    badge: 'Messagerie',
    color: '#ffd84d'
  },
  {
    type: 'SMS',
    title: 'SMS direct',
    desc: 'Préparez un SMS prêt à partir vers votre numéro, idéal pour réservations ou SAV.',
    icon: MessageSquare,
    badge: 'Mobile',
    color: '#a8e6c3'
  },
  {
    type: 'PHONE',
    title: 'Numéro de téléphone',
    desc: 'Déclenchez un appel téléphonique immédiat en un scan, sans erreur de numérotation.',
    icon: Phone,
    badge: 'Appel direct',
    color: '#c9b6ff'
  },
  {
    type: 'GEO',
    title: 'Localisation GPS',
    desc: 'Ouvrez vos coordonnées exactes dans Google Maps ou Apple Plans pour guider vos visiteurs.',
    icon: MapPin,
    badge: 'Cartographie',
    color: '#9cd2ff'
  },
  {
    type: 'EVENT',
    title: 'Invitation Calendrier',
    desc: 'Ajoutez une réunion, un salon ou une conférence dans l’agenda iOS/Android du participant.',
    icon: Calendar,
    badge: 'Agenda',
    color: '#ffb3d9'
  },
  {
    type: 'TEXT',
    title: 'Texte libre & Notes',
    desc: 'Encodez un message, une citation ou une consigne lisible intégralement hors connexion.',
    icon: FileText,
    badge: 'Hors-ligne',
    color: '#ffd84d'
  },
  {
    type: 'CUSTOM',
    title: 'Données brutes (Payload)',
    desc: 'Intégrez librement des adresses crypto, chaînes JSON ou syntaxes techniques sur mesure.',
    icon: Code2,
    badge: 'Technique',
    color: '#a8e6c3'
  }
]

// Témoignages concrets
const testimonials = [
  {
    quote: 'On a remplacé tous nos menus plastifiés par des chevalets gravés avec le SVG de QR Studio. Zéro abonnement, et ils marcheront encore dans dix ans.',
    author: 'Camille D.',
    role: 'Gérante de bistrot, Lyon',
    tagColor: '#ffd84d'
  },
  {
    quote: 'Enfin un outil qui ne bloque pas mon code Wi-Fi au bout de 14 jours ou qui n’envoie pas nos identifiants internes sur un serveur inconnu.',
    author: 'Thomas B.',
    role: 'Responsable IT, Nantes',
    tagColor: '#9cd2ff'
  },
  {
    quote: 'L’export SVG pur s’importe directement dans Illustrator et InDesign, et le vérificateur de contraste m’évite les surprises à l’impression.',
    author: 'Sarah M.',
    role: 'Graphiste print & packaging',
    tagColor: '#ffb3d9'
  },
  {
    quote: 'Je prépare mes cartes de visite vCard et mes QR d’atelier en deux minutes, tout reste sauvegardé dans mon navigateur pour les retoucher plus tard.',
    author: 'Marc-Antoine L.',
    role: 'Artisan menuisier',
    tagColor: '#a8e6c3'
  }
]

// FAQ
const activeFaq = ref<number | null>(0)
const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  {
    q: 'Quelle est la différence entre un QR code statique et un QR code dynamique ?',
    a: 'Un QR code statique contient directement votre donnée finale (URL réelle, identifiants Wi-Fi, fiche vCard). Il ne dépend d’aucun serveur intermédiaire et fonctionne indéfiniment. À l’inverse, un QR code dynamique passe par un lien de redirection payant qui cesse de fonctionner dès que l’abonnement s’arrête. QR Studio génère exclusivement des QR codes statiques, durables et autonomes.'
  },
  {
    q: 'Comment garantir un scan rapide et fiable sur papier imprimé ?',
    a: 'Conservez un contraste élevé entre les modules et l’arrière-plan (au moins 4:1 selon le calculateur WCAG intégré en temps réel), gardez une marge blanche extérieure d’au moins 10 px, et privilégiez le format vectoriel SVG pour l’impression professionnelle ou le PNG 2048–4096 px.'
  },
  {
    q: 'Pourquoi mes données restent-elles à 100 % confidentielles ?',
    a: 'QR Studio fonctionne sans aucun serveur applicatif : le calcul de la matrice, l’incrustation du logo et la génération des fichiers binaires sont exécutés localement par votre navigateur. Même vos projets enregistrés restent uniquement dans l’IndexedDB de votre appareil.'
  },
  {
    q: 'Puis-je ajouter mon logo au centre sans nuire à la lecture ?',
    a: 'Oui. Importez votre logo (PNG, SVG, JPEG ou WebP). Dès qu’un logo est détecté, QR Studio rehausse automatiquement la correction d’erreur Reed-Solomon au niveau Q (25 %) ou H (30 %) pour assurer un scan fiable même avec le centre recouvert.'
  },
  {
    q: 'Est-ce vraiment gratuit, sans filigrane et utilisable commercialement ?',
    a: 'Oui, à 100 %. Pas de compte requis, pas de carte bancaire, pas de limite de créations ni de filigrane ajouté sur vos exports. Vous pouvez utiliser tous vos QR codes librement pour vos supports commerciaux et imprimés.'
  }
]
</script>

<template>
  <div class="landing-page">

    <!-- ══════════════════════════════════════════════════
         1. HERO — Fond Lime signature (#d9f24a)
         ══════════════════════════════════════════════════ -->
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="app-container hero-container">
        <div class="hero-top">
          <!-- Sticker Corail incliné -->
          <div class="hero-sticker">
            <Sparkles :size="14" aria-hidden="true" />
            <span>100 % Gratuit • Sans inscription • Valide à vie</span>
          </div>

          <h1 id="hero-title" class="hero-title">
            Des QR codes parfaits.<br>
            En toute liberté.
          </h1>

          <p class="hero-subtitle">
            Créez, personnalisez et exportez des QR codes vectoriels SVG et PNG 4K directement dans votre navigateur. Zéro compte, zéro redirection publicitaire — vos données restent strictement privées.
          </p>

          <div class="hero-cta-row">
            <NuxtLink to="/create" class="qr-btn qr-btn--ink qr-btn--lg">
              <span>Créer un QR code</span>
              <ArrowRight :size="18" aria-hidden="true" />
            </NuxtLink>
            <a href="#formats" class="qr-btn qr-btn--outline qr-btn--lg">
              <span>Explorer les 10 formats</span>
            </a>
          </div>

          <div class="hero-trust-line">
            <span class="trust-pill">
              <CheckCircle2 :size="15" aria-hidden="true" />
              0 octet envoyé en ligne
            </span>
            <span class="trust-pill">
              <CheckCircle2 :size="15" aria-hidden="true" />
              SVG vectoriel & PNG 4096 px
            </span>
            <span class="trust-pill">
              <CheckCircle2 :size="15" aria-hidden="true" />
              10 formats standards RFC
            </span>
          </div>
        </div>

        <!-- Maquette Phone / Studio Interactive (style QRStudio Framer) -->
        <div class="hero-stage">
          <!-- Stickers flottants décoratifs gauche/droite -->
          <div class="floating-sticker floating-sticker--left" aria-hidden="true">
            <span class="sticker-tag sticker-tag--yellow">
              <Layers :size="15" />
              SVG Vectoriel & 4K
            </span>
            <span class="sticker-tag sticker-tag--sky">
              <Lock :size="15" />
              100 % Client-Side
            </span>
          </div>

          <!-- Cadre Téléphone Noir Encre (#1a1523) -->
          <div class="phone-mockup">
            <div class="phone-notch" aria-hidden="true" />
            <div class="phone-screen">
              <div class="phone-topbar">
                <span class="phone-brand">QR Studio</span>
                <span class="phone-status-chip">
                  <span class="live-dot" aria-hidden="true" />
                  Prêt à scanner
                </span>
              </div>

              <!-- Aperçu QR dynamique stylisé -->
              <div class="phone-qr-frame" :style="{ borderColor: activeHeroPreset.fg }">
                <svg
                  class="hero-demo-svg"
                  viewBox="0 0 220 220"
                  width="196"
                  height="196"
                  role="img"
                  aria-label="Aperçu interactif de QR Code personnalisé"
                >
                  <rect width="220" height="220" rx="14" fill="#ffffff" />
                  <!-- 3 repères de coin -->
                  <rect x="18" y="18" width="52" height="52" rx="12" fill="none" :stroke="activeHeroPreset.fg" stroke-width="7" />
                  <rect x="32" y="32" width="24" height="24" rx="6" :fill="activeHeroPreset.fg" />

                  <rect x="150" y="18" width="52" height="52" rx="12" fill="none" :stroke="activeHeroPreset.fg" stroke-width="7" />
                  <rect x="164" y="32" width="24" height="24" rx="6" :fill="activeHeroPreset.fg" />

                  <rect x="18" y="150" width="52" height="52" rx="12" fill="none" :stroke="activeHeroPreset.fg" stroke-width="7" />
                  <rect x="32" y="164" width="24" height="24" rx="6" :fill="activeHeroPreset.fg" />

                  <!-- Modules de données -->
                  <circle cx="88" cy="28" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="104" cy="28" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="120" cy="28" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="136" cy="28" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="88" cy="44" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="120" cy="44" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="136" cy="44" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="88" cy="60" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="104" cy="60" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="136" cy="60" r="5" :fill="activeHeroPreset.fg" />

                  <circle cx="28" cy="88" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="44" cy="88" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="60" cy="88" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="28" cy="104" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="60" cy="104" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="28" cy="120" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="44" cy="120" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="60" cy="120" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="28" cy="136" r="5" :fill="activeHeroPreset.fg" />

                  <!-- Zone centrale décorative avec pastille studio -->
                  <rect x="86" y="86" width="48" height="48" rx="12" :fill="activeHeroPreset.accent" :stroke="activeHeroPreset.fg" stroke-width="3" />
                  <path d="M102 104h16v12h-16z" fill="none" :stroke="activeHeroPreset.fg" stroke-width="2.5" rx="2" />
                  <circle cx="110" cy="110" r="3" :fill="activeHeroPreset.fg" />

                  <circle cx="152" cy="88" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="168" cy="88" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="184" cy="88" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="200" cy="88" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="152" cy="104" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="184" cy="104" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="168" cy="120" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="200" cy="120" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="152" cy="136" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="184" cy="136" r="5" :fill="activeHeroPreset.fg" />

                  <circle cx="88" cy="156" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="104" cy="156" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="120" cy="156" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="136" cy="156" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="88" cy="172" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="120" cy="172" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="104" cy="188" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="136" cy="188" r="5" :fill="activeHeroPreset.accent" />

                  <circle cx="156" cy="160" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="176" cy="160" r="5" :fill="activeHeroPreset.accent" />
                  <circle cx="196" cy="160" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="156" cy="184" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="176" cy="184" r="5" :fill="activeHeroPreset.fg" />
                  <circle cx="196" cy="184" r="5" :fill="activeHeroPreset.accent" />
                </svg>

                <div class="phone-qr-banner" :style="{ backgroundColor: activeHeroPreset.fg, color: activeHeroPreset.accent }">
                  {{ activeHeroPreset.cta }}
                </div>
              </div>

              <!-- Sélecteur de style interactif dans la démo -->
              <div class="phone-preset-switcher" role="group" aria-label="Tester un thème visuel">
                <button
                  v-for="preset in heroPresets"
                  :key="preset.id"
                  type="button"
                  class="preset-dot-btn"
                  :class="{ 'preset-dot-btn--active': activeHeroPreset.id === preset.id }"
                  :title="preset.label"
                  :aria-label="`Aperçu ${preset.label}`"
                  @click="activeHeroPreset = preset"
                >
                  <span class="preset-swatch" :style="{ backgroundColor: preset.accent }" />
                </button>
              </div>

              <NuxtLink to="/create" class="phone-action-link">
                <span>Personnaliser dans l’éditeur</span>
                <ArrowRight :size="14" aria-hidden="true" />
              </NuxtLink>
            </div>
          </div>

          <div class="floating-sticker floating-sticker--right" aria-hidden="true">
            <span class="sticker-tag sticker-tag--pink">
              <ScanLine :size="15" />
              Contraste WCAG vérifié
            </span>
            <span class="sticker-tag sticker-tag--mint">
              <Zap :size="15" />
              Export instantané
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         2. PREUVE & MARQUEE — Fond Crème (#fff8ee)
         ══════════════════════════════════════════════════ -->
    <section class="marquee-section" aria-label="Cas d'utilisation populaires">
      <div class="app-container marquee-header">
        <div class="rating-pill">
          <Star :size="14" class="star-filled" aria-hidden="true" />
          <span>100 % privé • Zéro publicité • Standard ouvert</span>
        </div>
        <h2 class="marquee-heading">
          Pensé pour les pros, commerçants et créateurs exigeants.
        </h2>
      </div>

      <div class="marquee-viewport" aria-hidden="true">
        <div class="marquee-track">
          <div
            v-for="(item, idx) in [...marqueeBadges, ...marqueeBadges]"
            :key="`${item.label}-${idx}`"
            class="marquee-chip"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         3. BUSINESS / USE-CASE SWITCHER — Fond Crème (#fff8ee)
         ══════════════════════════════════════════════════ -->
    <section id="usages" class="usecase-section" aria-labelledby="usages-heading">
      <div class="app-container">
        <div class="section-header-center">
          <span class="eyebrow-pill eyebrow-pill--lime">Sur mesure pour votre activité</span>
          <h2 id="usages-heading" class="section-title-display">
            Quel est votre besoin ?
          </h2>
          <p class="section-subtitle-lg">
            Sélectionnez un secteur pour voir comment QR Studio s’adapte à votre usage quotidien.
          </p>
        </div>

        <div class="usecase-grid">
          <!-- Onglets interactifs à gauche -->
          <div class="usecase-tabs" role="tablist" aria-label="Secteurs d'activité">
            <button
              v-for="uc in useCases"
              :key="uc.id"
              type="button"
              role="tab"
              :aria-selected="activeUseCaseId === uc.id"
              class="usecase-tab-btn"
              :class="{ 'usecase-tab-btn--active': activeUseCaseId === uc.id }"
              @click="activeUseCaseId = uc.id"
            >
              <span class="uc-icon-pill" :style="{ backgroundColor: uc.badgeColor }">
                <component :is="uc.icon" :size="18" aria-hidden="true" />
              </span>
              <span class="uc-tab-label">{{ uc.label }}</span>
              <span class="uc-type-tag">{{ uc.qrType }}</span>
            </button>
          </div>

          <!-- Aperçu interactif à droite -->
          <div class="usecase-preview-card" role="tabpanel">
            <div class="uc-preview-top">
              <span class="uc-preview-badge" :style="{ backgroundColor: activeUseCase.badgeColor }">
                Format {{ activeUseCase.qrType }}
              </span>
              <span class="uc-preview-frame-tag">{{ activeUseCase.frameText }}</span>
            </div>

            <h3 class="uc-preview-title">{{ activeUseCase.title }}</h3>
            <p class="uc-preview-desc">{{ activeUseCase.desc }}</p>

            <div class="uc-payload-box">
              <span class="payload-label">Contenu encodé directement :</span>
              <code class="payload-code">{{ activeUseCase.samplePayload }}</code>
            </div>

            <ul class="uc-highlights">
              <li v-for="point in activeUseCase.highlights" :key="point">
                <CheckCircle2 :size="16" class="uc-check" aria-hidden="true" />
                <span>{{ point }}</span>
              </li>
            </ul>

            <div class="uc-preview-footer">
              <NuxtLink :to="`/create?type=${activeUseCase.qrType}`" class="qr-btn qr-btn--ink qr-btn--sm">
                <span>Créer ce modèle ({{ activeUseCase.qrType }})</span>
                <ArrowRight :size="15" aria-hidden="true" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         4. 3 ÉTAPES — Fond Sage (#e4e6e1)
         ══════════════════════════════════════════════════ -->
    <section id="etapes" class="steps-section" aria-labelledby="steps-heading">
      <div class="app-container">
        <div class="section-header-center">
          <span class="eyebrow-pill eyebrow-pill--white">Simple et immédiat</span>
          <h2 id="steps-heading" class="section-title-display">
            Prêt en quelques secondes.
          </h2>
          <p class="section-subtitle-lg">
            Aucune courbe d’apprentissage ni création de compte. Passez de l’idée au fichier prêt à imprimer en trois gestes.
          </p>
        </div>

        <div class="steps-grid">
          <article
            v-for="step in steps"
            :key="step.num"
            class="step-card"
            :style="{ '--card-tilt': step.tilt }"
          >
            <div class="step-num-badge" :style="{ backgroundColor: step.badgeColor }">
              {{ step.num }}
            </div>
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-desc">{{ step.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         5. SECTION SOMBRE (#1a1523) — Confidentialité absolue
         ══════════════════════════════════════════════════ -->
    <section class="dark-privacy-section" aria-labelledby="privacy-heading">
      <div class="app-container dark-privacy-grid">
        <div class="dark-privacy-copy">
          <span class="eyebrow-pill eyebrow-pill--lime">Architecture 100 % locale</span>
          <h2 id="privacy-heading" class="dark-section-title">
            Vos données ne quittent jamais votre écran.
          </h2>
          <p class="dark-section-desc">
            Les générateurs classiques enregistrent vos liens sur leurs serveurs, traquent les personnes qui scannent vos supports et vous facturent pour débloquer vos propres codes.
            <strong>QR Studio fait tout l’inverse :</strong> le calcul mathématique de la matrice et le rendu graphique s’exécutent intégralement dans votre navigateur.
          </p>

          <ul class="dark-checklist">
            <li>
              <CheckCircle2 :size="18" class="dark-check-icon" aria-hidden="true" />
              <span>Zéro serveur applicatif, zéro base de données distante</span>
            </li>
            <li>
              <CheckCircle2 :size="18" class="dark-check-icon" aria-hidden="true" />
              <span>Mots de passe Wi-Fi et fiches contacts protégés localement</span>
            </li>
            <li>
              <CheckCircle2 :size="18" class="dark-check-icon" aria-hidden="true" />
              <span>Projets sauvegardés en toute sécurité dans votre IndexedDB</span>
            </li>
          </ul>
        </div>

        <div class="dark-privacy-visual">
          <div class="stat-sticker-coral" aria-hidden="true">
            <span class="stat-big">0 octet</span>
            <span class="stat-sub">transmis sur Internet</span>
          </div>

          <div class="privacy-terminal-card">
            <div class="terminal-bar">
              <span class="t-dot t-dot--red" />
              <span class="t-dot t-dot--yellow" />
              <span class="t-dot t-dot--green" />
              <span class="terminal-title">Exécution locale — Navigateur</span>
            </div>
            <div class="terminal-body">
              <div class="t-line">
                <span class="t-key">Moteur de rendu :</span>
                <span class="t-val t-val--lime">Canvas & SVG Natif</span>
              </div>
              <div class="t-line">
                <span class="t-key">Requêtes sortantes :</span>
                <span class="t-val t-val--mint">0 (Hors-ligne prêt)</span>
              </div>
              <div class="t-line">
                <span class="t-key">Stockage projets :</span>
                <span class="t-val t-val--sky">IndexedDB Privée</span>
              </div>
              <div class="t-line">
                <span class="t-key">Validité des QR :</span>
                <span class="t-val t-val--yellow">Illimitée (Statique pur)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         6. LES 10 FORMATS STANDARDISÉS — Fond Crème (#fff8ee)
         ══════════════════════════════════════════════════ -->
    <section id="formats" class="formats-section" aria-labelledby="formats-heading">
      <div class="app-container">
        <div class="section-header-center">
          <span class="eyebrow-pill eyebrow-pill--lime">Polyvalence universelle</span>
          <h2 id="formats-heading" class="section-title-display">
            10 formats standards.<br>Compatibles tous smartphones.
          </h2>
          <p class="section-subtitle-lg">
            Chaque type généré suit rigoureusement les normes internationales (vCard 3.0, ZXing Wi-Fi, iCalendar 2.0, RFC URI) pour une lecture instantanée sur iOS et Android.
          </p>
        </div>

        <div class="types-grid">
          <NuxtLink
            v-for="item in contentTypes"
            :key="item.type"
            :to="`/create?type=${item.type}`"
            class="type-card"
          >
            <div class="type-card-top">
              <div class="type-icon-box" :style="{ backgroundColor: item.color }">
                <component :is="item.icon" :size="20" aria-hidden="true" />
              </div>
              <span class="type-badge">{{ item.badge }}</span>
            </div>
            <h3 class="type-title">{{ item.title }}</h3>
            <p class="type-desc">{{ item.desc }}</p>
            <div class="type-action">
              <span>Créer un {{ item.type }}</span>
              <ArrowRight :size="14" aria-hidden="true" />
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         7. COMPARATIF & IMPRESSION PAO — Fond Sage (#e4e6e1)
         ══════════════════════════════════════════════════ -->
    <section id="comparatif" class="comparison-section" aria-labelledby="comp-heading">
      <div class="app-container">
        <div class="section-header-center">
          <span class="eyebrow-pill eyebrow-pill--white">Transparence totale</span>
          <h2 id="comp-heading" class="section-title-display">
            Pourquoi choisir QR Studio ?
          </h2>
          <p class="section-subtitle-lg">
            Évitez le piège des générateurs "gratuits" qui désactivent vos QR codes imprimés au bout de deux semaines.
          </p>
        </div>

        <div class="comparison-table-card">
          <table class="comparison-table" aria-label="Comparatif entre QR Studio et les générateurs commerciaux">
            <thead>
              <tr>
                <th scope="col">Critère</th>
                <th scope="col">
                  <span class="studio-th-pill">QR Studio</span>
                </th>
                <th scope="col">Autres générateurs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="td-feature">Encodage des données</td>
                <td class="td-studio">
                  <CheckCircle2 :size="16" aria-hidden="true" />
                  <span>Direct & autonome sans redirection</span>
                </td>
                <td class="td-others">Lien court passant par un serveur tiers</td>
              </tr>
              <tr>
                <td class="td-feature">Durée de validité</td>
                <td class="td-studio">
                  <CheckCircle2 :size="16" aria-hidden="true" />
                  <span>Valide à vie — aucune expiration</span>
                </td>
                <td class="td-others">Désactivé après 14 jours d’essai</td>
              </tr>
              <tr>
                <td class="td-feature">Confidentialité</td>
                <td class="td-studio">
                  <CheckCircle2 :size="16" aria-hidden="true" />
                  <span>100 % local — zéro cookie ni tracking</span>
                </td>
                <td class="td-others">Collecte des IPs et profilage des scans</td>
              </tr>
              <tr>
                <td class="td-feature">Exports haute définition</td>
                <td class="td-studio">
                  <CheckCircle2 :size="16" aria-hidden="true" />
                  <span>SVG vectoriel + PNG jusqu’à 4096 px</span>
                </td>
                <td class="td-others">PNG basse résolution (SVG payant)</td>
              </tr>
              <tr>
                <td class="td-feature">Coût réel</td>
                <td class="td-studio">
                  <CheckCircle2 :size="16" aria-hidden="true" />
                  <span>100 % gratuit — sans carte bancaire</span>
                </td>
                <td class="td-others">Abonnement de 15 € à 40 € / mois</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Encart Normes d'impression PAO -->
        <div id="impression" class="print-card">
          <div class="print-left">
            <span class="eyebrow-pill eyebrow-pill--lime">Précision PAO & Imprimerie</span>
            <h3 class="print-title">Prêt pour vos supports imprimés haute exigence.</h3>
            <p class="print-desc">
              Que vous imprimiez une petite carte de visite ou une bâche de 3 mètres, le format vectoriel SVG garantit des contours parfaitement nets. Notre calculateur de contraste WCAG vous alerte en direct si vos couleurs risquent de gêner la lecture.
            </p>
            <NuxtLink to="/create" class="qr-btn qr-btn--ink qr-btn--sm">
              <Printer :size="16" aria-hidden="true" />
              <span>Préparer un QR pour l’impression</span>
            </NuxtLink>
          </div>
          <ul class="print-features-list">
            <li>
              <CheckCircle2 :size="17" class="pf-icon" aria-hidden="true" />
              <span>SVG pur compatible Illustrator, InDesign & Figma</span>
            </li>
            <li>
              <CheckCircle2 :size="17" class="pf-icon" aria-hidden="true" />
              <span>PNG Ultra HD jusqu’à 4096 × 4096 px (300 DPI)</span>
            </li>
            <li>
              <CheckCircle2 :size="17" class="pf-icon" aria-hidden="true" />
              <span>Correction d’erreur Reed-Solomon réglable (L, M, Q, H)</span>
            </li>
            <li>
              <CheckCircle2 :size="17" class="pf-icon" aria-hidden="true" />
              <span>Marge de silence (Quiet Zone) ajustable de 0 à 30 px</span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         8. TÉMOIGNAGES — Fond Crème (#fff8ee)
         ══════════════════════════════════════════════════ -->
    <section class="testimonials-section" aria-labelledby="reviews-heading">
      <div class="app-container">
        <div class="section-header-center">
          <div class="stars-row" aria-label="Note moyenne 5 sur 5">
            <Star v-for="n in 5" :key="n" :size="18" class="star-gold" aria-hidden="true" />
          </div>
          <h2 id="reviews-heading" class="section-title-display">
            Adopté au quotidien sur le terrain.
          </h2>
        </div>

        <div class="testimonials-grid">
          <blockquote
            v-for="(item, idx) in testimonials"
            :key="idx"
            class="testimonial-card"
          >
            <p class="testimonial-quote">« {{ item.quote }} »</p>
            <footer class="testimonial-author">
              <span class="author-badge" :style="{ backgroundColor: item.tagColor }">
                {{ item.author.charAt(0) }}
              </span>
              <div>
                <div class="author-name">{{ item.author }}</div>
                <div class="author-role">{{ item.role }}</div>
              </div>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         9. FAQ — Cartes arrondies 26px + bouton Lime (+)
         ══════════════════════════════════════════════════ -->
    <section id="faq" class="faq-section" aria-labelledby="faq-heading">
      <div class="app-container">
        <div class="section-header-center">
          <span class="eyebrow-pill eyebrow-pill--lime">Questions fréquentes</span>
          <h2 id="faq-heading" class="section-title-display">
            Tout savoir avant de générer.
          </h2>
          <p class="section-subtitle-lg">
            Des réponses claires sur la durée de vie, la sécurité et la qualité d’impression.
          </p>
        </div>

        <div class="faq-list" role="list">
          <div
            v-for="(item, idx) in faqs"
            :key="idx"
            class="faq-card"
            :class="{ 'faq-card--open': activeFaq === idx }"
            role="listitem"
          >
            <button
              type="button"
              class="faq-trigger"
              :aria-expanded="activeFaq === idx"
              :aria-controls="`faq-answer-${idx}`"
              @click="toggleFaq(idx)"
            >
              <span class="faq-question">{{ item.q }}</span>
              <span class="faq-plus-circle" aria-hidden="true">
                <Plus :size="18" class="faq-plus-icon" />
              </span>
            </button>
            <div
              v-show="activeFaq === idx"
              :id="`faq-answer-${idx}`"
              class="faq-answer"
              role="region"
            >
              <p>{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══════════════════════════════════════════════════
         10. CTA FINAL — Fond Lime (#d9f24a)
         ══════════════════════════════════════════════════ -->
    <section class="final-cta-section" aria-label="Passer à l'action">
      <div class="app-container final-cta-inner">
        <h2 class="final-cta-title">
          Votre prochain QR code<br>vous attend.
        </h2>
        <p class="final-cta-sub">
          Gratuit, instantané, sans création de compte. Vos créations vous appartiennent à vie.
        </p>
        <div class="final-cta-buttons">
          <NuxtLink to="/create" class="qr-btn qr-btn--ink qr-btn--lg">
            <span>Lancer le studio de création</span>
            <ArrowRight :size="18" aria-hidden="true" />
          </NuxtLink>
          <NuxtLink to="/projects" class="qr-btn qr-btn--outline qr-btn--lg">
            <span>Voir mes projets locaux</span>
          </NuxtLink>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ══════════════════════════════════════════════════════
   TYPOGRAPHIE & EN-TÊTES DE SECTIONS
   ══════════════════════════════════════════════════════ */
.section-header-center {
  text-align: center;
  max-width: 760px;
  margin: 0 auto 3.5rem;
}

.eyebrow-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 1.1rem;
  border: 2px solid #1a1523;
  color: #1a1523;
}

.eyebrow-pill--lime {
  background-color: #d9f24a;
}

.eyebrow-pill--white {
  background-color: #ffffff;
}

.section-title-display {
  font-family: var(--font-display);
  font-size: 2.35rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.04;
  color: var(--color-text);
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .section-title-display {
    font-size: 3.35rem;
  }
}

.section-subtitle-lg {
  font-size: 1.08rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* ══════════════════════════════════════════════════════
   1. HERO — Fond Lime #d9f24a
   ══════════════════════════════════════════════════════ */
.hero-section {
  background-color: #d9f24a;
  color: #1a1523;
  padding: 4.5rem 0 5rem;
  border-bottom: 3px solid #1a1523;
  overflow: hidden;
}

.hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3.5rem;
}

.hero-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 820px;
}

/* Sticker corail incliné signature QRStudio */
.hero-sticker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background-color: #ff5a36;
  color: #ffffff;
  border: 4px solid #ffffff;
  border-radius: 999px;
  padding: 0.45rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 700;
  transform: rotate(-2.5deg);
  box-shadow: 0 8px 20px rgba(26, 21, 35, 0.16);
  margin-bottom: 1.75rem;
  transition: transform var(--transition-spring);
}

.hero-sticker:hover {
  transform: rotate(0deg) scale(1.03);
}

.hero-title {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.94;
  color: #1a1523;
  margin-bottom: 1.5rem;
}

@media (min-width: 640px) {
  .hero-title {
    font-size: 4.25rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 5.25rem;
  }
}

.hero-subtitle {
  font-size: 1.125rem;
  font-weight: 500;
  color: #1a1523;
  opacity: 0.88;
  line-height: 1.55;
  max-width: 640px;
  margin-bottom: 2.25rem;
}

.hero-cta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
  margin-bottom: 1.75rem;
}

/* Boutons Hero toujours contrastés sur fond Lime même en dark mode */
.hero-section .qr-btn--ink {
  background-color: #1a1523;
  color: #fff8ee;
  border-color: #1a1523;
}

.hero-section .qr-btn--ink:hover {
  background-color: #332c3f;
}

.hero-section .qr-btn--outline {
  background-color: rgba(255, 255, 255, 0.55);
  color: #1a1523;
  border-color: #1a1523;
}

.hero-section .qr-btn--outline:hover {
  background-color: #ffffff;
}

.hero-trust-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.85rem 1.5rem;
}

.trust-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #1a1523;
}

/* ── Scène Hero avec Maquette Phone & Stickers ── */
.hero-stage {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.floating-sticker {
  display: none;
  flex-direction: column;
  gap: 1.25rem;
}

@media (min-width: 960px) {
  .floating-sticker {
    display: flex;
  }
}

.sticker-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.15rem;
  border-radius: 999px;
  border: 4px solid #ffffff;
  color: #1a1523;
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(26, 21, 35, 0.14);
  white-space: nowrap;
  transition: transform var(--transition-spring);
}

.sticker-tag--yellow {
  background-color: #ffd84d;
  transform: rotate(-5deg);
}

.sticker-tag--sky {
  background-color: #9cd2ff;
  transform: rotate(4deg);
}

.sticker-tag--pink {
  background-color: #ffb3d9;
  transform: rotate(5deg);
}

.sticker-tag--mint {
  background-color: #a8e6c3;
  transform: rotate(-4deg);
}

.sticker-tag:hover {
  transform: rotate(0deg) translateY(-4px) scale(1.04);
}

/* Maquette Téléphone #1a1523 */
.phone-mockup {
  width: 100%;
  max-width: 340px;
  background-color: #1a1523;
  border-radius: 48px;
  padding: 14px;
  box-shadow: 0 36px 70px rgba(26, 21, 35, 0.28), inset 0 0 0 2px rgba(255, 255, 255, 0.12);
  position: relative;
}

.phone-notch {
  width: 96px;
  height: 20px;
  background-color: #1a1523;
  border-radius: 999px;
  margin: 4px auto 10px;
}

.phone-screen {
  background-color: #ffffff;
  color: #1a1523;
  border-radius: 36px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.phone-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phone-brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: #1a1523;
}

.phone-status-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background-color: #eefbf3;
  color: #15803d;
}

.live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #22c55e;
}

.phone-qr-frame {
  border: 3.5px solid #1a1523;
  border-radius: 22px;
  overflow: hidden;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: border-color var(--transition-fast);
}

.hero-demo-svg {
  display: block;
}

.phone-qr-banner {
  width: 100%;
  padding: 0.55rem 0.75rem;
  text-align: center;
  font-family: var(--font-display);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: background-color var(--transition-fast), color var(--transition-fast);
}

.phone-preset-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.preset-dot-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  padding: 3px;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.preset-dot-btn--active {
  border-color: #1a1523;
  transform: scale(1.1);
}

.preset-swatch {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid rgba(26, 21, 35, 0.2);
}

.phone-action-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.84rem;
  font-weight: 700;
  color: #1a1523;
  background-color: #fff8ee;
  border: 2px solid #1a1523;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  transition: background-color var(--transition-fast), gap var(--transition-fast);
}

.phone-action-link:hover {
  background-color: #d9f24a;
  gap: 0.6rem;
}

/* ══════════════════════════════════════════════════════
   2. MARQUEE — Fond Crème (#fff8ee)
   ══════════════════════════════════════════════════════ */
.marquee-section {
  background-color: var(--color-bg);
  padding: 4rem 0 3.5rem;
  border-bottom: 1.5px solid var(--color-border);
  overflow: hidden;
}

.marquee-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  margin-bottom: 2.25rem;
}

.rating-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  background-color: #ffd84d;
  color: #1a1523;
  border: 2.5px solid #1a1523;
  font-size: 0.84rem;
  font-weight: 700;
}

.star-filled {
  fill: #1a1523;
}

.marquee-heading {
  font-family: var(--font-display);
  font-size: 1.65rem;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .marquee-heading {
    font-size: 2rem;
  }
}

.marquee-viewport {
  width: 100%;
  overflow: hidden;
  padding: 0.5rem 0;
}

.marquee-track {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: max-content;
  animation: marquee-scroll 34s linear infinite;
}

.marquee-viewport:hover .marquee-track {
  animation-play-state: paused;
}

@keyframes marquee-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
    flex-wrap: wrap;
    justify-content: center;
    width: auto;
  }
}

.marquee-chip {
  padding: 0.65rem 1.3rem;
  border-radius: 999px;
  border: 3px solid #ffffff;
  color: #1a1523;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(26, 21, 35, 0.08);
}

/* ══════════════════════════════════════════════════════
   3. SÉLECTEUR DE CAS D'USAGE MÉTIER
   ══════════════════════════════════════════════════════ */
.usecase-section {
  background-color: var(--color-bg);
  padding: 5.5rem 0;
}

.usecase-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: stretch;
}

@media (min-width: 900px) {
  .usecase-grid {
    grid-template-columns: 1fr 1.15fr;
    gap: 2.5rem;
  }
}

.usecase-tabs {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.usecase-tab-btn {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.1rem;
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: left;
  color: var(--color-text);
  transition: all var(--transition-fast);
}

.usecase-tab-btn:hover {
  border-color: var(--color-border-hover);
  transform: translateX(3px);
}

.usecase-tab-btn--active {
  background-color: #1a1523;
  color: #fff8ee;
  border-color: #1a1523;
  box-shadow: var(--shadow-md);
}

.dark .usecase-tab-btn--active {
  background-color: #d9f24a;
  color: #1a1523;
  border-color: #d9f24a;
}

.uc-icon-pill {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 12px;
  color: #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid #1a1523;
}

.uc-tab-label {
  font-family: var(--font-display);
  font-size: 1.08rem;
  font-weight: 700;
  flex: 1;
}

.uc-type-tag {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background-color: rgba(133, 126, 141, 0.16);
  letter-spacing: 0.04em;
}

.usecase-preview-card {
  background-color: var(--color-surface);
  border: 3px solid var(--color-border-hover);
  border-radius: var(--radius-2xl);
  padding: 2.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: var(--shadow-md);
}

.uc-preview-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.uc-preview-badge {
  padding: 0.3rem 0.85rem;
  border-radius: 999px;
  color: #1a1523;
  border: 2px solid #1a1523;
  font-size: 0.8rem;
  font-weight: 700;
}

.uc-preview-frame-tag {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  background-color: var(--color-bg-alt);
  color: var(--color-text);
}

.uc-preview-title {
  font-family: var(--font-display);
  font-size: 1.75rem;
  line-height: 1.1;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.uc-preview-desc {
  font-size: 1rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.uc-payload-box {
  background-color: var(--color-bg);
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payload-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.payload-code {
  font-family: var(--font-mono);
  font-size: 0.86rem;
  color: var(--color-text);
  word-break: break-all;
}

.uc-highlights {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.25rem;
}

.uc-highlights li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.94rem;
  font-weight: 500;
  color: var(--color-text);
}

.uc-check {
  color: var(--color-success);
  flex-shrink: 0;
}

.uc-preview-footer {
  margin-top: auto;
  padding-top: 0.75rem;
}

/* ══════════════════════════════════════════════════════
   4. 3 ÉTAPES — Fond Sage (#e4e6e1)
   ══════════════════════════════════════════════════════ */
.steps-section {
  background-color: var(--color-bg-sage);
  padding: 5.5rem 0;
  border-top: 1.5px solid var(--color-border);
  border-bottom: 1.5px solid var(--color-border);
}

.steps-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.75rem;
}

@media (min-width: 810px) {
  .steps-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.step-card {
  background-color: var(--color-surface);
  border: 2.5px solid #1a1523;
  border-radius: var(--radius-2xl);
  padding: 2.25rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: var(--shadow-sm);
  transform: rotate(var(--card-tilt, 0deg));
  transition: transform var(--transition-spring), box-shadow var(--transition-fast);
}

.dark .step-card {
  border-color: var(--color-border);
}

.step-card:hover {
  transform: rotate(0deg) translateY(-6px);
  box-shadow: var(--shadow-md);
}

.step-num-badge {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 700;
  color: #1a1523;
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 18px;
  border: 2.5px solid #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.35rem;
}

.step-title {
  font-family: var(--font-display);
  font-size: 1.45rem;
  color: var(--color-text);
  line-height: 1.15;
}

.step-desc {
  font-size: 0.96rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* ══════════════════════════════════════════════════════
   5. SECTION SOMBRE (#1a1523) — Confidentialité
   ══════════════════════════════════════════════════════ */
.dark-privacy-section {
  background-color: #1a1523;
  color: #fff8ee;
  padding: 5.5rem 0;
}

.dark .dark-privacy-section {
  background-color: #100c17;
  border-bottom: 1.5px solid #2b2438;
}

.dark-privacy-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
}

@media (min-width: 900px) {
  .dark-privacy-grid {
    grid-template-columns: 1.15fr 0.95fr;
    gap: 4rem;
  }
}

.dark-section-title {
  font-family: var(--font-display);
  font-size: 2.35rem;
  line-height: 1.04;
  letter-spacing: -0.03em;
  color: #fff8ee;
  margin-bottom: 1.25rem;
}

@media (min-width: 768px) {
  .dark-section-title {
    font-size: 3.15rem;
  }
}

.dark-section-desc {
  font-size: 1.05rem;
  line-height: 1.65;
  color: #c6bfd1;
  margin-bottom: 1.75rem;
}

.dark-section-desc strong {
  color: #d9f24a;
}

.dark-checklist {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.dark-checklist li {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.98rem;
  font-weight: 500;
  color: #fff8ee;
}

.dark-check-icon {
  color: #d9f24a;
  flex-shrink: 0;
}

.dark-privacy-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-sticker-coral {
  background-color: #ff5a36;
  color: #ffffff;
  border: 4px solid #ffffff;
  border-radius: 22px;
  padding: 0.85rem 1.4rem;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  transform: rotate(-4deg);
  margin-bottom: -16px;
  z-index: 2;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
}

.stat-big {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-sub {
  font-size: 0.78rem;
  font-weight: 600;
}

.privacy-terminal-card {
  width: 100%;
  background-color: #261f33;
  border: 2px solid #3f3552;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
}

.terminal-bar {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.85rem 1.25rem;
  background-color: #332c3f;
  border-bottom: 1px solid #483f59;
}

.t-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.t-dot--red    { background-color: #ff5f57; }
.t-dot--yellow { background-color: #febc2e; }
.t-dot--green  { background-color: #28c840; }

.terminal-title {
  margin-left: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #c6bfd1;
}

.terminal-body {
  padding: 1.75rem 1.4rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.t-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #3f3552;
  font-size: 0.9rem;
}

.t-line:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.t-key {
  color: #c6bfd1;
}

.t-val {
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: 0.84rem;
  text-align: right;
}

.t-val--lime   { color: #d9f24a; }
.t-val--mint   { color: #a8e6c3; }
.t-val--sky    { color: #9cd2ff; }
.t-val--yellow { color: #ffd84d; }

/* ══════════════════════════════════════════════════════
   6. 10 FORMATS — Fond Crème (#fff8ee)
   ══════════════════════════════════════════════════════ */
.formats-section {
  background-color: var(--color-bg);
  padding: 5.5rem 0;
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

.type-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform var(--transition-spring), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.type-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.type-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.type-icon-box {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 12px;
  border: 2px solid #1a1523;
  color: #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  color: var(--color-text-muted);
}

.type-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.type-desc {
  font-size: 0.92rem;
  color: var(--color-text-muted);
  line-height: 1.55;
  flex-grow: 1;
}

.type-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 0.35rem;
  transition: gap var(--transition-fast);
}

.type-card:hover .type-action {
  gap: 0.65rem;
}

/* ══════════════════════════════════════════════════════
   7. COMPARATIF & IMPRESSION — Fond Sage (#e4e6e1)
   ══════════════════════════════════════════════════════ */
.comparison-section {
  background-color: var(--color-bg-sage);
  padding: 5.5rem 0;
  border-top: 1.5px solid var(--color-border);
  border-bottom: 1.5px solid var(--color-border);
}

.comparison-table-card {
  overflow-x: auto;
  background-color: var(--color-surface);
  border: 2.5px solid #1a1523;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-md);
  margin-bottom: 3rem;
}

.dark .comparison-table-card {
  border-color: var(--color-border);
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.96rem;
}

.comparison-table th,
.comparison-table td {
  padding: 1.2rem 1.5rem;
  border-bottom: 1.5px solid var(--color-border);
}

.comparison-table tbody tr:last-child td {
  border-bottom: none;
}

.comparison-table th {
  font-family: var(--font-display);
  font-size: 1.05rem;
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.studio-th-pill {
  display: inline-flex;
  padding: 0.25rem 0.85rem;
  border-radius: 999px;
  background-color: #d9f24a;
  color: #1a1523;
  border: 2px solid #1a1523;
  font-size: 0.95rem;
}

.td-feature {
  font-weight: 700;
  color: var(--color-text);
}

.td-studio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.td-studio svg {
  color: var(--color-success);
  flex-shrink: 0;
}

.td-others {
  color: var(--color-text-muted);
}

/* Encart Impression PAO */
.print-card {
  background-color: var(--color-surface);
  border: 2.5px solid #1a1523;
  border-radius: var(--radius-2xl);
  padding: 2.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: center;
  box-shadow: var(--shadow-sm);
}

.dark .print-card {
  border-color: var(--color-border);
}

@media (min-width: 860px) {
  .print-card {
    grid-template-columns: 1.2fr 1fr;
    padding: 3rem;
  }
}

.print-title {
  font-family: var(--font-display);
  font-size: 1.95rem;
  line-height: 1.1;
  color: var(--color-text);
  margin-bottom: 0.85rem;
}

.print-desc {
  font-size: 0.98rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.print-features-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  background-color: var(--color-bg);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
}

.print-features-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--color-text);
}

.pf-icon {
  color: var(--color-success);
  flex-shrink: 0;
  margin-top: 2px;
}

/* ══════════════════════════════════════════════════════
   8. TÉMOIGNAGES — Fond Crème (#fff8ee)
   ══════════════════════════════════════════════════════ */
.testimonials-section {
  background-color: var(--color-bg);
  padding: 5.5rem 0 2.5rem;
}

.stars-row {
  display: inline-flex;
  gap: 0.25rem;
  margin-bottom: 0.85rem;
}

.star-gold {
  color: #1a1523;
  fill: #ffd84d;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
}

@media (min-width: 700px) {
  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1100px) {
  .testimonials-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.testimonial-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 1.65rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
  box-shadow: var(--shadow-xs);
}

.testimonial-quote {
  font-size: 0.95rem;
  color: var(--color-text);
  line-height: 1.55;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1.5px solid var(--color-border-subtle);
}

.author-badge {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
  border: 2px solid #1a1523;
  color: #1a1523;
  font-family: var(--font-display);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.author-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text);
}

.author-role {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

/* ══════════════════════════════════════════════════════
   9. FAQ — Accordéon Cartes 26px + rond Lime (+)
   ══════════════════════════════════════════════════════ */
.faq-section {
  background-color: var(--color-bg);
  padding: 4.5rem 0 5.5rem;
}

.faq-list {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.faq-card {
  background-color: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 26px;
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.faq-card--open {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}

.faq-trigger {
  width: 100%;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  text-align: left;
  cursor: pointer;
}

.faq-question {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  flex: 1;
}

.faq-plus-circle {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background-color: #d9f24a;
  color: #1a1523;
  border: 2px solid #1a1523;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform var(--transition-spring), background-color var(--transition-fast);
}

.faq-card--open .faq-plus-circle {
  transform: rotate(45deg);
  background-color: #1a1523;
  color: #d9f24a;
}

.faq-answer {
  padding: 0 1.5rem 1.4rem;
  font-size: 0.96rem;
  color: var(--color-text-muted);
  line-height: 1.65;
}

/* ══════════════════════════════════════════════════════
   10. CTA FINAL — Fond Lime (#d9f24a)
   ══════════════════════════════════════════════════════ */
.final-cta-section {
  background-color: #d9f24a;
  color: #1a1523;
  padding: 5.5rem 0;
  border-top: 3px solid #1a1523;
}

.final-cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.35rem;
}

.final-cta-title {
  font-family: var(--font-display);
  font-size: 2.65rem;
  font-weight: 700;
  line-height: 0.96;
  letter-spacing: -0.04em;
  color: #1a1523;
}

@media (min-width: 768px) {
  .final-cta-title {
    font-size: 4rem;
  }
}

.final-cta-sub {
  font-size: 1.12rem;
  font-weight: 500;
  color: #1a1523;
  opacity: 0.88;
  max-width: 540px;
}

.final-cta-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.9rem;
  margin-top: 0.5rem;
}

.final-cta-section .qr-btn--ink {
  background-color: #1a1523;
  color: #fff8ee;
  border-color: #1a1523;
}

.final-cta-section .qr-btn--outline {
  background-color: rgba(255, 255, 255, 0.55);
  color: #1a1523;
  border-color: #1a1523;
}

.final-cta-section .qr-btn--outline:hover {
  background-color: #ffffff;
}
</style>
