# Spécifications Fonctionnelles Générales — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Spécification exhaustive des exigences fonctionnelles du système  
> **Date :** 2026-10-27

---

## 1. Vue d'ensemble et nomenclature

Les spécifications ci-dessous définissent les fonctionnalités de l'application QR Studio. Chaque exigence est identifiée par un code unique `FR-xxx` (Functional Requirement) et dotée d'une priorité de mise en œuvre :
- **P0 (Critique / Must Have)** : Indispensable au fonctionnement minimal et au lancement de la v1.0.
- **P1 (Majeur / Should Have)** : Fonctionnalité clé à forte valeur ajoutée pour l'expérience utilisateur et le SEO.
- **P2 (Mineur / Nice to Have)** : Confort d'utilisation et optimisations avancées.

---

## 2. Référentiel des exigences fonctionnelles

---

### FR-001 : Création et initialisation d'un QR code
- **Priorité :** P0
- **Objectif :** Fournir immédiatement à l'utilisateur un QR code valide et fonctionnel dès son arrivée sur l'éditeur.
- **Acteurs :** Tout utilisateur.
- **Préconditions :** Navigateur supportant JavaScript et Canvas/SVG.
- **Parcours utilisateur :**
  1. L'utilisateur arrive sur la route `/create` (ou clique sur « Créer un QR code » depuis l'accueil).
  2. L'éditeur s'affiche avec un type de contenu par défaut (URL) et une valeur d'exemple pré-remplie (`https://qrstudio.app`).
  3. Le panneau de prévisualisation affiche instantanément le QR code correspondant.
- **Comportement attendu :** Aucune latence réseau. Le QR code est rendu en moins de 100 ms grâce au moteur local.
- **Validations :** Présence d'une chaîne de données non vide.
- **Erreurs possibles :** Échec d'initialisation du canvas si l'environnement est dépourvu d'API graphique (navigateur obsolète) -> Affichage d'un message d'incompatibilité clair.
- **Cas limites :** Utilisateur avec JavaScript désactivé -> Balise `<noscript>` informant de la nécessité de JavaScript pour la génération locale.
- **Critères d'acceptation :**
  - *Étant donné* un utilisateur qui charge la page de création pour la première fois,
  - *Lorsque* la page termine son rendu client,
  - *Alors* un QR code d'exemple est visible et immédiatement scannable.
- **Exigences non fonctionnelles liées :** `NFR-001` (Performance de rendu < 150 ms).

---

### FR-002 : Sélection du type de contenu
- **Priorité :** P0
- **Objectif :** Permettre de basculer intuitivement entre 10 types de contenus structurés.
- **Acteurs :** Tout utilisateur.
- **Préconditions :** Éditeur initialisé.
- **Types pris en charge :**
  1. URL de site web (`URL`)
  2. Texte libre (`TEXT`)
  3. Réseau Wi-Fi (`WIFI`)
  4. Fiche contact (`VCARD`)
  5. E-mail pré-rempli (`EMAIL`)
  6. SMS pré-rempli (`SMS`)
  7. Appel téléphonique (`PHONE`)
  8. Coordonnées géographiques GPS (`GEO`)
  9. Événement calendrier (`EVENT`)
  10. Données personnalisées brutes (`CUSTOM`)
- **Parcours utilisateur :**
  1. L'utilisateur clique sur l'icône ou le bouton correspondant au type souhaité dans `QrTypeSelector`.
  2. Le formulaire de saisie `QrContentForm` s'adapte dynamiquement pour afficher les champs requis.
  3. L'aperçu du QR code se met à jour immédiatement avec les valeurs par défaut du type sélectionné.
- **Comportement attendu :** Les options de personnalisation graphique (couleurs, formes) sont conservées lors du changement de type.
- **Critères d'acceptation :**
  - *Étant donné* un utilisateur sur le formulaire URL,
  - *Lorsque* l'utilisateur clique sur « Wi-Fi »,
  - *Alors* les champs SSID et Mot de passe apparaissent et le QR code encode le format Wi-Fi standard.

---

