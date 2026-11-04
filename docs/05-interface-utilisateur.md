# Spécifications de l'Interface Utilisateur (UX/UI) — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Ergonomie, hiérarchie visuelle, composants et comportements responsive  
> **Date :** 2026-10-27

---

## 1. Principes directeurs de conception UX/UI

1. **Clarté immédiate (Zéro apprentissage requis)** :  
   L'utilisateur doit comprendre en moins de 3 secondes comment saisir son contenu et récupérer son QR code.
2. **Retour d'information instantané (Live Feedback)** :  
   Chaque frappe au clavier ou changement de curseur de couleur actualise instantanément le QR code sans rechargement de page.
3. **Ergonomie bipartite sur grand écran (Split-Pane)** :  
   - **Panneau de configuration (Gauche)** : Saisie du contenu et onglets d'options graphiques.
   - **Panneau de prévisualisation et d'action (Droite)** : QR code fixé à l'écran (*sticky preview*) avec boutons de téléchargement immédiats.
4. **Accessibilité et inclusivité (WCAG 2.1 AA)** :  
   Contrastes visuels marqués, cibles tactiles de 44×44 px minimum, navigation clavier complète, labels vocalisables.

---

## 2. Structure et parcours par page

### 2.1. Page d'accueil (`/`)
- **Section Hero** : Titre fort (*« Créez vos QR codes professionnels en toute liberté. 100 % local, gratuit à vie. »*), badge de réassurance de confidentialité (*« Aucune donnée transmise à un serveur »*), CTA principal dirigeant vers `/create` et QR code interactif d'illustration.
- **Section Bénéfices clés** : 4 blocs iconographiques (Confidentialité absolue, Formats vectoriels SVG & HD, Sauvegarde locale, Zéro abonnement caché).
- **Section Cas d'usage & Guides populaires** : Liens directs vers les guides thématiques (Wi-Fi, Cartes de visite, Menus).
- **Pied de page éditorial** : Liens de navigation, mentions légales, politique de confidentialité, encart publicitaire horizontal discret.

### 2.2. Page Éditeur de QR Code (`/create`)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ AppHeader : Logo QR Studio | Projets sauvegardés (badge) | Thème N/B   │
├───────────────────────────────────┬────────────────────────────────────┤
│ PANNEAU GAUCHE : CONFIGURATION    │ PANNEAU DROITE : PRÉVISUALISATION  │
│                                   │ (Fixé au scroll sur Desktop)       │
│ 1. QrTypeSelector (10 icônes)     │ ┌────────────────────────────────┐ │
│ 2. QrContentForm (champs dynamiq.)│ │                                │ │
│                                   │ │          [QR CODE]             │ │
│ 3. Onglets de Style :             │ │         (Canvas/SVG)           │ │
│    [Couleurs] [Formes] [Logo]     │ │                                │ │
│    [Cadres]   [Avancé]            │ │       "SCANNEZ-MOI"            │ │
│                                   │ └────────────────────────────────┘ │
│    -> Éditeur spécifique actif    │ Contrôle lisibilité : [Bon 100%]   │
│                                   │                                    │
│ [Enregistrer Projet] [Reset]      │ QrExportPanel :                    │
│                                   │ [ Télécharger PNG (HD) ]           │
│                                   │ [ SVG ] [ JPEG ] [ Imprimer ]      │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 2.3. Page Gestionnaire de Projets (`/projects`)
- En-tête avec compteur de projets enregistrés dans IndexedDB et bouton « Tout exporter en JSON ».
- Grille responsive de cartes (`ProjectCard`) avec aperçu miniature, nom, date de dernière modification, badge du type de contenu (ex. `Wi-Fi`) et menu contextuel (Éditer, Dupliquer, Supprimer, Exporter JSON).
- État vide (`ProjectEmptyState`) avec illustration conviviale et bouton « Créer mon premier QR code ».

---

## 3. Spécifications détaillées des composants clés

### 3.1. `EditorHeader`
- **Rôle :** Barre de navigation supérieure de l'espace de travail.
- **Props :**
  - `projectName: string` (nom courant du projet, éditable en ligne par double-clic).
  - `isDirty: boolean` (indicateur de modifications non sauvegardées).
- **Événements :**
  - `@save` : Déclenche la sauvegarde dans IndexedDB.
  - `@rename(name: string)` : Met à jour le libellé du projet.
  - `@export-json` : Télécharge le fichier JSON autonome.
  - `@import-json` : Ouvre la modale d'import de projet.

### 3.2. `QrTypeSelector`
- **Rôle :** Grille horizontale scrollable ou en damier présentant les 10 types de contenus.
- **Props :**
  - `modelValue: QrContentType` (valeur active).
- **Événements :**
  - `@update:modelValue(type: QrContentType)`.
- **Accessibilité :** Balise `<fieldset>` avec `<legend class="sr-only">Type de QR code</legend>`, éléments de type bouton radio personnalisés (`role="radio"`).

### 3.3. `QrContentForm`
- **Rôle :** Conteneur dynamique affichant le sous-formulaire approprié (`FormUrl`, `FormWifi`, `FormVCard`, etc.).
- **Props :**
  - `content: QrContent` (objet typé du contenu courant).
