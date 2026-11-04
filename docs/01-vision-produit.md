# Vision Produit — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Cadrage stratégique, personas, proposition de valeur et périmètre  
> **Date :** 2026-10-27

---

## 1. Problématique utilisateur et constats du marché

Sur le web actuel, la recherche d'un « générateur de QR code gratuit » confronte les utilisateurs à trois frictions majeures :

1. **Le piège des abonnements cachés et des redirections tronquées** :  
   Une majorité de générateurs populaires créent des QR codes dynamiques passant par leurs propres serveurs. Après une période d'essai de 7 ou 14 jours, le lien est désactivé et l'utilisateur se voit forcé de payer un abonnement mensuel récurrent (souvent de 10 à 40 €/mois) pour réactiver ses QR codes déjà imprimés sur des cartes de visite, menus ou brochures.
2. **La violation de la vie privée et la fuite de données sensibles** :  
   Les générateurs classiques envoient toutes les informations saisies (identifiants et mots de passe de réseaux Wi-Fi privés, coordonnées complètes de carnets d'adresses, textes confidentiels) à des serveurs distants dont les politiques de conservation et de revente sont opaques.
3. **L'expérience utilisateur dégradée** :  
   Interfaces encombrées de pop-ups agressifs, obligation de créer un compte avec e-mail avant téléchargement, limitations artificielles sur la résolution d'export (exports vectoriels SVG ou haute définition payants).

---

## 2. Proposition de valeur de QR Studio

QR Studio apporte une réponse claire, éthique et pérenne :

> **« Créez et personnalisez des QR codes haute définition professionnels, gratuitement, sans compte, et avec la garantie absolue que vos données ne quittent jamais votre appareil. »**

### Les 4 piliers de la promesse produit :
- **Pérennité garantie (100 % Statique)** : Le QR code généré contient directement les données encodées brutes. Il continuera de fonctionner à l'infini, sans intermédiaire, sans abonnement, sans risque de lien brisé.
- **Confidentialité par conception (Privacy by Design)** : La génération est exécutée localement dans le navigateur. Zéro transmission de données à un serveur applicatif.
- **Qualité professionnelle sans restriction** : Exports vectoriels SVG nets pour les imprimeurs et exports matriciels PNG/JPEG/WebP haute résolution sans filigrane.
- **Accès instantané & zéro friction** : Pas de formulaire d'inscription, pas de carte bancaire, interface réactive et moderne dès le premier chargement.

---

## 3. Personas et utilisateurs cibles

### Persona 1 : Thomas, Restaurateur indépendant
- **Profil :** Gérant d'un bistrot, non-technicien.
- **Besoin :** Imprimer un QR code sur ses tables renvoyant directement vers son menu PDF hébergé sur son site, avec le logo de son établissement et un cadre attractif *« Consultez notre carte »*.
- **Douleur passée :** S'est retrouvé avec des QR codes imprimés et plastifiés désactivés après l'expiration d'un compte d'essai gratuit sur un site tiers.
- **Attente avec QR Studio :** Un QR code direct vers son URL, exporté en haute qualité, avec la certitude qu'il fonctionnera toujours.

### Persona 2 : Sarah, Chargée de communication / Graphiste freelance
- **Profil :** Professionnelle de la communication visuelle, exigeante sur la charte graphique.
- **Besoin :** Créer des QR codes personnalisés aux couleurs de ses clients (dégradés, coins arrondis, logo vectoriel parfaitement centré) et les exporter en **SVG** pour les intégrer dans ses maquettes InDesign / Illustrator.
- **Attente avec QR Studio :** Respect strict des codes hexadécimaux, marges configurables, niveau de correction d'erreur réglable pour préserver la scannabilité malgré le logo.

### Persona 3 : Marc, Responsable informatique de PME
- **Profil :** Conscient des enjeux de sécurité et de conformité RGPD.
- **Besoin :** Générer des QR codes pour la connexion au Wi-Fi « Invités » de l'entreprise et des vCards pour les signatures e-mail des collaborateurs.
- **Douleur passée :** Refus d'utiliser les générateurs en ligne grand public par peur d'exposer la clé Wi-Fi de l'entreprise sur des serveurs inconnus.
- **Attente avec QR Studio :** Génération 100 % locale vérifiable dans l'inspecteur réseau du navigateur.

---

## 4. Cas d'utilisation principaux

1. **Partage de réseau Wi-Fi** :  
   Générer une affiche à poser dans un bureau ou un salon permettant aux invités de se connecter en un clic sans taper de mot de passe complexe.
2. **Carte de visite connectée (vCard)** :  
   Partager instantanément des coordonnées complètes (téléphone, e-mail, site, fonction) intégrables directement dans le répertoire du smartphone qui scanne.
3. **Redirection vers un lien ou landing page** :  
   Promouvoir une URL vers un site web, une vidéo, une boutique en ligne ou un formulaire d'inscription.
4. **Envoi direct d'un e-mail ou SMS pré-rempli** :  
   Faciliter un contact de support client ou une demande de devis en pré-formatant le destinataire et l'objet du message.
5. **Géolocalisation d'un point d'intérêt** :  
   Pointer vers des coordonnées GPS précises pour ouvrir l'application de navigation (Google Maps, Apple Maps) lors d'un événement.

---

## 5. Positionnement du produit

| Critère | Générateurs Freemium classiques | Outils open-source en ligne de commande | **QR Studio** |
| :--- | :--- | :--- | :--- |
| **Coût** | Gratuit 7j puis 10 à 40 €/mois | 100 % gratuit | **100 % gratuit à vie** |
| **Type de QR** | Dynamique propriétaire forcé | Statique | **Statique direct universel** |
| **Confidentialité** | Données stockées sur serveur distant | Locale | **100 % Locale (zéro réseau)** |
| **Facilité d'usage** | Bonne mais polluée de tunnels d'achat | Complexe (nécessite terminal) | **Interface moderne, fluide et guidée** |
| **Personnalisation** | Souvent payante pour le logo/cadres | Limitée ou manuelle | **Avancée (formes, dégradés, cadres, logos)** |
| **Formats d'export** | PNG basse définition (SVG payant) | Selon script | **SVG, PNG HD, JPEG, WebP, Impression** |

---

## 6. Périmètre initial (Release 1.0)

### Fonctionnalités incluses (In Scope) :
- Générateur local réactif pour 10 types de contenus (URL, Texte, Wi-Fi, vCard, E-mail, SMS, Téléphone, GPS, Événement, Données brutes).
- Panneau complet de design : couleurs, dégradés, formes des points, styles des coins, niveau de correction d'erreur.
- Téléversement et incrustation de logos avec contrôle d'espacement et élimination des points recouverts.
- Cadres décoratifs prédéfinis avec libellé textuel personnalisable.
- Téléchargement en SVG vectoriel et images matricielles PNG/JPEG/WebP haute définition.
- Module d'impression directe optimisé pour le format papier.
- Sauvegarde locale automatique et manuelle des projets via **IndexedDB**.
- Import et export de configurations de projets au format JSON.
- Hub éditorial et guides SEO thématiques (guides pour Wi-Fi, vCard, menus de restaurant, etc.).
- Intégration non-intrusive d'emplacements publicitaires préparés pour Google AdSense.

### Fonctionnalités formellement exclues (Out of Scope) :
- Génération en masse par téléversement de fichier CSV/Excel.
- Comptes utilisateurs, authentification, profils en ligne.
- Synchronisation cloud des projets sauvegardés.
- Serveur de redirection et QR codes dynamiques modifiables après impression.
- Métriques et tracking distant du nombre de scans en temps réel.
- Backend applicatif ou base de données hébergée.

---

## 7. Modèle économique et stratégie de viabilité

QR Studio est conçu pour être gratuit pour l'utilisateur final tout en générant des revenus passifs récurrents :
- **Acquisition** : Trafic organique qualifié issu du référencement naturel (SEO) sur des intentions de recherche spécifiques (*« créer qr code wifi gratuit sans inscription »*, *« qr code vcard svg »*, etc.).
- **Monétisation** : Affichage publicitaire display (bannières non intrusives Google AdSense ou réseau programmatique équivalent conforme au standard IAB).
- **Considérations réalistes et distinctions obligatoires** :
  - *Objectif souhaité :* Atteindre la rentabilité des coûts d'infrastructure (nom de domaine, hébergement CDN minime) dès les premiers mois.
  - *Réalité technique et contractuelle :* L'approbation d'un compte publicitaire par Google AdSense ou tout autre réseau dépend exclusivement de critères éditoriaux externes, de l'historique du domaine et du volume de trafic ; **la conception technique ne garantit pas à elle seule l'acceptation contractuelle ou le niveau de revenu**.
  - Les emplacements publicitaires sont donc conçus selon une dégradation gracieuse : l'application offre une expérience irréprochable qu'une publicité soit chargée ou non.

---

## 8. Indicateurs clés de succès (KPIs)

Pour mesurer l'atteinte des objectifs produit :

1. **Qualité & Fiabilité technique :**
   - 0 % de requêtes applicatives envoyées à un serveur pour la génération.
   - 100 % de réussite au scan sur les configurations graphiques standard testées sur iOS et Android.
   - Core Web Vitals au vert (LCP < 2,0 s, CLS < 0,05, INP < 150 ms).
2. **Engagement utilisateur (mesuré localement ou via analytics anonymisés sans cookies) :**
   - Taux de complétion d'export (ratio utilisateurs ayant cliqué sur « Télécharger » par rapport aux sessions créateur).
   - Taux de rétention locale (retour sur l'outil via les projets enregistrés dans IndexedDB).
3. **SEO & Performance organique :**
   - Positionnement dans le top 10 sur une grappe de 15 mots-clés longue traîne francophones sous 6 mois après indexation.

---

## 9. Évolutions futures potentielles (Post-v1.0)

Sous réserve d'une étude d'opportunité et sans dénaturer la promesse de base :
- Mode hors-ligne complet via Progressive Web App (PWA installable avec Service Worker).
- Scanner de QR codes intégré via la caméra de l'appareil (API `BarcodeDetector` ou bibliothèque JS locale) pour vérifier directement la lisibilité de ses créations.
- Préréglages de thèmes prêts à l'emploi (minimaliste, néon, corporate, écologique).
- Option d'export au format PDF prêt à imprimer (A4, planche d'étiquettes).
