# Index documentaire de QR Studio

> **Statut global :** À valider (Documentation complète de référence prête pour revue)  
> **Dernière révision :** 2026-10-27  
> **Auteurs :** Équipe d'Ingénierie & Produit QR Studio

---

## 1. Rôle et organisation du référentiel documentaire

Ce référentiel documentaire constitue la **source unique de vérité (Single Source of Truth - SSOT)** pour la conception, le développement, l'assurance qualité et l'exploitation de l'application **QR Studio**.

Il est conçu pour être directement exploitable par des développeurs humains ainsi que par des agents d'intelligence artificielle autonomes.

```text
docs/
├── 00-index.md                             # Présent index et cartographie
├── 01-vision-produit.md                    # Objectifs stratégiques, personas et périmètre
├── 02-specifications-fonctionnelles.md     # Spécifications globales et exigences fonctionnelles (FR)
├── 03-architecture-technique.md            # Architecture logicielle, flux de données et diagrammes
├── 04-modele-de-donnees.md                 # Types TypeScript, schémas Zod et structures de stockage
├── 05-interface-utilisateur.md             # UX/UI, ergonomie, composants et responsive design
├── 06-bibliotheques-et-dependances.md      # Évaluation technique et justification des dépendances
├── 07-securite-et-confidentialite.md       # Traitement local, intégrité, CSP et RGPD
├── 08-seo-publicite-et-monetisation.md     # Stratégie d'acquisition organique et monétisation AdSense
├── 09-tests-et-criteres-acceptation.md     # Matrice de qualité, tests unitaires, e2e et scannabilité
├── 10-plan-implementation.md               # Découpage séquentiel des tâches de réalisation (QR-001..010)
├── 11-deploiement-et-maintenance.md        # Déploiement statique, hébergement et cycle de vie
├── 12-glossaire.md                         # Définitions standardisées et terminologie
├── 13-registre-des-exigences.md            # Traçabilité complète des exigences (FR, NFR, SEC, SEO, QA)
├── decisions/                              # Registre des décisions d'architecture (ADR)
│   ├── ADR-001-deploiement-statique.md
│   ├── ADR-002-generation-locale.md
│   ├── ADR-003-stockage-local.md
│   ├── ADR-004-moteur-qr.md
│   └── ADR-005-strategie-seo-publicite.md
└── features/                               # Spécifications détaillées par module (17 rubriques normalisées)
    ├── qr-generation.md
    ├── qr-content-types.md
    ├── qr-customization.md
    ├── qr-logo-management.md
    ├── qr-frames.md
    ├── qr-export.md
    ├── local-projects.md
    ├── editor-interface.md
    ├── advertising.md
    └── seo.md
```

---

## 2. Tableau de bord des documents et statuts