### FR-003 : Saisie et validation des données de contenu
- **Priorité :** P0
- **Objectif :** Garantir que les données saisies respectent les normes industrielles de sérialisation avant encodage.
- **Acteurs :** Tout utilisateur.
- **Préconditions :** Un type de contenu sélectionné.
- **Comportement attendu :**
  - Validation réactive en temps réel (débounced à 150 ms) via des schémas **Zod**.
  - Si les données sont valides, la chaîne encodée est transmise au moteur QR.
  - Si une donnée est invalide, un message d'erreur contextuel sous le champ informe l'utilisateur (ex. : *« URL invalide (doit commencer par http:// ou https://) »*).
  - L'aperçu conserve la dernière version valide ou affiche un état d'avertissement visuel sans planter l'interface.
- **Cas limites :** Caractères spéciaux, émoticônes, accents, caractères d'échappement (`;`, `:`, `\`, etc.) dans les champs Wi-Fi et vCard.
- **Critères d'acceptation :**
  - *Étant donné* un champ URL avec `http://`,
  - *Lorsque* l'utilisateur saisit un espace ou une chaîne invalide,
  - *Alors* le champ passe en état d'erreur et le message explicatif est affiché.

---

### FR-004 : Prévisualisation interactive en temps réel
- **Priorité :** P0
- **Objectif :** Offrir un retour visuel instantané et fidèle du QR code au fil des modifications.
- **Acteurs :** Tout utilisateur.
- **Préconditions :** Éditeur actif.
- **Comportement attendu :**
  - La prévisualisation s'ajuste immédiatement à chaque modification de couleur, de forme, de logo ou de texte de cadre.
  - L'aperçu est affiché sur un fond contrasté avec indication visuelle de la zone de silence (*quiet zone*).
  - Bouton interactif « Tester la lisibilité » simulant la densité d'information.
- **Critères d'acceptation :**
  - Tout changement de paramètre graphique dans le panneau gauche met à jour l'aperçu du panneau droit en moins de 100 ms.

---

### FR-005 : Personnalisation graphique avancée
- **Priorité :** P0
- **Objectif :** Rendre le QR code esthétique et adapté à la charte graphique de l'utilisateur.
- **Options disponibles :**
  - **Couleur des modules (dots) :** Couleur unie (Hex/RGB/HSL) ou dégradé (linéaire ou radial avec angle et deux couleurs d'étape).
  - **Arrière-plan :** Couleur unie, dégradé ou option transparente (fond transparent pour export SVG/PNG).
  - **Forme des modules :** `square` (carré standard), `dots` (ronds), `rounded` (arrondi doux), `extra-rounded`, `classy`, `classy-rounded`.
  - **Forme des yeux (coins extérieurs) :** `square`, `extra-rounded`, `dot`.
  - **Forme de la pupille (coins intérieurs) :** `square`, `dot`.
  - **Niveau de correction d'erreur :** L (~7 %), M (~15 %), Q (~25 %), H (~30 %).
- **Règles métier :**
  - Si un fond transparent est sélectionné, l'application avertit l'utilisateur des risques d'illisibilité sur fond sombre.
  - Alerte de contraste : si le contraste entre la couleur des modules et le fond est inférieur à 4:1, un indicateur visuel signale un risque potentiel de non-scannabilité.

---

### FR-006 : Ajout et gestion de logo central
- **Priorité :** P1
- **Objectif :** Permettre l'incrustation d'un logo de marque au centre du QR code.
- **Acteurs :** Professionnels, créateurs.
- **Préconditions :** Fichier image valide disponible (PNG, SVG, JPEG, WebP).
- **Comportement attendu :**
  - Téléversement local par glisser-déposer ou sélection de fichier (taille max. : 2 Mo).
  - Ajustement du ratio de taille du logo (entre 15 % et 35 % de la taille du QR code).
  - Ajustement de la marge autour du logo (de 0 à 15 px).
  - Suppression ou remplacement du logo en 1 clic.
  - Option d'élimination des points sous-jacents (`hideBackgroundDots: true`).
  - **Règle métier obligatoire :** Dès qu'un logo est activé, le niveau de correction d'erreur est automatiquement ajusté au minimum à `Q` (25 %) ou `H` (30 %) pour garantir la redondance et la scannabilité.

---

### FR-007 : Cadres décoratifs avec texte (Call-to-Action)
- **Priorité :** P1
- **Objectif :** Entourer le QR code d'un cadre incitatif pour maximiser le taux de scan.
- **Options de cadres :**
  - `none` : Pas de cadre (matrice brute).
  - `bottom-badge` : Cadre classique avec cartouche de texte sous le QR code (ex. : « SCAN ME »).
  - `top-badge` : Cartouche de texte au-dessus du QR code.
  - `full-card` : Carte élégante avec en-tête et pied de page.
  - `speech-bubble` : Bulle de dialogue stylisée.
- **Comportement attendu :**
  - Champ de saisie pour personnaliser le libellé (limité à 30 caractères pour éviter les débordements).
  - Sélection de la couleur du cadre et de la couleur du texte.
  - Le cadre est dessiné dynamiquement autour du QR code via un wrapper Canvas/SVG local lors de la prévisualisation et de l'export.

---

### FR-008 : Export multiformat haute résolution
- **Priorité :** P0
- **Objectif :** Télécharger le QR code généré dans un format adapté à l'usage web ou imprimé.
- **Formats supportés :**
  - **SVG :** Fichier vectoriel pur, sans perte de résolution, idéal pour graphistes et imprimeurs.
  - **PNG :** Format matriciel avec gestion de la transparence, dimensions configurables (512×512, 1024×1024, 2048×2048, 4096×4096 px).
  - **JPEG :** Format matriciel avec fond opaque blanc forcé si le fond était transparent.
  - **WebP :** Format matriciel compressé moderne.
  - **Impression :** Déclenchement de la boîte de dialogue d'impression native du navigateur avec mise en page CSS dédiée (feuille A4 centrée, fond blanc, informations masquées).
- **Comportement attendu :**
  - Génération immédiate d'un Blob local et déclenchement d'un téléchargement direct via `<a>` virtuel (`download` attribute).
  - Nom de fichier explicite généré automatiquement (ex. : `qr-studio-wifi-monreseau.png`).
  - Zéro requête réseau lors de l'export.

---

### FR-009 : Enregistrement local des projets (IndexedDB)
- **Priorité :** P1
- **Objectif :** Permettre à l'utilisateur de sauvegarder ses créations pour y revenir ultérieurement sans créer de compte.
- **Acteurs :** Utilisateur récurrent.
- **Comportement attendu :**
  - Bouton « Enregistrer le projet » dans l'éditeur.
  - Saisie d'un nom de projet (par défaut : type de contenu + date).
  - Stockage dans **IndexedDB** via Dexie.js comprenant : identifiant unique (UUID), nom, date de création, date de mise à jour, configuration de contenu, design graphique, et Blob du logo le cas échéant.
  - Génération et stockage d'une vignette miniature en basse résolution (DataURL PNG 128×128 px) pour l'affichage rapide dans la liste.

---

### FR-010 : Gestion des projets sauvegardés (Liste, Ouverture, Suppression, Duplication)
- **Priorité :** P1
- **Objectif :** Administrer ses créations sauvegardées depuis une page dédiée `/projects`.
- **Comportement attendu :**
  - Grille réactive des projets avec vignettes, titres, dates et type de contenu.
  - Action « Ouvrir dans l'éditeur » : charge l'intégralité du projet sans perte.
  - Action « Dupliquer » : crée une copie indépendante.
  - Action « Supprimer » : demande une confirmation explicite avant suppression définitive d'IndexedDB.
  - Action globale « Tout effacer » : vide l'intégralité de la base locale avec double confirmation.

---

### FR-011 : Import et Export de configuration au format JSON
- **Priorité :** P1
- **Objectif :** Permettre le transfert d'un projet d'un appareil à un autre ou la sauvegarde externe sans cloud.
- **Comportement attendu :**
  - **Export JSON :** Télécharge un fichier `.json` structuré contenant le schéma de version, la configuration complète de contenu et de design (logo encodé en Base64).
  - **Import JSON :** Permet de téléverser un fichier `.json`. Le fichier est rigoureusement validé par un schéma Zod (`projectSchema`). En cas de conformité, l'éditeur se charge avec les réglages importés. En cas de format invalide, un message d'erreur explicite est renvoyé.

---

### FR-012 : Navigation et architecture de l'information
- **Priorité :** P0
- **Objectif :** Assurer une circulation fluide entre les différentes pages de l'application.
- **Structure des pages :**
  - `/` : Accueil, proposition de valeur, aperçu de l'outil et raccourcis de création.
  - `/create` : Éditeur complet de QR code.
  - `/projects` : Gestionnaire des projets sauvegardés localement.
  - `/guides` : Hub des guides d'utilisation et cas d'usage.
  - `/guides/qr-code-url` : Guide création QR code URL.
  - `/guides/qr-code-wifi` : Guide QR code Wi-Fi sécurisé.
  - `/guides/qr-code-contact` : Guide vCard et cartes de visite.
  - `/guides/qr-code-menu` : Guide QR code pour restaurants et menus.
  - `/about` : À propos de QR Studio et philosophie du projet.
  - `/privacy` : Politique de confidentialité claire (engagement 100 % local).
  - `/legal` : Mentions légales.
  - `/contact` : Page d'information et contact d'assistance.

---

### FR-013 : Affichage publicitaire non intrusif (Monétisation)
- **Priorité :** P1
- **Objectif :** Générer des revenus publicitaires sans dégrader l'expérience utilisateur ni bloquer l'usage.
- **Emplacements autorisés :**
  - Bannière horizontale au-dessus du pied de page.
  - Encart vertical latéral droit sur grand écran (desktop) hors zone d'action.
  - Encart contextuel au sein des pages guides SEO.
- **Interdictions strictes :**
  - Aucun interstitiel bloquant.
  - Pas de pop-up publicitaire lors du clic sur « Télécharger ».
  - Pas d'encart placé entre l'aperçu du QR code et les options de réglage.
- **Dégradation gracieuse :** Si l'encart ne peut être chargé (adblocker, pas de consentement ou pas de réseau), l'espace réservé est masqué sans décalage de mise en page.

---

### FR-014 : Hub éditorial et guides thématiques SEO
- **Priorité :** P1
- **Objectif :** Capter un trafic organique qualifié grâce à des contenus pédagogiques riches et bien indexés.
- **Comportement attendu :**
  - Chaque guide propose des explications pas-à-pas, des conseils d'impression, des pièges à éviter et un bouton d'action directe vers l'éditeur pré-configuré (ex. : clic sur « Créer mon QR Wi-Fi » redirige vers `/create?type=wifi`).
  - Pages pré-rendues statiquement lors de la génération avec métadonnées OpenGraph et schéma JSON-LD `HowTo` ou `Article`.

---

### FR-015 : Gestion des erreurs et résilience applicative
- **Priorité :** P0
- **Objectif :** Éviter tout plantage global de l'interface et guider l'utilisateur en cas de fausse manipulation.
- **Comportement attendu :**
  - Erreurs de formulaire signalées en ligne, sans modale bloquante.
  - Gestion des limites de quota de stockage navigateur (quota IndexedDB dépassé) : message d'avertissement invitant à exporter ses projets en JSON ou à supprimer des anciens projets.
  - Erreurs de lecture de fichier image (fichier corrompu ou format non supporté) : rejet propre avec notification toast explicative.

---

### FR-016 : Expérience adaptative et responsive mobile / tablette
- **Priorité :** P0
- **Objectif :** Offrir une ergonomie sans faille sur smartphone, tablette et écran large.
- **Comportement sur écran étroit (< 768 px) :**
  - L'affichage se fait en disposition verticale ou par onglets clairs : Onglet 1 « Contenu & Design », Onglet 2 « Aperçu & Export ».
  - Une barre d'action inférieure flottante affiche une mini-vignette du QR code et un accès rapide au téléchargement.
  - Les cibles tactiles respectent les normes d'accessibilité (minimum 44×44 px).

---

### FR-017 : Accessibilité et conformité numérique (a11y)
- **Priorité :** P1
- **Objectif :** Rendre l'application utilisable par tous, y compris les personnes utilisant un lecteur d'écran ou naviguant au clavier.
- **Règles :**
  - Tous les champs de saisie sont liés à un `<label>` explicite.
  - Les boutons d'icônes disposent d'un attribut `aria-label`.
  - La zone d'aperçu du QR code dispose d'un texte alternatif dynamique (ex. : `alt="Aperçu du QR code encodant l'URL https://example.com"`).
  - Navigation complète au clavier (tabulation visible, raccourcis non conflictuels).
  - Contraste des textes de l'interface conforme aux critères WCAG 2.1 AA.
