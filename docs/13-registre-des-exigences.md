# Registre Central des Exigences et Matrice de Traçabilité — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Matrice de traçabilité reliant exigences, spécifications, tâches et tests de validation  
> **Date :** 2026-10-27

---

## 1. Nomenclature des identifiants d'exigences

- **`FR-xxx`** : Exigences Fonctionnelles (Functional Requirements).
- **`NFR-xxx`** : Exigences Non Fonctionnelles (Performance, Ergonomie, Compatibilité).
- **`SEC-xxx`** : Exigences de Sécurité et Confidentialité (Privacy by Design).
- **`SEO-xxx`** : Exigences d'Indexation et Référencement Naturel.
- **`QA-xxx`** : Exigences d'Assurance Qualité et Scannabilité.

---

## 2. Matrice de traçabilité complète

| ID | Description synthétique | Priorité | Document de référence | Tâche liée | Tests associés | Statut |
| :--- | :--- | :---: | :--- | :---: | :--- | :---: |
| **FR-001** | Initialisation et rendu immédiat d'un QR code par défaut | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-003` | Test rendu Canvas/SVG client | Validé (qr-engine.service & QrPreview) |
| **FR-002** | Sélecteur dynamique parmi 10 types de contenus | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-004` | Test commutation d'état UI | Validé (QrTypeSelector & 10 formulaires) |
| **FR-003** | Validation des données en temps réel via Zod | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-004` | Tests unitaires schémas Zod | Validé (schémas Zod & formulaires) |
| **FR-004** | Prévisualisation interactive réactive (< 100 ms) | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-003` | Test performance debounce | Validé (useQrEngine debounce 100ms) |
| **FR-005** | Personnalisation des couleurs, formes et dégradés | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-005` | Test rendu options graphiques | Validé (QrShapeEditor, QrColorEditor) |
| **FR-006** | Incrustation de logo avec correction d'erreur auto Q/H | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-005` | Test upload + scan jsQR | Validé (QrLogoEditor & élévation auto Q/H) |
| **FR-007** | Cadres décoratifs avec texte Call-to-Action | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-005` | Test composition canvas frame | Validé (FrameComposerService & QrFrameEditor) |
| **FR-008** | Export binaire PNG, JPEG, WebP et vectoriel SVG | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-006` | Tests unitaires Vitest (Blob & résolutions) | Validé (ExportService, QrExportPanel & print.css) |
| **FR-009** | Enregistrement de projets dans IndexedDB (Dexie) | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-007` | Test fake-indexeddb CRUD | Validé (db.service, useLocalProjects) |
| **FR-010** | Gestionnaire de projets (/projects : Ouvrir, Supprimer...) | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-007` | Test E2E gestion projets | Validé (pages/projects.vue, ProjectCard) |
| **FR-011** | Import et Export de configuration au format JSON | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-007` | Test validation Zod JSON | Validé (project.schema.ts & import/export) |
| **FR-012** | Architecture des routes et navigation fluide | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-002` | Test de routage Nuxt | Validé (SSG routes / /create /projects) |
| **FR-013** | Encarts publicitaires non intrusifs (CLS = 0) | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-009` | Test CSS dimensions fixes | À implémenter |
| **FR-014** | Guides SEO thématiques avec CTA pré-configuré | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-008` | Test pré-rendu SSG HTML | À implémenter |
| **FR-015** | Gestion des erreurs sans fuite et notifications toast | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-004` | Tests cas limites et toasts | Validé (validation réactive sans fuite réseau) |
| **FR-016** | Ergonomie responsive mobile avec bottom action bar | P0 | `docs/02-specifications-fonctionnelles.md` | `QR-002` | Test Playwright mobile 375px | Validé (onglets & action bar) |
| **FR-017** | Accessibilité WCAG 2.1 AA et navigation clavier | P1 | `docs/02-specifications-fonctionnelles.md` | `QR-002` | Audit automatisé axe-core | Validé (labels & focus contrastés) |
| **NFR-001** | Temps de rendu de prévisualisation inférieur à 100 ms | P0 | `docs/03-architecture-technique.md` | `QR-003` | Benchmark unitaire debounce | Validé (tests unitaires debounce) |
| **NFR-002** | Poids du bundle JavaScript initial < 150 ko gzippé | P0 | `docs/03-architecture-technique.md` | `QR-001` | Analyse du build Vite/Nitro | Validé (69.6 ko gzippé) |
| **NFR-003** | Compatibilité navigateurs modernes (Chrome, FF, Safari, Edge) | P0 | `docs/06-bibliotheques-et-dependances.md` | `QR-010` | Matrice de tests Playwright | À implémenter |
| **SEC-001** | Zéro transmission des contenus QR à un serveur distant | P0 | `docs/07-securite-et-confidentialite.md` | `QR-003` | Audit réseau (0 requête sortante) | Validé (génération 100% in-browser) |
| **SEC-002** | Neutralisation des scripts SVG téléversés (pas de v-html) | P0 | `docs/07-securite-et-confidentialite.md` | `QR-005` | Test unitaire injection XSS | Validé (assainissement SVG dédié `svg-sanitizer.util.ts` + échappement XML `FrameComposerService` + validation Data URL Zod) |
| **SEC-003** | Action « Tout effacer » purgeant IndexedDB et localStorage | P1 | `docs/07-securite-et-confidentialite.md` | `QR-007` | Test Dexie.delete() | Validé (clearAllProjects & modal confirmation) |
| **SEO-001** | Pré-rendu statique SSG de 100 % des pages publiques | P0 | `docs/08-seo-publicite-et-monetisation.md` | `QR-008` | Contrôle des fichiers .html | En cours (Pages /, /create, /projects pré-rendues SSG) |
| **SEO-002** | Données structurées Schema.org JSON-LD (SoftwareApp, HowTo) | P1 | `docs/08-seo-publicite-et-monetisation.md` | `QR-008` | Validateur Schema.org | Validé (JSON-LD SoftwareApplication & FAQPage sur /) |
| **SEO-003** | Fichiers robots.txt et sitemap.xml autogénérés | P1 | `docs/08-seo-publicite-et-monetisation.md` | `QR-008` | Vérification HTTP sitemap | À implémenter |
| **QA-001** | Décodage automatisé jsQR sur tous les formats de points | P0 | `docs/09-tests-et-criteres-acceptation.md` | `QR-010` | Test unitaire décodage jsQR | À implémenter |
| **QA-002** | Validation physique de scannabilité sur iOS et Android | P0 | `docs/09-tests-et-criteres-acceptation.md` | `QR-010` | Banc de test sur appareils réels | À implémenter |
| **QA-003** | Core Web Vitals : LCP < 2,5 s, CLS < 0,05, INP < 150 ms | P1 | `docs/09-tests-et-criteres-acceptation.md` | `QR-010` | Audit Lighthouse CI | À implémenter |
