# Spécification Fonctionnelle Détaillée : Cadres Décoratifs et Call-to-Action

> **Module :** `features/qr-frames.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-007`, `NFR-001`, `QA-001`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Fournir un système de cadres décoratifs élégants entourant la matrice QR avec un bandeau textuel d'appel à l'action personnalisable (ex. *« SCANNEZ-MOI »*, *« NOTRE CARTE »*), afin d'augmenter le taux de scan par les utilisateurs finaux tout en préservant scrupuleusement la géométrie scannable de la matrice.

---

## 2. Périmètre

### Inclus
- 5 styles de cadres :
  1. `none` : Matrice brute standard sans cadre.
  2. `bottom-badge` : Cadre avec bandeau cartouche sous le QR code.
  3. `top-badge` : Cadre avec bandeau cartouche au-dessus du QR code.
  4. `full-card` : Carte élégante à coins arrondis avec en-tête et pied de page.
  5. `speech-bubble` : Bulle de dialogue incitative pointant vers le code.
- Libellé textuel personnalisable (limité à 30 caractères).
- Personnalisation de la couleur du cadre et de la couleur du texte.
- Composition dynamique locale par le service `FrameComposerService`.
- Prise en compte du cadre lors des exports haute résolution (PNG, SVG, JPEG, WebP) et à l'impression.

### Exclus
- Déformation de la matrice QR pour l'adapter à des formes géométriques non carrées (ex. cœur, étoile) car cela brise la norme ISO de scannabilité.

---

## 3. Utilisateur et cas d'utilisation
- **Restaurateur :** Cadre avec libellé *« Consultez notre carte »* posé sur les tables.
- **Boutique physique :** Cadre *« Suivez-nous sur Instagram »* collé en vitrine.
- **Hôte Airbnb :** Cadre *« Connexion Wi-Fi rapide »* affiché dans l'entrée du logement.

---

## 4. Prérequis
- Rendu de la matrice QR brute disponible.
- Moteur composite `FrameComposerService` initialisé.

---

## 5. Parcours utilisateur
1. L'utilisateur se rend dans l'onglet « Cadre » de l'éditeur.
2. Il clique sur le style `bottom-badge`.
3. Le texte par défaut *« SCANNEZ-MOI »* apparaît dans un bandeau sous le QR code.
4. L'utilisateur modifie le texte en *« REJOIGNEZ LE WI-FI »*.
5. Il choisit une couleur d'arrière-plan de cadre assortie à sa marque.
6. L'aperçu et les boutons d'export intègrent automatiquement la nouvelle composition.

---

## 6. Comportement attendu
- Le QR code conserve sa zone de silence (*quiet zone*) minimale intacte à l'intérieur du cadre.
- Le texte est centré horizontalement et dimensionné automatiquement avec gestion des polices sans-serif lisibles (`Inter`, `system-ui`, `Arial`).
- La composition s'exécute en temps réel sur Canvas côté client sans latence perceptible.

---

## 7. Règles métier
1. **Sanctuarisation de la zone de silence :** Une marge minimale de 10 pixels blancs ou neutres doit obligatoirement séparer les bords extérieurs des yeux du QR code de la bordure du cadre décoratif.
2. **Longueur du texte bridée :** Le texte est limité à 30 caractères pour empêcher tout débordement hors du bandeau. Si l'utilisateur saisit un texte long, la taille de police est réduite dynamiquement de 18 px à 12 px.
3. **Contraste texte/cadre :** Le contraste entre la couleur du texte et la couleur du bandeau doit respecter les critères d'accessibilité WCAG (ratio minimal de 4,5:1).

---

## 8. Validations et erreurs
- Si le champ texte est laissé totalement vide par l'utilisateur, le bandeau s'efface proprement pour laisser place à un simple contour épuré, ou le style bascule sans planter.
- Les caractères accentués et ligatures françaises (`é`, `è`, `à`, `ç`, `œ`) sont parfaitement supportés lors du rendu Canvas.

---

## 9. Cas limites
- **Export très haute définition (4096×4096 px) :** Le service de composition applique un facteur d'échelle multiplicateur proportionnel à toutes les dimensions (largeur de trait, marges, taille de police) afin que le texte et les bordures restent parfaitement nets à l'échelle maximale.

---

## 10. Interface utilisateur
- Composant `QrFrameEditor` :
  - Sélecteur de forme de cadre avec vignettes graphiques de prévisualisation.
  - Champ de saisie pour le texte d'appel à l'action avec compteur de caractères (`x / 30`).
  - Sélecteur de couleur pour le fond du cadre.
  - Sélecteur de couleur pour le texte du cadre.

---

## 11. Architecture technique

### Composants
- `components/editor/QrFrameEditor.vue`

### Composables
- `composables/useQrProject.ts`

### Services
- `services/qr/frame-composer.service.ts` :
  - Méthode `composeCanvas(qrCanvas: HTMLCanvasElement, frame: QrFrameSettings, scale: number): HTMLCanvasElement`
  - Méthode `composeSvg(qrSvg: string, frame: QrFrameSettings): string`

### Types et données
- `QrFrameSettings`, `QrFrameType` définis dans `types/design.ts`.

### Dépendances
- API HTML5 Canvas 2D (`CanvasRenderingContext2D`).

---

## 12. Critères d'acceptation
- **CA-FRM-01 :** Étant donné un QR code généré, lorsque l'utilisateur sélectionne le style `bottom-badge` avec le texte *« SCAN ME »*, alors le canvas résultant intègre un cartouche inférieur élégant portant ce texte et la matrice centrale reste scannable par `jsQR`.
- **CA-FRM-02 :** Étant donné un export SVG demandé, alors le fichier vectoriel contient à la fois les chemins SVG du QR code et les balises `<rect>` et `<text>` du cadre avec les polices vectorisées ou déclarées proprement.

---

## 13. Stratégie de tests

### Cas nominaux
- Rendu de chacun des 5 styles de cadres et vérification de la hauteur totale du canevas composite.
- Test de scan sur mobile avec cadre actif : détection instantanée de la zone de données.

### Cas d'erreur
- Saisie d'une chaîne de 31 caractères : le champ tronque à 30 caractères et avertit l'utilisateur.

### Cas limites
- Texte avec caractères emoji : rendu propre sans artefact graphique.

### Non-régression
- Vérification que la sélection de `none` supprime intégralement le cadre et redonne au fichier ses dimensions carrées d'origine.

---

## 14. Exigences liées
- `FR-007`, `NFR-001`, `QA-001`.

---

## 15. Dépendances et risques
- **Risque :** Risque que le cadre rogne la zone de silence si les dimensions sont mal calculées.
- **Atténuation :** Marge intérieure inviolable codée en dur dans le `FrameComposerService`.

---

## 16. Documentation à mettre à jour
- `docs/04-modele-de-donnees.md`.

---

## 17. Questions ouvertes
- *Néant. L'architecture composite répond pleinement à la limite de `qr-code-styling` identifiée dans l'ADR-004.*
