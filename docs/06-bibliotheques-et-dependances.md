# Évaluation des Bibliothèques et Dépendances — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Analyse critique, compatibilité Nuxt/SSR et justification des packages tiers  
> **Date :** 2026-10-27

---

## 1. Politique stricte de gestion des dépendances

Pour garantir la pérennité, la légèreté et la sécurité de QR Studio, toute dépendance introduite doit répondre à 4 critères éliminatoires :
1. **Zéro dépendance serveur** : Le package doit fonctionner intégralement côté client dans un environnement navigateur moderne.
2. **Compatibilité SSR/SSG Nuxt** : Ne doit pas faire échouer la compilation statique (`nuxt generate`).
3. **Empreinte bundle maîtrisée** : Impact mesuré sur le poids JavaScript final (Tree-shaking supporté).
4. **Licence libre et permissive** : MIT, Apache-2.0 ou BSD-3-Clause uniquement.

---

## 2. Tableau comparatif et statut des dépendances

| Bibliothèque | Rôle fonctionnel | Statut | Risque SSR | Alternatives analysées |
| :--- | :--- | :---: | :---: | :--- |
| **Nuxt 3 / Nuxt 4** | Framework applicatif & SSG | **Retenue** | Faible (maîtrisé) | Vite + Vue Router, Astro, Next.js |
| **qr-code-styling** | Moteur de rendu graphique QR | **Retenue** | Élevé si non encapsulé | `qrcode`, `easyqrcodejs`, SVG direct |
| **dexie** (v4.x) | Abstraction IndexedDB | **Retenue** | Moyen (`window.indexedDB`) | `idb`, `localForage`, localStorage brut |
| **zod** | Validation schémas & formulaires | **Retenue** | Zéro (isomorphe) | `valibot`, `yup`, fonctions manuelles |
| **lucide-vue-next** | Icônes vectorielles légères | **Retenue** | Zéro (composants SVG purs) | FontAwesome, Unplugin-Icons, SVGs custom |
| **vitest** | Tests unitaires & intégration | **Retenue (Dev)** | N/A (Dev/CI) | Jest, Node test runner |
| **@playwright/test** | Tests de parcours E2E | **Retenue (Dev)** | N/A (Dev/CI) | Cypress, Puppeteer |
| **pinia** | Gestion d'état global | **Rejetée (v1.0)** | Zéro | Composables Vue 3 natifs (`useState`) |
| **canvas-confetti** | Effets festifs au téléchargement | **À confirmer** | Faible | CSS animations pures |

---

## 3. Analyse détaillée des dépendances retenues

---

### 3.1. `qr-code-styling`
- **Rôle :** Moteur graphique générant le QR code avec des styles personnalisés (coins arrondis, points dégradés, incrustation de logo au centre).
- **Pourquoi elle est retenue :** C'est la bibliothèque open-source la plus aboutie pour produire des QR codes esthétiques sans devoir réécrire un moteur géométrique complexe à partir de zéro.
- **Capacités réelles vérifiées :**
  - Styles de modules : `square`, `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`.
  - Styles des yeux (coins) : `square`, `extra-rounded`, `dot`.
  - Dégradés linéaires et radiaux sur les points et l'arrière-plan.
  - Incrustation d'image de logo avec élimination des points sous-jacents (`hideBackgroundDots`).
  - Export direct en `svg` et `png`.
- **Limites fonctionnelles identifiées :**
  - *Gestion des cadres textuels (Call-to-Action) :* `qr-code-styling` ne gère **pas** nativement les bandeaux décoratifs textuels extérieurs (ex. encadré avec texte *« SCANNEZ-MOI »*). **Décision architecturale :** Un service sur-mesure (`FrameComposerService`) a été conçu pour envelopper le canvas ou le SVG de `qr-code-styling` dans un canevas composite.
  - *Export WebP et JPEG :* Le support de l'export WebP dépend des fonctionnalités de conversion du Canvas du navigateur hôte via `canvas.toBlob('image/webp')`.
- **Contraintes SSR Nuxt :** `qr-code-styling` instancie des éléments `document.createElement('canvas')` dès son import. **Règle absolue :** Import dynamique (`await import('qr-code-styling')`) ou encapsulation stricte dans des composants exécutés uniquement côté client (`onMounted` ou `<ClientOnly>`).

---

### 3.2. `dexie` (v4.x)
- **Rôle :** Couche d'accès typée et asynchrone à la base de données IndexedDB du navigateur.
- **Pourquoi elle est retenue :** L'API native d'IndexedDB est verbeuse et propice aux erreurs de gestion de transactions. Dexie fournit une syntaxe moderne basée sur les Promesses, un typage TypeScript strict pour chaque table, et gère nativement le stockage des `Blob` volumineux (logos).
- **Alternatives évaluées :**
  - `localStorage` : Rejeté pour les projets, car synchrone, bloquant sur le thread principal et plafonné à ~5 Mo (incapable de stocker plusieurs logos en haute définition).
  - `idb` : Plus bas niveau, requiert plus de code boilerplate que Dexie pour la gestion des migrations de schéma.
- **Contraintes SSR :** Doit être initialisé uniquement lors d'un appel côté client.

---

### 3.3. `zod`
- **Rôle :** Validation des schémas de données des 10 formulaires et contrôle strict des fichiers JSON importés.
- **Pourquoi elle est retenue :** Inférence automatique des types TypeScript à partir des schémas (`z.infer<typeof schema>`), messages d'erreurs clairs et compréhensibles par les utilisateurs, zéro dépendance externe.
- **Alternatives évaluées :**
  - `valibot` : Empreinte plus faible de quelques kilo-octets, mais écosystème et intégrations moins matures pour la validation dynamique de discriminated unions complexes.

---

### 3.4. `lucide-vue-next`
- **Rôle :** Icônes visuelles pour les types de contenus (Wi-Fi, URL, Carte, Contact, etc.) et les actions de l'éditeur.
- **Pourquoi elle est retenue :** Icônes SVG légères sous forme de composants Vue 3 avec tree-shaking parfait (seules les icônes réellement importées sont intégrées dans le bundle).

---

### 3.5. `vitest` et `@playwright/test`
- **Vitest :** Exécute les suites de tests unitaires (sérialiseurs de données, schémas Zod, logique de contraste de couleur) avec une vitesse d'exécution instantanée grâce à l'infrastructure Vite sous-jacente de Nuxt.
- **Playwright :** Pilote de véritables instances de navigateurs headless (Chromium, Firefox, WebKit) pour valider de bout en bout la saisie, le rendu du QR code, le téléchargement de fichiers et l'absence de régression visuelle.

---

## 4. Dépendances formellement rejetées

1. **`pinia`** : Inutile pour la v1.0. Les composables Vue 3 (`useQrProject`, `useLocalProjects`) fournissent toute la réactivité requise sans complexité superflue ni surplus d'octets.
2. **Bibliothèques de génération QR basées sur serveur** (ex. wrappers API) : En violation directe avec la promesse de confidentialité et de fonctionnement hors-ligne.
3. **Frameworks CSS lourds avec dépendances JavaScript intrusives** : Rejetés au profit d'un design système en CSS moderne avec variables, garantissant des performances de rendu optimales.