- **Événements :**
  - `@update:content(content: QrContent)`.
- **Comportement :** Assure la validation Zod en temps réel et remonte les erreurs sous chaque champ.

### 3.4. `QrDesignTabs` & sous-éditeurs
- **`QrColorEditor`** :
  - Sélecteur de couleur unie ou dégradé (Linear / Radial).
  - Pipette native HTML5 (`<input type="color">`) + saisie hexadécimale directe.
  - Basculeur « Fond transparent ».
- **`QrShapeEditor`** :
  - Sélecteur visuel pour la forme des points (6 vignettes de prévisualisation : carré, rond, etc.).
  - Sélecteur de style pour les yeux (coins extérieurs) et les pupilles (coins intérieurs).
- **`QrLogoEditor`** :
  - Zone de glisser-déposer de fichier image (PNG, SVG, JPEG, WebP).
  - Aperçu miniature du logo actif avec bouton de suppression immédiat.
  - Curseurs (*sliders*) : Taille relative (15 % à 35 %) et Marge d'espacement (0 à 15 px).
  - Case à cocher : « Effacer les points sous le logo » (`hideBackgroundDots`).
- **`QrFrameEditor`** :
  - Grille de sélection des modèles de cadres (sans cadre, badge bas, badge haut, carte pleine).
  - Champ texte pour l'appel à l'action (limité à 30 caractères).
  - Sélecteur de couleur du fond de cadre et du texte.
- **`QrAdvancedSettings`** :
  - Sélection du niveau de correction d'erreur (L, M, Q, H) avec info-bulles explicatives.
  - Marge extérieure (*quiet zone* de 0 à 40 px).

### 3.5. `QrPreview`
- **Rôle :** Zone d'affichage haute fidélité du QR code composé.
- **Props :**
  - `project: QrProjectEntity` (données complètes de contenu, design et logo).
  - `loading: boolean` (état de rendu du moteur).
- **Responsabilité :**
  - Dessine le QR code dans un conteneur responsive à ratio 1:1.
  - Affiche une jauge de scannabilité indicative (calculée selon le contraste et le niveau d'erreur).
  - Fournit un bouton de zoom plein écran pour tester le scan direct depuis un smartphone.

### 3.6. `QrExportPanel`
- **Rôle :** Contrôles de téléchargement et d'impression.
- **Actions :**
  - Bouton primaire : « Télécharger PNG » (avec menu déroulant de résolution : 1024, 2048, 4096 px).
  - Boutons secondaires : « SVG (Vectoriel) », « JPEG », « WebP », « Imprimer ».
- **Feedback :** Animation de chargement sur le bouton pendant la compilation binaire (< 200 ms).

### 3.7. `AdSlot`
- **Rôle :** Encart publicitaire sécurisé et conforme.
- **Props :**
  - `slotId: string` (identifiant de l'emplacement AdSense).
  - `format: 'horizontal' | 'vertical' | 'rectangle'`.
- **Comportement :**
  - Réserve la hauteur et la largeur en CSS pour garantir un **CLS = 0**.
  - Si le script publicitaire ne charge pas ou si le consentement n'est pas accordé, l'espace se replie élégamment ou affiche un encart éditorial interne sans rupture visuelle.

---

## 4. Comportements responsive et expérience mobile

```text
Écran Large (> 1024 px) : Disposition côte-à-côte (Split-Screen)
┌─────────────────────────────────┬──────────────────────────────────┐
│  Formulaires & Styles (Scroll)  │  Aperçu fixe & Export (Sticky)   │
└─────────────────────────────────┴──────────────────────────────────┘

Écran Mobile (< 768 px) : Navigation par Onglets ou Empilement fluide
┌────────────────────────────────────────────────────────────────────┐
│ Onglets supérieurs : [ ✏️ Contenu & Style ]  [ 👁️ Aperçu & Export ]│
├────────────────────────────────────────────────────────────────────┤
│ (Onglet actif affiché en plein écran)                               │
├────────────────────────────────────────────────────────────────────┤
│ Barre d'action inférieure flottante :                              │
│ [Mini-vignette QR]  Nom du projet          [ Télécharger PNG ]     │
└────────────────────────────────────────────────────────────────────┘
```

- Sur mobile, la barre inférieure flottante (*bottom sheet / sticky action bar*) permet de télécharger le QR code d'un seul geste sans devoir scroller en bas d'une longue liste d'options.

---

## 5. États de l'interface et gestion des retours utilisateur

1. **États de chargement (*Skeleton Loaders*) :**  
   Pendant le démarrage du moteur côté client, un squelette gris pulsant aux dimensions exactes du QR code et des formulaires évite tout saut d'écran (*Cumulative Layout Shift*).
2. **Notifications Toast non bloquantes :**  
   - Succès de sauvegarde locale : *« Projet enregistré dans vos favoris »* (durée : 3 s).
   - Copie dans le presse-papier : *« Lien copié ! »*.
   - Erreur de fichier : *« Format d'image non supporté. Veuillez choisir un fichier PNG, SVG ou JPEG »*.
3. **Modale de confirmation de suppression :**  
   Pour éviter la perte accidentelle de données locales, toute suppression de projet exige un clic de confirmation explicite avec message d'avertissement rappelant l'absence de corbeille cloud.
