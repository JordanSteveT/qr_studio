# Stratégie SEO, Publicité et Monétisation — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Stratégie d'acquisition naturelle, maillage éditorial et monétisation programmatique  
> **Date :** 2026-10-27

---

## 1. Vision stratégique : Synergie SEO & Monétisation

Le modèle économique de QR Studio repose sur une boucle vertueuse :
1. **Acquisition 100 % organique** : Positionnement sur des requêtes transactionnelles et informatives à forte intention de recherche via des pages guides de haute qualité éditoriale pré-rendues statiquement (SSG).
2. **Fidélisation sans friction** : L'utilisateur utilise l'outil immédiatement, sans inscription ni barrière financière.
3. **Monétisation programmatique respectueuse** : Affichage d'encarts publicitaires ciblés (Google AdSense ou réseau partenaire) intégrés harmonieusement sans pénaliser l'expérience utilisateur ni les métriques Core Web Vitals.

> **Avertissement de réalisme commercial :** L'approbation d'un compte éditeur Google AdSense dépend de critères éditoriaux externes (volume de contenu exclusif, ancienneté du nom de domaine, conformité des mentions légales et politique de confidentialité). La qualité technique du code prépare les conditions idéales d'éligibilité, mais ne constitue pas une garantie d'approbation contractuelle automatique.

---

## 2. Cartographie des routes et stratégie SEO par page

Toutes les pages publiques bénéficient d'un pré-rendu statique complet par Nuxt (`SSG`), garantissant une indexation optimale par les robots des moteurs de recherche (Googlebot, Bingbot).

---

### 2.1. Page d'accueil (`/`)
- **Intention de recherche :** Transactionnelle / Navigationnelle (*« générateur qr code gratuit »*, *« créer qr code sans compte »*).
- **Public cible :** Grand public et professionnels recherchant une solution rapide et sans piège.
- **Titre SEO :** `QR Studio — Générateur de QR Code Gratuit, Illimité & 100% Local`
- **Méta-description :** `Créez et personnalisez vos QR codes en haute définition (SVG, PNG) gratuitement et sans inscription. Vos données ne quittent jamais votre navigateur. Simple, rapide et garanti sans abonnement.`
- **Données structurées JSON-LD :** `SoftwareApplication` et `WebApplication` avec notation de gratuité (`applicationCategory: 'UtilityApplication'`, `offers: { price: '0' }`).
- **Maillage interne :** Liens contextuels vers `/create` (CTA principal) et vers les 4 guides thématiques phares.

---

### 2.2. Page Éditeur (`/create`)
- **Intention de recherche :** Transactionnelle directe (*« créer mon qr code maintenant »*).
- **Titre SEO :** `Créateur de QR Code en Ligne — Personnalisation & Haute Résolution | QR Studio`
- **Méta-description :** `Personnalisez les couleurs, formes, logos et cadres de vos QR codes. Téléchargez instantanément en format vectoriel SVG ou PNG haute définition.`
- **Balise canonique :** `https://qrstudio.app/create`
- **Indexabilité :** `index, follow`.

---

### 2.3. Guide Wi-Fi (`/guides/qr-code-wifi`)
- **Intention de recherche :** Informative et pratique (*« comment faire un qr code pour connecter au wifi »*, *« qr code wifi invité entreprise »*).
- **Titre SEO :** `Comment créer un QR Code Wi-Fi sécurisé pour vos invités ? | Guide QR Studio`
- **Méta-description :** `Partagez votre connexion Wi-Fi facilement sans dévoiler votre mot de passe à l'oral. Générez un QR code Wi-Fi conforme WPA/WPA2/WPA3 à imprimer chez vous ou au bureau.`
- **Données structurées JSON-LD :** `HowTo` détaillant les étapes (1. Choisir le type de sécurité, 2. Renseigner le SSID et mot de passe, 3. Imprimer le QR code).
- **CTA dédié :** Bouton incrusté dans le texte ouvrant directement l'éditeur : `/create?type=wifi`.

---

### 2.4. Guide Contact vCard (`/guides/qr-code-contact`)
- **Intention de recherche :** Professionnelle (*« qr code carte de visite vcard »*, *« intégrer qr code cv »*).
- **Titre SEO :** `Créer un QR Code vCard pour Carte de Visite & CV Professionnel | QR Studio`
- **Méta-description :** `Permettez à vos contacts d'enregistrer votre numéro, e-mail et site directement dans leur téléphone en un scan. Format vCard universel compatible iPhone et Android.`
- **Données structurées JSON-LD :** `HowTo` + `Article`.
- **CTA dédié :** `/create?type=vcard`.

