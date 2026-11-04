# QR Studio — Générateur de QR codes moderne, local et respectueux de la vie privée

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs)](https://vuejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.x%20%2F%204.x-00DC82?logo=nuxtdotjs)](https://nuxt.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Licence](https://img.shields.io/badge/Licence-MIT-green.svg)](LICENSE)
[![Zero-Backend](https://img.shields.io/badge/Architecture-100%25%20Client--Side-blueviolet)](#architecture)

**QR Studio** est une application web moderne permettant de créer, personnaliser, prévisualiser, sauvegarder et exporter des QR codes riches en haute résolution.

Contrairement aux générateurs de QR codes classiques qui transitent vos informations sensibles sur des serveurs distants ou vous imposent des abonnements payants après quelques scans, **QR Studio est 100 % gratuit, sans inscription, sans serveur applicatif et garantit que vos données ne quittent jamais votre navigateur.**

---

## Sommaire

- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Principes et garanties](#-principes-et-garanties)
- [Stack technique](#-stack-technique)
- [Prérequis d'installation](#-prérequis-dinstallation)
- [Commandes du projet](#-commandes-du-projet)
- [Arborescence du projet](#-arborescence-du-projet)
- [Documentation complète](#-documentation-complète)
- [Limites actuelles du produit](#-limites-actuelles-du-produit)
- [Guide de contribution](#-guide-de-contribution)
- [Licence](#-licence)

---

## 🌟 Fonctionnalités principales

1. **Prise en charge complète de 10 types de contenus** :
   - URL de sites web et liens profonds.
   - Texte brut libre et code.
   - Connexion Wi-Fi rapide (WPA/WPA2/WPA3, WEP, réseau ouvert, réseau masqué).
   - Fiches contact vCard 3.0 / 4.0 complètes (nom, entreprise, tél, e-mail, adresse, note).
   - E-mail pré-rempli (destinataire, objet, corps du message).
   - SMS pré-rempli (numéro et message).
   - Appel téléphonique direct (protocole `tel:`).
   - Localisation GPS (latitude, longitude, recherche de coordonnées).
   - Événement de calendrier (fichier iCalendar standard, date de début/fin, lieu).
   - Données personnalisées brutes.

2. **Personnalisation visuelle avancée** :
   - Palette de couleurs unies ou dégradés linéaires/radiaux (premier plan et arrière-plan).
   - Formes personnalisées des modules (carré, arrondi, points, élégant).
   - Styles distincts pour les yeux/carrés de repérage et les points intérieurs.
   - Intégration de logos au centre (formats PNG, SVG, JPEG, WebP) avec gestion de la marge et élimination automatique des points sous-jacents.
   - Cadres esthétiques avec libellé personnalisable (ex. *« Scannez-moi »*, *« Menu du restaurant »*).
   - Niveau de correction d'erreur configurable (`L` ~7 %, `M` ~15 %, `Q` ~25 %, `H` ~30 %).

3. **Export haute définition multiformat** :
   - Formats vectoriels : **SVG** (idéal pour l'impression grand format et PAO).
   - Formats matriciels : **PNG** (avec transparence), **JPEG** et **WebP** haute résolution (jusqu'à 4096×4096 px).
   - Impression directe via le navigateur avec feuille de style CSS optimisée.
   - Export et import de la configuration au format **JSON** pour reprendre un travail ultérieurement.

4. **Gestion de projets en local** :
   - Sauvegarde illimitée de projets dans la base de données locale du navigateur (**IndexedDB**).
   - Historique, renommage, duplication et suppression en un clic.
   - Aucun compte requis, aucune dépendance au cloud.

---

## 🛡️ Principes et garanties

- **100 % Côté Client** : Aucune API distante n'est sollicitée pour générer les images ou les vecteurs du QR code.
- **Vie privée préservée** : Vos mots de passe Wi-Fi, coordonnées personnelles et textes restent strictement sur votre machine.
- **QR Codes Statiques Pérennes** : Les QR codes générés encodent directement l'information sans passer par un service tiers de redirection. Ils fonctionneront à vie, sans risque d'expiration de lien.

---

## 💻 Stack technique

| Domaine | Technologie retenue | Justification principale |
| :--- | :--- | :--- |
| **Framework** | [Nuxt 3 / Nuxt 4](https://nuxt.com/) | Écosystème Vue moderne, architecture modulaire, génération statique (SSG). |
| **Langage** | [TypeScript 5](https://www.typescriptlang.org/) | Rigueur de typage, fiabilité accrue, auto-documentation du modèle de données. |
| **Moteur QR** | [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) | Moteur mature supportant formes de modules, dégradés, logos et formats SVG/PNG. |
| **Stockage local** | [Dexie.js](https://dexie.org/) | Wrapper élégant et performant au-dessus d'IndexedDB pour la gestion des projets. |
| **Validation** | [Zod](https://zod.dev/) | Validation des schémas de données à l'entrée des formulaires et à l'import JSON. |
| **Icônes** | [lucide-vue-next](https://lucide.dev/) | Bibliothèque d'icônes vectorielles légères et cohérentes. |
| **Tests** | [Vitest](https://vitest.dev/) & [Playwright](https://playwright.dev/) | Tests unitaires ultra-rapides et tests End-to-End fidèles au comportement réel. |

---

## 📋 Prérequis d'installation

- **Node.js** : version `^18.19.0` ou `>=20.9.0` (LTS recommandée).
- **Gestionnaire de paquets** : `npm` (`>=9.0.0`) ou `pnpm` (`>=8.0.0`).
- Navigateur web moderne supportant l'API Canvas et IndexedDB (Chrome, Firefox, Safari, Edge récents).

---

## 🚀 Commandes du projet

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-compte/qr-studio.git
cd qr-studio

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement local
npm run dev

# 4. Vérification du typage TypeScript
npm run typecheck

# 5. Exécution des tests unitaires et de sérialisation
npm run test:unit

# 6. Exécution des tests end-to-end
npm run test:e2e

# 7. Génération du site statique de production
npm run generate

# 8. Prévisualiser le site statique généré
npm run preview
```

---

## 📁 Arborescence du projet

```text
qr-studio/
├── AGENTS.md                  # Instructions permanentes des agents IA
├── README.md                  # Présentation générale du projet
├── docs/                      # Documentation exhaustive d'ingénierie
│   ├── 00-index.md            # Index documentaire et statut des documents
│   ├── 01-vision-produit.md   # Vision produit, utilisateurs cibles, périmètre
│   ├── 02-specifications-fonctionnelles.md
│   ├── 03-architecture-technique.md
│   ├── 04-modele-de-donnees.md
│   ├── 05-interface-utilisateur.md
│   ├── 06-bibliotheques-et-dependances.md
│   ├── 07-securite-et-confidentialite.md
│   ├── 08-seo-publicite-et-monetisation.md
│   ├── 09-tests-et-criteres-acceptation.md
│   ├── 10-plan-implementation.md
│   ├── 11-deploiement-et-maintenance.md
│   ├── 12-glossaire.md
│   ├── 13-registre-des-exigences.md
│   ├── decisions/             # Registre des ADR (Architectural Decision Records)
│   └── features/              # Spécifications détaillées des 10 modules fonctionnels
└── (Code source de l'application - app/, pages/, components/, etc.)
```

---

## 📚 Documentation complète

La documentation complète de référence se trouve dans le répertoire [`docs/`](docs/00-index.md).

- Pour comprendre les choix architecturaux majeurs, consultez les [ADRs dans docs/decisions/](docs/decisions/).
- Pour explorer les exigences et critères d'acceptation détaillés, reportez-vous aux [spécifications de fonctionnalités dans docs/features/](docs/features/).
- Si vous êtes un agent d'intelligence artificielle opérant sur le dépôt, votre document de référence obligatoire est [`AGENTS.md`](AGENTS.md).

---

## ⚠️ Limites actuelles du produit

La version initiale (v1.0) exclut délibérément les éléments suivants :
- Pas de génération par lot (batch CSV).
- Pas de synchronisation des projets dans le cloud (uniquement persistance locale sur l'appareil).
- Pas de gestion de comptes utilisateurs ou d'authentification.
- Pas de statistiques de scan à distance (car les QR codes sont 100 % statiques et ne sollicitent aucun serveur).
- Pas de modification de l'URL cible d'un QR code une fois imprimé.

---

## 🤝 Guide de contribution

1. Assurez-vous de lire le document [`AGENTS.md`](AGENTS.md) avant toute contribution.
2. Tout développement doit être adossé à une exigence documentée dans [`docs/13-registre-des-exigences.md`](docs/13-registre-des-exigences.md).
3. Tout ajout de fonctionnalité doit comporter ses critères d'acceptation et ses tests automatisés associés (`npm run test:unit`).
4. Veillez à ce que le build statique (`npm run generate`) se termine avec succès sans aucune régression.

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE). Vous êtes libre de l'utiliser, le modifier et le déployer conformément aux termes de la licence.
