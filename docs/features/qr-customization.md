# Spécification Fonctionnelle Détaillée : Personnalisation Graphique et Styles

> **Module :** `features/qr-customization.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-005`, `NFR-001`, `QA-001`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Fournir aux utilisateurs des options avancées de personnalisation graphique (couleurs, dégradés, géométrie des modules et des yeux, fond transparent et correction d'erreur) pour produire des QR codes fidèles à leur identité de marque tout en garantissant un haut niveau de scannabilité.

---

## 2. Périmètre

### Inclus
- Couleurs de premier plan et d'arrière-plan (codes Hex, RGB, HSL).
- Dégradés linéaires et radiaux sur les modules et le fond avec angle et étapes de couleur.
- 6 formes de modules (dots) : `square`, `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`.
- 3 styles pour les yeux extérieurs (`square`, `extra-rounded`, `dot`).
- 2 styles pour les pupilles intérieures (`square`, `dot`).
- Fond transparent pour intégration sur des supports imprimés.
- Sélection manuelle du niveau de correction d'erreur (L, M, Q, H).
- Contrôle automatique du ratio de contraste (formule de luminance relative WCAG).

### Exclus
- Déformation 3D ou anamorphose du QR code (qui briserait la scannabilité).

---

## 3. Utilisateur et cas d'utilisation
- **Graphiste / Agence :** Adapter les couleurs du QR code à la charte graphique exacte d'un client et exporter un fichier transparent pour l'insérer sur une affiche publicitaire.
- **Particulier :** Créer un QR code aux couleurs chaleureuses avec des coins arrondis doux pour une invitation de mariage.

---

## 4. Prérequis
- Moteur `qr-code-styling` initialisé.
- Types `QrDesign` définis dans `types/design.ts`.

---

## 5. Parcours utilisateur
1. L'utilisateur clique sur l'onglet « Couleurs » dans `QrDesignTabs`.
2. Il choisit une couleur unie ou active l'option « Dégradé ».
3. L'aperçu du QR code se met à jour immédiatement.
4. Il bascule sur l'onglet « Formes » et sélectionne des modules arrondis.
5. L'indicateur de lisibilité confirme que le contraste reste optimal (> 4:1).

---

## 6. Comportement attendu
- Toute modification d'un curseur ou d'une couleur met à jour l'élément Canvas/SVG en moins de 100 ms grâce au debounce.
- Si le fond transparent est coché, la couleur de fond passe à `rgba(0,0,0,0)`. L'aperçu affiche un motif en damier transparent standard pour avertir l'utilisateur.

---

## 7. Règles métier
1. **Règle de contraste minimale :** Si le ratio de contraste calculé entre les modules et l'arrière-plan est inférieur à 4:1, un badge d'avertissement jaune apparaît (*« Attention : Contraste faible, risque d'échec au scan »*).
2. **Couleurs inversées (modules clairs sur fond sombre) :** Bien que supportées par certains scanners récents, les couleurs inversées provoquent l'échec de la majorité des applications photo natives. L'interface affiche une recommandation claire invitant à conserver des modules plus sombres que l'arrière-plan.
3. **Redondance par défaut :** Le niveau de correction par défaut est initialisé à `M` (15 %), offrant un compromis idéal entre densité visuelle et robustesse.

---

## 8. Validations et erreurs
- Les codes hexadécimaux saisis manuellement sont validés par regex (`^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$`).
- Si une valeur hexadécimale est incomplète pendant la frappe (ex. `#ff`), la dernière couleur valide est maintenue sans planter le moteur.

---

## 9. Cas limites
- **Deux couleurs de dégradé identiques :** Rendu équivalent à une couleur unie sans erreur.
- **Sélection d'un fond transparent avec modules blancs :** L'aperçu affiche les modules blancs sur un damier gris pour rester visible pendant l'édition, avec notification prévenant que le fichier final exigera un support d'impression sombre.

---

## 10. Interface utilisateur
- Composant `QrDesignTabs` organisant les réglages en sous-onglets :
  - `QrColorEditor` : Sélecteur de couleur, pipette native, bascule dégradé.
  - `QrShapeEditor` : Cartes cliquables affichant un aperçu visuel miniature de chaque forme.
  - `QrAdvancedSettings` : Sélecteur de correction d'erreur (L, M, Q, H) et réglage de marge.
- Jauge d'évaluation du contraste affichant le score numérique (ex. `12.5:1 - Excellent`).

---

## 11. Architecture technique

### Composants
- `components/editor/QrDesignTabs.vue`
- `components/editor/QrColorEditor.vue`
- `components/editor/QrShapeEditor.vue`
- `components/editor/QrAdvancedSettings.vue`

### Composables
- `composables/useQrCustomizer.ts`

### Services
- `services/qr/contrast-checker.service.ts` : Calcul de la luminance relative et du ratio de contraste.

### Types et données
- `types/design.ts` : `QrDesign`, `QrGradient`, `QrDotType`.

### Dépendances
- `qr-code-styling`.

---

## 12. Critères d'acceptation
- **CA-CUS-01 :** Étant donné un QR code de base, lorsque l'utilisateur applique un dégradé linéaire de `#1e3a8a` vers `#3b82f6`, alors le QR code affiche un dégradé fluide sur les modules.
- **CA-CUS-02 :** Étant donné une sélection de couleur jaune clair sur fond blanc (ratio < 2:1), alors l'alerte de contraste s'affiche immédiatement.

---

## 13. Stratégie de tests

### Cas nominaux
- Test unitaire du calcul de contraste : `#000000` sur `#ffffff` doit retourner `21:1`.
- Rendu de chacune des 6 formes de points et vérification de la scannabilité avec `jsQR`.

### Cas d'erreur
- Saisie d'une couleur hexadécimale invalide (`#zzzzzz`) : repli automatique vers la couleur précédente sans exception.

### Cas limites
- Test d'un niveau d'erreur `H` avec un texte long : vérification que la taille des modules ne devient pas microscopique.

### Non-régression
- Vérification que le changement de forme n'altère pas les couleurs sélectionnées.

---

## 14. Exigences liées
- `FR-005`, `NFR-001`, `QA-001`.

---

## 15. Dépendances et risques
- **Risque :** Forme de module `classy` parfois moins bien tolérée par les scanners d'ancienne génération sur smartphone d'entrée de gamme.
- **Atténuation :** Avertissement sur l'importance du banc de test physique avant impression en grande série.

---

## 16. Documentation à mettre à jour
- `docs/04-modele-de-donnees.md`.

---

## 17. Questions ouvertes
- *Néant. Les formes prises en charge correspondent strictement à celles vérifiées dans `qr-code-styling`.*
