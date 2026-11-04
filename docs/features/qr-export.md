# Spécification Fonctionnelle Détaillée : Moteur d'Export et Impression

> **Module :** `features/qr-export.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-008`, `FR-011`, `NFR-001`, `SEC-001`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Permettre le téléchargement immédiat et sans restriction du QR code généré sous plusieurs formats professionnels (vectoriel SVG pour l'imprimerie, matriciel PNG haute définition jusqu'à 4096 px, JPEG, WebP, et impression papier directe), ainsi que l'export de configuration au format JSON, le tout exécuté 100 % localement sans solliciter de serveur.

---

## 2. Périmètre

### Inclus
- **Export SVG :** Fichier vectoriel XML pur, redimensionnable à l'infini sans pixellisation, avec intégration des cadres et du logo vectoriel.
- **Export PNG :** Format matriciel supportant la transparence, avec choix de résolution :
  - Standard : 1024×1024 px.
  - Haute Définition (HD) : 2048×2048 px.
  - Ultra Haute Définition (UHD / Print) : 4096×4096 px.
- **Export JPEG :** Format compressé standard avec fond blanc opaque forcé si le fond initial était transparent.
- **Export WebP :** Format matriciel moderne hautement compressé via Canvas `toBlob('image/webp')`.
- **Module d'Impression :** Déclenchement de la boîte de dialogue native du navigateur (`window.print()`) avec styles CSS dédiés (`assets/css/print.css`).
- **Export JSON :** Fichier de configuration autonome permettant de restaurer ou transférer le projet.

### Exclus
- Filigrane publicitaire imposé sur l'image exportée.
- Limitation artificielle de la résolution obligeant à payer un compte premium.
- Envoi du fichier par e-mail via un serveur distant.

---

## 3. Utilisateur et cas d'utilisation
- **Graphiste / Imprimeur :** Télécharger le fichier SVG pour l'incorporer dans la maquette vectorielle d'une affiche 4×3 ou d'un roll-up événementiel.
- **Particulier :** Imprimer en 1 clic son QR code Wi-Fi sur sa feuille A4 pour l'aimanter sur son réfrigérateur.
- **Professionnel :** Sauvegarder la configuration JSON de son QR code pour pouvoir la modifier dans 6 mois sans devoir tout ressaisir.

---

## 4. Prérequis
- Rendu de la composition finalisé (matrice, logo, cadre).
- API Web `Blob`, `URL.createObjectURL` et attribut HTML5 `download` disponibles.

---

## 5. Parcours utilisateur
1. L'utilisateur clique sur le bouton primaire « Télécharger PNG » dans le panneau d'export.
2. Un menu lui permet de choisir sa résolution (défaut : 2048 px).
3. Le navigateur déclenche instantanément le téléchargement du fichier `qr-studio-url-mon-site.png`.
4. Pour une utilisation vectorielle, l'utilisateur clique sur « SVG » et récupère immédiatement le fichier `.svg`.

---

## 6. Comportement attendu
- Le fichier se télécharge sans ouvrir de nouvel onglet vide.
- Le nom du fichier est intelligible et déduit du contenu et du type (ex. : `qr-studio-wifi-bureau.png`, `qr-studio-vcard-jean-dupont.svg`).
- L'URL objet temporaire créée pour le téléchargement est immédiatement révoquée (`URL.revokeObjectURL`) après le clic pour libérer la mémoire vive du navigateur.

---

## 7. Règles métier
1. **Zéro filigrane :** Les fichiers exportés sont vierges de toute mention publicitaire ou logo intrusif de QR Studio.
2. **Gestion de la transparence JPEG :** Comme le format JPEG ne supporte pas le canal alpha, tout QR code configuré avec fond transparent voit son fond converti en blanc `#ffffff` lors de l'export JPEG pour éviter un rendu sur fond noir accidentel.
3. **Différenciation Export Image vs Export JSON :** L'export image produit un fichier graphique final non modifiable ; l'export JSON produit la recette technique permettant de recréer le projet.

---

## 8. Validations et erreurs
- Si le navigateur hôte ne supporte pas l'encodage direct en `image/webp` (cas de navigateurs très anciens), le service effectue un repli automatique (*fallback*) transparent vers le format PNG.
- En cas de mémoire insuffisante pour allouer un Canvas 4096×4096 px sur un smartphone très modeste, l'application propose automatiquement un export en 2048 px avec un message clair.

---

## 9. Cas limites
- **Export SVG avec logo bitmap (PNG/JPEG) :** L'image du logo est intégrée dans le SVG sous forme d'élément `<image href="data:image/png;base64,...">` autonome afin que le fichier SVG reste transportable sans dépendre de liens externes cassés.

---

## 10. Interface utilisateur
- Composant `QrExportPanel` :
  - Gros bouton d'action primaire : « Télécharger PNG (HD) » avec sélecteur de résolution (1024, 2048, 4096 px).
  - Rangée de boutons secondaires épurés : « SVG », « JPEG », « WebP », « Imprimer ».
  - Bouton discret : « Exporter la configuration JSON ».

---

## 11. Architecture technique

### Composants
- `components/qr/QrExportPanel.vue`

### Services
- `services/export/export.service.ts` : Fonctions `exportToSvg()`, `exportToPng()`, `exportToJpeg()`, `exportToWebp()`.
- `services/export/print.service.ts` : Orchestration de l'impression native.
- `utils/download.util.ts` : Fonction utilitaire pure créant l'élément `<a>` virtuel et gérant la révocation de l'URL objet.

### Types et données
- `ExportFormat`, `ExportOptions` dans `types/export.ts`.

---

## 12. Critères d'acceptation
- **CA-EXP-01 :** Étant donné un clic sur « Télécharger PNG (2048px) », alors un fichier PNG de dimensions exactes 2048×2048 px est téléchargé sur l'ordinateur en moins de 300 ms.
- **CA-EXP-02 :** Étant donné un export SVG, alors le fichier téléchargé s'ouvre proprement dans Illustrator/Inkscape et conserve ses propriétés vectorielles.

---

## 13. Stratégie de tests

### Cas nominaux
- Test Playwright automatisé téléchargeant un PNG et vérifiant la taille du buffer reçu (> 10 Ko).
- Test unitaire validant la génération de la balise XML pour l'export SVG.

### Cas d'erreur
- Simulation d'un refus de création de Blob Canvas : interception propre de l'erreur avec toast explicatif.

### Cas limites
- Export d'un QR code avec dégradé et fond transparent en SVG : contrôle de la présence des balises `<linearGradient>` et de l'absence de balise de fond opaque.

### Non-régression
- Vérification que le déclenchement de l'impression n'altère pas la disposition de l'écran principal.

---

## 14. Exigences liées
- `FR-008`, `FR-011`, `NFR-001`, `SEC-001`.

---

## 15. Dépendances et risques
- **Risque :** Téléchargement bloqué par certains navigateurs mobiles stricts.
- **Atténuation :** Utilisation du pattern standard `blob:` avec attribut `download` supporté universellement.

---

## 16. Documentation à mettre à jour
- `docs/04-modele-de-donnees.md`.

---

## 17. Questions ouvertes
- *Faut-il ajouter un export PDF mono-page en v1.0 ?* Non, le format SVG et l'impression native répondent déjà aux cas d'usage PAO et papier. L'export PDF sera évalué en v1.1.
