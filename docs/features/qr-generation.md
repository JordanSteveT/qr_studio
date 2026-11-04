# Spécification Fonctionnelle Détaillée : Moteur de Génération QR

> **Module :** `features/qr-generation.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-001`, `FR-004`, `NFR-001`, `SEC-001`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Permettre la conversion instantanée, réactive et 100 % locale d'une chaîne de données structurée en une matrice géométrique QR code bidimensionnelle (norme ISO/IEC 18004), avec prévisualisation en temps réel dans le navigateur de l'utilisateur.

---

## 2. Périmètre

### Inclus
- Initialisation immédiate du moteur au chargement de l'éditeur avec un contenu par défaut valide.
- Mise à jour réactive dès la modification de la chaîne source ou des paramètres de style.
- Gestion du délai de debounce (100 à 150 ms) pour garantir une frappe fluide sans gel du thread principal.
- Calcul automatique de la version de matrice nécessaire (typeNumber de 0 pour adaptation dynamique selon la taille des données).
- Émission du rendu sous forme d'élément Canvas ou SVG directement exploitable par l'interface.

### Exclus
- Redirection ou appel à une API distante de génération (ex. Google Chart API).
- Génération côté serveur (SSR Node.js).
- Génération par lot (batch CSV).

---

## 3. Utilisateur et cas d'utilisation
- **Utilisateur :** Tout utilisateur saisissant du texte ou des coordonnées dans l'éditeur.
- **Cas d'utilisation :** Visualiser immédiatement le rendu visuel de son QR code dès la première frappe pour s'assurer que la densité des points reste harmonieuse et lisible.

---

## 4. Prérequis
- Navigateur web moderne prenant en charge l'élément HTML5 Canvas et/ou SVG.
- Initialisation du cycle de vie client (`mounted` ou composant encapsulé dans `<ClientOnly>`).

---

## 5. Parcours utilisateur
1. L'utilisateur ouvre la page `/create`.
2. Le moteur instancie une matrice par défaut encodant l'URL d'exemple.
3. L'utilisateur modifie une lettre dans le champ texte.
4. Le debounce absorbe la frappe rapide.
5. Après 100 ms d'inactivité de frappe, la matrice se redessine instantanément.

---

## 6. Comportement attendu
- Le temps de régénération de la matrice ne doit pas excéder 100 ms sur un ordinateur portable ou smartphone standard.
- Le moteur gère la transition sans clignotement blanc grâce à un canvas double tampon (offscreen rendering) ou mise à jour directe du DOM SVG.

---

## 7. Règles métier
1. **Zéro fuite :** Aucune donnée encodée ne doit faire l'objet d'une requête HTTP vers un serveur distant.
2. **Dimensionnement automatique :** Si le volume de données augmente, la version de matrice QR (de 1 à 40) doit s'adapter automatiquement (`typeNumber: 0`).
3. **Maintien de la correction d'erreur minimale :** Le niveau de redondance ne doit jamais descendre sous `L` (7 %).

---

## 8. Validations et erreurs
- Si la chaîne de données est vide, le moteur affiche un état d'attente neutre dans le conteneur d'aperçu sans déclencher d'exception JavaScript.
- Si le volume de données dépasse la capacité maximale théorique d'un QR code Version 40 (environ 7089 caractères numériques ou 2953 octets binaires), une erreur de dépassement de capacité est interceptée et signalée à l'utilisateur.

---

## 9. Cas limites
- **Chaîne avec caractères unicodes complexes (émojis, alphabet cyrillique, kanji) :** Encodage obligatoire en mode UTF-8 (Byte Mode) pour éviter toute corruption des caractères.
- **Environnement sans support Canvas :** Affichage d'un message accessible informant que le navigateur doit être mis à jour.

---

## 10. Interface utilisateur
- Le composant `QrPreview` fournit un conteneur carré (ratio 1:1) centré dans le panneau droit.
- Un indicateur visuel de calcul (léger flou ou spinner discret) s'active si le recalcul dépasse exceptionnellement 150 ms.

---

## 11. Architecture technique

### Composants
- `components/qr/QrPreview.vue` : Affiche l'aperçu et gère le conteneur responsive.
- `components/qr/QrPreviewCanvas.vue` : Nœud de montage DOM effectif côté client.

### Composables
- `composables/useQrEngine.ts` : Expose l'état de l'instance du moteur, déclenche le debounce et orchestre les mises à jour.

### Services
- `services/qr/qr-engine.service.ts` : Façade isolant la bibliothèque `qr-code-styling`.

### Types et données
- `QrEngineOptions` : Options d'initialisation du moteur (données, dimensions, niveau de correction, marge).

### Dépendances
- `qr-code-styling` (instanciation dynamique côté client).

---

## 12. Critères d'acceptation
- **CA-GEN-01 :** Étant donné un utilisateur accédant à l'éditeur, lorsque la page termine son rendu client, alors un QR code fonctionnel et scannable est visible en moins de 500 ms au premier chargement.
- **CA-GEN-02 :** Étant donné un texte saisi de 500 caractères, lorsque l'utilisateur cesse de taper, alors la matrice se met à jour en moins de 100 ms sans saut visuel.

---

## 13. Stratégie de tests

### Cas nominaux
- Instanciation d'un QR code avec l'URL `https://qrstudio.app` et vérification que l'élément SVG/Canvas est créé dans le DOM.

### Cas d'erreur
- Passage d'une chaîne vide : vérification que l'application ne lève pas d'exception non gérée.

### Cas limites
- Encodage d'un texte de 2000 caractères contenant des émojis (`🚀🎉`) : décodage via `jsQR` pour s'assurer que les caractères sont restitués sans altération.

### Non-régression
- Vérification que la commande `npm run generate` pré-rend la page sans déclencher d'erreur `document is not defined`.

---

## 14. Exigences liées
- `FR-001`, `FR-004`, `NFR-001`, `SEC-001`.

---

## 15. Dépendances et risques
- **Risque :** Régression de compatibilité si `qr-code-styling` tente d'accéder au DOM lors du pré-rendu SSG.
- **Atténuation :** Wrapper strict avec vérification de `process.client` et importation dynamique.

---

## 16. Documentation à mettre à jour
- `docs/03-architecture-technique.md` en cas de changement de façade de moteur.

---

## 17. Questions ouvertes
- *Néant. Le comportement du moteur est validé conformément à l'ADR-004.*
