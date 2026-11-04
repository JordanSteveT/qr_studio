# Spécification Fonctionnelle Détaillée : Gestion et Incrustation de Logo

> **Module :** `features/qr-logo-management.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-006`, `SEC-002`, `QA-001`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Permettre à l'utilisateur d'importer une image de marque ou icône locale (formats PNG, SVG, JPEG, WebP) et de l'incruster harmonieusement au centre du QR code, tout en garantissant mathématiquement la scannabilité de la matrice grâce à l'ajustement automatique de la redondance d'erreur.

---

## 2. Périmètre

### Inclus
- Téléversement local par glisser-déposer ou sélection de fichier (taille max. 2 Mo).
- Contrôle de la taille relative du logo (ratio de 15 % à 35 % de la largeur du QR code).
- Contrôle de la marge blanche/transparente entourant le logo (0 à 15 px).
- Option d'élimination automatique des modules situés derrière le logo (`hideBackgroundDots: true`).
- Élévation automatique du niveau de correction d'erreur à `Q` (25 %) ou `H` (30 %).
- Persistance locale du fichier image sous forme de `Blob` binaire dans IndexedDB.
- Bouton de suppression et de remplacement immédiat du logo.

### Exclus
- Bibliothèque d'icônes propriétaires distantes nécessitant une connexion à une API tierce.
- Traitement d'images côté serveur.

---

## 3. Utilisateur et cas d'utilisation
- **Entreprise / Marque :** Insérer son logo corporate officiel au centre du QR code pour renforcer la crédibilité visuelle et rassurer le public avant le scan.
- **Créateur de contenu :** Ajouter l'icône officielle d'un réseau social (ex. Instagram, LinkedIn, YouTube) pour indiquer la destination du lien.

---

## 4. Prérequis
- Support de l'API HTML5 File et de `URL.createObjectURL` dans le navigateur client.

---

## 5. Parcours utilisateur
1. L'utilisateur se rend dans l'onglet « Logo » de l'éditeur.
2. Il glisse-dépose un fichier `logo.png` dans la zone de dépôt.
3. Le logo s'affiche instantanément au centre du QR code dans l'aperçu.
4. Une notification discrète signale : *« Niveau de correction d'erreur ajusté à Haute (Q) pour garantir la lisibilité »*.
5. L'utilisateur ajuste la taille du logo via un curseur intuitif (25 % par défaut).
6. S'il clique sur « Supprimer », le logo disparaît et le QR code revient à son état initial.

---

## 7. Règles métier
1. **Élévation obligatoire de la correction d'erreur :** Dès qu'un logo est activé, si le niveau de correction d'erreur était configuré sur `L` (7 %) ou `M` (15 %), le système le bascule automatiquement à `Q` (25 %) au minimum, ou `H` (30 %) si la taille du logo dépasse 30 % de la matrice.
2. **Plafond de dimension :** La taille du logo ne peut excéder 35 % de la surface totale de la matrice, seuil au-delà duquel la redondance mathématique Reed-Solomon est dépassée, rendant le scan impossible.
3. **Élimination des points sous-jacents :** Activée par défaut pour éviter que des modules ne transparaissent sous un logo à fond semi-transparent.

---

## 8. Validations et erreurs
- **Contrôle de taille :** Tout fichier excédant 2 Mo est immédiatement rejeté avec le message : *« Le logo est trop lourd (maximum 2 Mo). Veuillez le redimensionner »*.
- **Contrôle de format (Type MIME) :** Seuls les types `image/png`, `image/svg+xml`, `image/jpeg` et `image/webp` sont autorisés. Tout autre format (ex. PDF, GIF animé, exécutable) est bloqué.
- **Gestion des erreurs de décodage image :** Si le fichier est corrompu, une alerte toast prévient l'utilisateur et aucun état corrompu n'est persisté.

---

## 9. Cas limites
- **Logo SVG contenant du code malveillant :** L'image est isolée via un élément `<img src="blob:...">` ou dessinée sur un Canvas neutre. Interdiction stricte de l'injecter dans le DOM via `v-html`.
- **Image rectangulaire allongée (non carrée) :** Le moteur adapte le logo en conservant son ratio d'aspect (*aspect-ratio* préservé) centré dans la zone réservée.

---

## 10. Interface utilisateur
- Composant `QrLogoEditor` :
  - Zone de drop avec bordure en pointillés et icône d'import.
  - Prévisualisation miniature du logo avec nom du fichier et poids en Ko.
  - Boutons « Remplacer » et « Supprimer » (icône poubelle rouge).
  - Curseurs : « Taille du logo » (slider de 15 à 35 %) et « Marge » (slider de 0 à 15 px).
  - Interrupteur « Masquer les points sous le logo ».

---

## 11. Architecture technique

### Composants
- `components/editor/QrLogoEditor.vue`

### Composables
- `composables/useQrProject.ts` (état du logo et URL objet temporaire).

### Services
- `services/qr/qr-engine.service.ts` : Transmission des options `imageOptions` à `qr-code-styling`.

### Types et données
- `QrLogoSettings` dans `types/design.ts`.

### Dépendances
- `qr-code-styling`.

---

## 12. Critères d'acceptation
- **CA-LOG-01 :** Étant donné un fichier PNG de 150 Ko, lorsque l'utilisateur le dépose dans la zone de logo, alors l'image apparaît au centre du QR code et le niveau d'erreur passe automatiquement à `Q`.
- **CA-LOG-02 :** Étant donné un logo affiché, lorsque l'utilisateur clique sur « Supprimer », alors le logo est retiré de la matrice et la mémoire vive de l'URL objet est immédiatement libérée (`URL.revokeObjectURL`).

---

## 13. Stratégie de tests

### Cas nominaux
- Import d'un PNG, vérification de l'affichage centré et validation du scan via décodeur `jsQR`.

### Cas d'erreur
- Téléversement d'un fichier `.exe` ou `.txt` : rejet immédiat avec message d'erreur.
- Téléversement d'un fichier de 5 Mo : rejet immédiat pour dépassement de quota.

### Cas limites
- Téléversement d'un SVG avec des balises `<script>` : vérification que le script n'est pas exécuté dans le navigateur.

### Non-régression
- Vérification que la sauvegarde dans IndexedDB conserve correctement le logo sous forme de `Blob` lors du rechargement de la page.

---

## 14. Exigences liées
- `FR-006`, `SEC-002`, `QA-001`.

---

## 15. Dépendances et risques
- **Risque :** Baisse du taux de scannabilité si l'utilisateur choisit un logo trop grand combiné à un contraste faible.
- **Atténuation :** Plafonnement strict du ratio à 35 % et avertissement visuel en cas de risque de lecture.

---

## 16. Documentation à mettre à jour
- `docs/04-modele-de-donnees.md`.

---

## 17. Questions ouvertes
- *Faut-il proposer une galerie de logos prédéfinis (Wi-Fi, URL, Instagram) ?* Évolution planifiée pour la v1.1. En v1.0, l'import local direct est privilégié pour respecter l'indépendance de l'application.
