# Glossaire Terminologique — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Définitions techniques et métier partagées par toute l'équipe et les agents IA  
> **Date :** 2026-10-27

---

## 1. Concepts liés aux QR Codes et à la Géométrie

### QR Code Statique
Code-barres bidimensionnel matriciel (norme ISO/IEC 18004) dans lequel l'information finale (URL, clé Wi-Fi, coordonnées vCard, texte) est directement encodée dans la disposition des modules noirs et blancs. **Conséquence :** Il fonctionne de manière permanente, sans dépendre d'un serveur tiers, et ne peut pas être modifié une fois imprimé. C'est l'unique type de QR code produit par QR Studio.

### QR Code Dynamique
QR code qui n'encode pas la donnée finale, mais une URL courte intermédiaire (redirection) contrôlée par un serveur distant. Si l'abonnement auprès du fournisseur expire ou si le serveur tombe en panne, le QR code cesse immédiatement de fonctionner. Formellement exclu du périmètre initial de QR Studio.

### Niveau de Correction d'Erreur (Reed-Solomon)
Mécanisme mathématique permettant à un scanner de reconstituer l'information encodée même si une partie du QR code est masquée, tachée, déchirée ou recouverte par un logo :
- **L (Low) :** Restaure environ 7 % des données perdues.
- **M (Medium) :** Restaure environ 15 % des données.
- **Q (Quartile) :** Restaure environ 25 % des données.
- **H (High) :** Restaure environ 30 % des données (recommandé lors de l'incrustation d'un logo central).

### Zone de Silence (*Quiet Zone*)
Marge vierge obligatoire entourant les quatre côtés du QR code. Elle permet aux algorithmes de vision des scanners de distinguer la matrice du reste du support d'impression ou de l'arrière-plan. Sa taille minimale standard est de 4 modules.

### Modules
Les points ou carrés élémentaires individuels composant la grille du QR code.

### Yeux / Motifs de Localisation (*Finder Patterns*)
Les trois grands carrés concentriques situés dans les coins supérieur gauche, supérieur droit et inférieur gauche du QR code. Ils permettent au scanner de détecter l'orientation et l'inclinaison de l'image.

---

## 2. Formats de Données et Sérialisation

### vCard
Standard informatique (RFC 2426 / RFC 6350) pour l'échange électronique de coordonnées personnelles et professionnelles (nom, entreprise, téléphones, e-mail, adresse postale, fonction). Lorsqu'un smartphone scanne une vCard, il propose d'ajouter automatiquement le contact dans son carnet d'adresses.

### Chaîne Wi-Fi Standard
Format textuel standardisé (ex. `WIFI:S:MonReseau;T:WPA;P:MonMotDePasse;;`) interprété nativement par les systèmes iOS et Android pour configurer et connecter automatiquement l'appareil au réseau sans fil.

### iCalendar (VEVENT)
Standard de calendrier (RFC 5545) permettant d'encoder un événement avec date de début, date de fin, titre et localisation.

---

## 3. Technologies Web et Architecture

### SSG (Static Site Generation)
Méthode de compilation web où l'ensemble des pages HTML, feuilles de style et scripts JavaScript sont générés à l'avance lors du build. Les fichiers résultants sont servis de manière statique par un CDN, éliminant tout besoin de serveur d'application en production.

### SSR (Server-Side Rendering)
Rendu des composants sur un serveur Node.js à chaque requête utilisateur. Non utilisé en production dans QR Studio pour préserver l'indépendance vis-à-vis des serveurs.

### Hydratation
Processus par lequel le moteur JavaScript Vue.js s'attache à une structure HTML statique déjà présente dans le navigateur pour la rendre interactive et réactive.

### IndexedDB
Base de données transactionnelle orientée objet intégrée dans les navigateurs web modernes. Elle permet de stocker localement d'importants volumes de données structurées et de fichiers binaires (`Blob`) sans bloquer le thread principal.

### localStorage
Mécanisme de stockage clé/valeur synchrone du navigateur, limité à environ 5 Mo de texte. Réservé dans QR Studio aux simples préférences d'affichage (thème sombre, dernier filtre).

### Blob (Binary Large Object)
Objet JavaScript représentant des données brutes immuables de type fichier (ex. une image PNG compilée en mémoire vive).

### URL Objet (`URL.createObjectURL`)
Identifiant URI temporaire généré en mémoire (`blob:http://...`) pointant vers un `Blob`. Doit être libéré manuellement via `URL.revokeObjectURL()` pour prévenir les fuites de mémoire.

### Débounce (*Debouncing*)
Technique de programmation consistant à reporter l'exécution d'un calcul coûteux (ex. régénération de la matrice QR) jusqu'à ce qu'un délai d'inactivité déterminé (ex. 100 ms) se soit écoulé depuis la dernière frappe de l'utilisateur.

---

## 4. Référencement et Monétisation

### SEO (Search Engine Optimization)
Ensemble des techniques d'optimisation technique, sémantique et de maillage interne visant à positionner durablement un site web dans les premiers résultats naturels des moteurs de recherche.

### Core Web Vitals
Indicateurs de performance web standardisés par Google :
- **LCP (Largest Contentful Paint) :** Vitesse de chargement du contenu principal (< 2,5 s).
- **CLS (Cumulative Layout Shift) :** Stabilité visuelle de la page sans décalage intempestif (< 0,1).
- **INP (Interaction to Next Paint) :** Réactivité aux interactions utilisateur (< 200 ms).

### Google AdSense
Régie publicitaire permettant aux éditeurs de sites web de monétiser leur audience via l'affichage d'annonces contextuelles automatiques.

### CMP (Consent Management Platform)
Outil conforme aux exigences de l'IAB et du RGPD permettant de recueillir, enregistrer et transmettre le consentement des utilisateurs quant au dépôt de traceurs publicitaires tiers.

---

## 5. Qualité Logicielle

### Critère d'Acceptation
Condition précise, vérifiable et non ambiguë qu'une fonctionnalité doit obligatoirement respecter pour être considérée comme achevée et conforme aux attentes métier (souvent formulée selon la syntaxe *Étant donné / Lorsque / Alors*).

### Non-Régression
Garantie qu'une modification ou qu'un ajout de code n'a pas dégradé ni brisé les fonctionnalités existantes de l'application.