---

### 2.5. Guide Menu Restaurant (`/guides/qr-code-menu`)
- **Intention de recherche :** B2B / Restauration (*« qr code menu restaurant sans abonnement »*, *« qr code carte restaurant gratuit »*).
- **Titre SEO :** `QR Code Menu de Restaurant : La Solution Gratuite Sans Abonnement | QR Studio`
- **Méta-description :** `Créez un QR code permanent reliant vos clients à votre menu PDF ou site web. Zéro abonnement mensuel, zéro lien désactivé après 14 jours.`
- **Données structurées JSON-LD :** `Article` + `FAQPage`.
- **CTA dédié :** `/create?type=url`.

---

### 2.6. Pages de conformité et réassurance (`/privacy`, `/legal`, `/about`, `/contact`)
- Indispensables pour la crédibilité de l'application et l'obtention de la validation Google AdSense :
  - `/privacy` : Explication détaillée de l'absence de collecte de données dans l'application locale et politique sur les cookies publicitaires.
  - `/legal` : Éditeur du site, hébergeur et mentions de propriété intellectuelle.
  - `/about` : Histoire du projet, volonté de proposer une alternative éthique aux pièges d'abonnements en ligne.
  - `/contact` : Formulaire ou adresse d'assistance.

---

## 3. Données structurées et balisage technique

Toutes les pages intègrent automatiquement via le composable `useSeoMeta()` de Nuxt :
- `titleTemplate: '%s | QR Studio'`
- Balises OpenGraph complètes (`og:title`, `og:description`, `og:image`, `og:url`, `og:type: 'website'`).
- Cartes Twitter (`twitter:card: 'summary_large_image'`).
- Balise canonique stricte (`link: [{ rel: 'canonical', href: canonicalUrl }]`).
- Sitemap XML autogénéré (`/sitemap.xml`) recensant toutes les routes statiques avec leur priorité et date de modification.
- Fichier `/robots.txt` autorisant l'exploration complète du site.

---

## 4. Politique d'intégration publicitaire (Google AdSense)

### 4.1. Emplacements autorisés
1. **Emplacement 1 (Pied de page / Footer Banner) :**  
   Format horizontal standard (728×90 px sur desktop, 320×50 px ou 300×250 px sur mobile) positionné au-dessus du footer sur toutes les pages.
2. **Emplacement 2 (Sidebar Desktop) :**  
   Format vertical (160×600 px ou 300×600 px) placé à droite de l'écran sur les résolutions très larges (> 1440 px), sans empiéter sur l'espace de travail.
3. **Emplacement 3 (In-Article dans les Guides) :**  
   Encart rectangulaire (300×250 px ou responsive) inséré entre deux sections de texte d'un guide pratique.

### 4.2. Emplacements strictement interdits
- **Interdiction formelle** de placer un encart publicitaire entre le QR code d'aperçu et les boutons d'export (PNG, SVG, etc.).
- **Interdiction** de tout élément masquant ou simulant un faux bouton de téléchargement (« Fake Download Button »), pratique sanctionnée par Google et destructrice pour la confiance utilisateur.
- **Interdiction** de modales interstitielles bloquantes avant d'autoriser le téléchargement du fichier.

---

## 5. Préservation des performances Core Web Vitals et CLS = 0

L'injection de publicités externes représente un risque majeur de décalage visuel de mise en page (*Cumulative Layout Shift*).

**Solution technique mise en place dans le composant `<AdSlot>` :**
1. Chaque emplacement publicitaire dispose d'une hauteur minimale et de dimensions strictement réservées en CSS (`min-height: 250px; min-width: 300px; contain: layout;`).
2. Pendant le chargement du script tiers, le conteneur reste stable et n'occasionne aucun saut de contenu pour l'utilisateur.
3. Si la publicité ne se charge pas (adblocker activé ou absence de demande publicitaire), l'encart reste neutre sans perturber le flux de lecture.

---

## 6. Gestion du consentement (RGPD / ePrivacy)

1. En conformité avec les directives européennes, aucun script publicitaire ciblé n'est injecté avant l'accord explicite de l'utilisateur via une plateforme de gestion du consentement (CMP certifiée Google / IAB TCF v2.2).
2. Si le consentement est refusé, seules des annonces non personnalisées sont sollicitées ou aucun script tiers n'est exécuté.
3. Le fonctionnement de l'éditeur de QR code reste **100 % opérationnel** quel que soit le choix de l'utilisateur.
