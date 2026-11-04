# Spécification Fonctionnelle Détaillée : Référencement Naturel (SEO) et Pages Publiques

> **Module :** `features/seo.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-014`, `SEO-001` à `SEO-003`, `QA-003`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Définir la structure sémantique, le pré-rendu statique, les métadonnées de référencement naturel et le maillage interne de l'ensemble des pages publiques afin de positionner durablement QR Studio sur les requêtes cibles des moteurs de recherche sans dépendre de budgets publicitaires payants (SEA).

---

## 2. Périmètre

### Inclus
- Pré-rendu statique HTML intégral de toutes les routes publiques via Nuxt SSG.
- Génération automatisée des balises `<title>`, méta-descriptions, URLs canoniques et balises sociales (OpenGraph et Twitter Cards).
- Implémentation des schémas de données structurées Schema.org au format JSON-LD (`SoftwareApplication`, `HowTo`, `Article`, `FAQPage`).
- Génération automatisée du sitemap XML (`/sitemap.xml`) et du fichier d'exploration (`/robots.txt`).
- Maillage interne stratégique reliant les guides pédagogiques à l'éditeur pré-configuré.

### Exclus
- Cloaking, fermes de liens ou techniques SEO abusives (« Black Hat »).
- Traduction automatique de mauvaise qualité générant du contenu dupliqué.

---

## 3. Utilisateur et cas d'utilisation
- **Internaute en recherche active :** Trouve un guide clair sur Google pour créer un QR code de menu de restaurant sans abonnement, lit les conseils et commence instantanément sa création d'un simple clic.
- **Robot d'indexation (Googlebot) :** Analyse un code HTML statique rapide, propre et sémantique, valorisant la note de qualité du domaine.

---

## 4. Prérequis
- Configuration Nuxt avec module SEO officiel (`@nuxtjs/seo` ou composables natifs `useSeoMeta()` et `useHead()`).

---

## 5. Parcours utilisateur
1. L'internaute recherche sur Google : *« créer qr code wifi invité sans mot de passe à l'oral »*.
2. Le guide `/guides/qr-code-wifi` apparaît dans les premiers résultats avec un extrait enrichi (*Rich Snippet HowTo*).
3. L'internaute arrive sur la page statique servie instantanément par le CDN (< 500 ms).
4. Après avoir lu les conseils, il clique sur le bouton « Créer mon QR Wi-Fi maintenant ».
5. L'éditeur `/create?type=wifi` s'ouvre avec le formulaire Wi-Fi pré-sélectionné.

---

## 6. Comportement attendu
- Chaque page dispose d'un titre unique et percutant de 50 à 60 caractères.
- Chaque méta-description fait entre 140 et 155 caractères et contient un appel à l'action clair.
- Les données structurées JSON-LD sont valides selon l'outil de test des résultats enrichis de Google.

---

## 7. Règles métier
1. **Unicité des balises canoniques :** Chaque page déclare expressément son URL absolue canonique (`https://qrstudio.app/...`) pour éviter tout problème de duplication d'URL (avec ou sans slash final).
2. **Qualité éditoriale anti-spam :** Chaque guide doit apporter une véritable valeur informative (recommandations d'impression, écueils techniques, explications de scannabilité) et non une simple répétition de mots-clés.
3. **Hiérarchie sémantique stricte :** Une seule balise `<h1>` par page, suivie d'une arborescence logique de `<h2>` et `<h3>`.

---

## 8. Validations et erreurs
- Contrôle au build : Tout lien interne brisé (code HTTP 404) fait échouer la compilation statique pour garantir un maillage interne parfait.

---

## 9. Cas limites
- **Partage sur les réseaux sociaux (WhatsApp, LinkedIn, Twitter) :** La balise `og:image` pointe vers une image OpenGraph dédiée de 1200×630 px hébergée statiquement pour afficher un aperçu valorisant lors du partage d'un lien.

---

## 10. Interface utilisateur
- Mise en page aérée des pages éditoriales (`/guides/*`, `/about`, `/privacy`, `/legal`) privilégiant une lisibilité maximale (typographie sans-serif, interlignage confortable, contrastes conformes WCAG).
- Fil d'Ariane (*breadcrumb*) accessible pour faciliter la navigation hiérarchique.

---

## 11. Architecture technique

### Pages et Composables
- `pages/index.vue`, `pages/create.vue`, `pages/guides/*.vue`
- Utilisation systématique de `useSeoMeta()` au sein de chaque page Nuxt.

### Fichiers statiques
- `public/robots.txt` :
  ```text
  User-agent: *
  Allow: /
  Sitemap: https://qrstudio.app/sitemap.xml
  ```
- `public/sitemap.xml` : Liste exhaustive des URLs statiques pré-rendues.

---

## 12. Critères d'acceptation
- **CA-SEO-01 :** Étant donné le code source HTML généré de `/guides/qr-code-wifi`, alors le bloc JSON-LD `@type: "HowTo"` est présent et valide.
- **CA-SEO-02 :** Étant donné un audit Lighthouse exécuté sur la page d'accueil, alors la note de la catégorie « SEO » est égale à 100/100.

---

## 13. Stratégie de tests

### Cas nominaux
- Contrôle de la présence des balises `<title>`, `<meta name="description">`, `<link rel="canonical">` dans les fichiers `.html` du répertoire `.output/public/`.

### Cas d'erreur
- Vérification qu'aucune route publique ne renvoie de directive `noindex` par inadvertance.

### Cas limites
- Test d'affichage des aperçus OpenGraph avec le débogueur officiel Facebook / Twitter Card Validator.

### Non-régression
- Vérification que la structure des titres `<h1>` reste unique après chaque mise à jour de composants de layout.

---

## 14. Exigences liées
- `FR-014`, `SEO-001`, `SEO-002`, `SEO-003`, `QA-003`.

---

## 15. Dépendances et risques
- **Risque :** Risque de cannibalisation de mots-clés si deux guides ciblent la même intention de recherche.
- **Atténuation :** Délimitation sémantique stricte entre les guides (ex. distinction entre le guide URL générique et le guide spécifique Menu Restaurant).

---

## 16. Documentation à mettre à jour
- `docs/08-seo-publicite-et-monetisation.md`.

---

## 17. Questions ouvertes
- *Faut-il prévoir un blog régulier ?* Pour la v1.0, les 4 guides thématiques ciblés constituent le socle d'acquisition prioritaire. Un système de blog plus étendu sera envisagé en v1.2 si les données d'analyse montrent une traction favorable.
