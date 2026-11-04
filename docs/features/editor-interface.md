# Spécification Fonctionnelle Détaillée : Interface et Ergonomie de l'Éditeur

> **Module :** `features/editor-interface.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-001`, `FR-016`, `FR-017`, `NFR-001`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Définir l'ergonomie, la hiérarchie visuelle, la disposition réactive (*split-pane* desktop / onglets et barre d'action mobile) et les interactions interactives au sein de la page principale de création `/create`.

---

## 2. Périmètre

### Inclus
- Agencement bipartite (Panneau de configuration à gauche / Prévisualisation et export fixés à droite).
- Adaptation sur écran mobile (< 768 px) via bascule d'onglets et barre d'action inférieure flottante.
- Squelettes de chargement (skeleton loaders) pendant la phase d'hydratation côté client.
- Raccourcis clavier ergonomiques (ex. `Ctrl + S` pour enregistrer le projet).
- Accessibilité conforme aux critères WCAG 2.1 AA.

### Exclus
- Éditeur de code matriciel binaire manuel (modification pixel par pixel).

---

## 3. Utilisateur et cas d'utilisation
- **Utilisateur Desktop :** Travailler avec une vision continue du QR code pendant qu'il ajuste ses couleurs et ses textes à gauche.
- **Utilisateur Smartphone :** Saisir rapidement ses données sans être gêné par un clavier virtuel qui masquerait les boutons d'action.

---

## 4. Prérequis
- Initialisation des composants Nuxt et CSS de mise en page réactive.

---

## 5. Parcours utilisateur
1. L'utilisateur ouvre `/create`.
2. Un squelette visuel s'affiche brièvement (moins de 200 ms) avant le montage du moteur.
3. L'utilisateur renseigne ses informations dans le panneau gauche.
4. L'aperçu à droite réagit immédiatement.
5. Sur mobile, une barre d'action inférieure reste accessible pour télécharger le QR code d'un simple geste sans faire défiler toute la page.

---

## 6. Comportement attendu
- **Fluidité de défilement :** Le panneau gauche défile indépendamment tandis que le panneau droit reste collé à l'écran (*sticky position*) sur les résolutions supérieures à 1024 px.
- **Indicateur de modifications :** Un point coloré ou badge indique les modifications en cours non encore enregistrées dans la base locale.

---

## 7. Règles métier
1. **Priorité visuelle du QR code :** La prévisualisation du QR code ne doit jamais être reléguée hors du champ de vision sur grand écran.
2. **Gestion du clavier mobile :** Lors de l'ouverture du clavier virtuel sur mobile, la barre d'action inférieure ne doit pas masquer les champs de saisie actifs (utilisation de l'API `visualViewport`).

---

## 8. Validations et erreurs
- En cas d'erreur de saisie dans le formulaire, le focus est placé de manière accessible sur le premier champ invalide avec description de l'erreur via `aria-describedby`.

---

## 9. Cas limites
- **Écrans ultra-larges (4K / 3840 px) :** Le contenu reste contenu dans un conteneur maximal centré (`max-width: 1440px`) pour éviter que les panneaux ne soient trop éloignés l'un de l'autre.

---

## 10. Interface utilisateur
- `EditorHeader` en haut de page.
- Panneau gauche composé de `QrTypeSelector`, `QrContentForm`, `QrDesignTabs`.
- Panneau droit composé de `QrPreview`, jauge de contraste et `QrExportPanel`.
- Modale de zoom plein écran pour tester le scan direct d'écran à écran avec un second appareil.

---

## 11. Architecture technique

### Composants
- `pages/create.vue`
- `components/editor/EditorHeader.vue`
- `components/editor/QrTypeSelector.vue`
- `components/editor/QrContentForm.vue`
- `components/editor/QrDesignTabs.vue`
- `components/qr/QrPreview.vue`
- `components/qr/QrExportPanel.vue`

### Composables
- `useQrProject.ts`, `useResponsive.ts`.

---

## 12. Critères d'acceptation
- **CA-UI-01 :** Étant donné un écran d'une largeur supérieure à 1024 px, lorsque l'utilisateur fait défiler le panneau gauche des réglages, alors le panneau droit d'aperçu reste visible et fixe à l'écran.
- **CA-UI-02 :** Étant donné un utilisateur naviguant au clavier, alors chaque bouton, sélecteur et champ est accessible via la touche `Tab` avec un contour de focus contrasté visible.

---

## 13. Stratégie de tests

### Cas nominaux
- Test de rendu de l'éditeur sur résolutions 375 px (mobile), 768 px (tablette) et 1440 px (desktop).

### Cas d'erreur
- Vérification de l'affichage du squelette de chargement en simulant un délai d'hydratation.

### Cas limites
- Test du raccourci clavier `Ctrl + S` : vérification que la boîte de dialogue d'enregistrement s'ouvre sans déclencher l'enregistrement de page natif du navigateur.

### Non-régression
- Audit automatisé d'accessibilité avec `axe-core` ne retournant aucune violation critique.

---

## 14. Exigences liées
- `FR-001`, `FR-016`, `FR-017`, `NFR-001`.

---

## 15. Dépendances et risques
- **Risque :** Sauts d'affichage (*layout shifts*) lors de l'apparition des messages d'erreur.
- **Atténuation :** Réservation d'espace minimale sous les champs de saisie pour préserver un CLS = 0.

---

## 16. Documentation à mettre à jour
- `docs/05-interface-utilisateur.md`.

---

## 17. Questions ouvertes
- *Faut-il intégrer un mode plein écran immersif pour l'éditeur ?* Évalué pour une version ultérieure. La disposition actuelle répond déjà à l'ensemble des besoins ergonomiques.