| Fichier | Titre / Rôle | Statut | Document faisant autorité sur |
| :--- | :--- | :---: | :--- |
| [`AGENTS.md`](../AGENTS.md) | Guide permanent des agents IA | **À valider** | Règles de conduite, de typage et interdictions strictes. |
| [`README.md`](../README.md) | Accueil du projet & commandes | **À valider** | Prise en main, installation et commandes CLI. |
| [`00-index.md`](00-index.md) | Index et cartographie | **À valider** | Organisation de la documentation et statuts. |
| [`01-vision-produit.md`](01-vision-produit.md) | Vision produit & proposition de valeur | **À valider** | Problématique utilisateur, périmètre et exclusions. |
| [`02-specifications-fonctionnelles.md`](02-specifications-fonctionnelles.md) | Spécifications fonctionnelles globales | **À valider** | Exigences fonctionnelles génériques (`FR-xxx`). |
| [`03-architecture-technique.md`](03-architecture-technique.md) | Architecture technique et flux | **À valider** | Organisation des couches Nuxt, flux réactifs, diagrammes. |
| [`04-modele-de-donnees.md`](04-modele-de-donnees.md) | Modèle de données & typage TypeScript | **À valider** | Schémas Zod, interfaces TypeScript, versioning données. |
| [`05-interface-utilisateur.md`](05-interface-utilisateur.md) | UX/UI, composants et responsive | **À valider** | Agencement des écrans, hiérarchie visuelle, accessibilité. |
| [`06-bibliotheques-et-dependances.md`](06-bibliotheques-et-dependances.md) | Dépendances et bibliothèques | **À valider** | Choix des packages, compatibilité SSR, limites techniques. |
| [`07-securite-et-confidentialite.md`](07-securite-et-confidentialite.md) | Sécurité, vie privée et conformité | **À valider** | Zéro-fuite réseau, traitement des fichiers SVG, RGPD. |
| [`08-seo-publicite-et-monetisation.md`](08-seo-publicite-et-monetisation.md) | SEO, monétisation et AdSense | **À valider** | Pages indexables, balisage JSON-LD, règles publicitaires. |
| [`09-tests-et-criteres-acceptation.md`](09-tests-et-criteres-acceptation.md) | Stratégie QA et critères de test | **À valider** | Procédures de test, scénarios Gherkin, tests de scan. |
| [`10-plan-implementation.md`](10-plan-implementation.md) | Plan de réalisation séquentiel | **À valider** | Découpage des lots de développement (`QR-001` à `QR-010`). |
| [`11-deploiement-et-maintenance.md`](11-deploiement-et-maintenance.md) | Déploiement et exploitation statique | **À valider** | Build SSG, CDN, cache HTTP et politiques d'invalidation. |
| [`12-glossaire.md`](12-glossaire.md) | Glossaire terminologique | **À valider** | Définitions techniques et métier normalisées. |
| [`13-registre-des-exigences.md`](13-registre-des-exigences.md) | Registre de traçabilité des exigences | **À valider** | Matrice de liaison entre exigences, code et tests. |
| [`decisions/`](decisions/) | Registre des décisions (ADR) | **À valider** | Justifications formelles des choix d'ingénierie. |
| [`features/`](features/) | Spécifications des 10 modules | **À valider** | Comportements détaillés, cas limites et critères fins. |

*Légende des statuts :*  
- `À rédiger` : Document planifié mais non rédigé.  
- `En cours` : Rédaction partielle en cours.  
- `À valider` : Rédigé, complet, soumis à l'approbation de l'équipe d'ingénierie/produit.  
- `Validé` : Revue approuvée formellement.

---

## 3. Ordre de lecture recommandé

Pour appréhender le projet dans les meilleures conditions :

1. **Vision globale & contraintes :**
   - Commencer par [`01-vision-produit.md`](01-vision-produit.md) pour s'imprégner des attentes utilisateurs et des exclusions de périmètre.
   - Lire [`AGENTS.md`](../AGENTS.md) pour assimiler les règles strictes d'ingénierie et de développement.
2. **Architecture et technique :**
   - Consulter [`03-architecture-technique.md`](03-architecture-technique.md) et [`04-modele-de-donnees.md`](04-modele-de-donnees.md).
   - Parcourir les ADRs dans [`decisions/`](decisions/) pour comprendre *pourquoi* les choix statiques, locaux et sans backend ont été arrêtés.
3. **Spécifications détaillées :**
   - Examiner [`02-specifications-fonctionnelles.md`](02-specifications-fonctionnelles.md) puis les spécifications modulaires ciblées dans [`features/`](features/).
4. **Qualité et exécution :**
   - Étudier [`09-tests-et-criteres-acceptation.md`](09-tests-et-criteres-acceptation.md) avant de débuter une tâche du [`10-plan-implementation.md`](10-plan-implementation.md).
   - Se référer au [`13-registre-des-exigences.md`](13-registre-des-exigences.md) pour garantir la traçabilité.

---

## 4. Gestion des contradictions et gouvernance

Si une divergence ou contradiction apparaît entre deux documents du référentiel :

1. **Hiérarchie d'autorité :**
   - Sur les contraintes d'ingénierie, de confidentialité et les interdictions : [`AGENTS.md`](../AGENTS.md) prévaut sur tous les autres documents.
   - Sur les arbitrages technologiques : les fichiers [ADR (`docs/decisions/`)](decisions/) prévalent sur les spécifications fonctionnelles.
   - Sur le comportement métier d'un module précis : le fichier correspondant dans [`features/`](features/) prévaut sur [`02-specifications-fonctionnelles.md`](02-specifications-fonctionnelles.md).
   - Sur la liste des exigences : [`13-registre-des-exigences.md`](13-registre-des-exigences.md) fait autorité.
2. **Procédure de signalement :**
   - Tout agent ou développeur constatant une divergence doit suspendre toute implémentation incertaine, ouvrir une issue ou enregistrer la contradiction dans la section « Questions ouvertes » du document concerné, et demander un arbitrage.
