# Spécification Fonctionnelle Détaillée : Types de Contenu et Sérialisation

> **Module :** `features/qr-content-types.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-002`, `FR-003`, `FR-015`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Définir les règles de saisie, les schémas de validation et les algorithmes de sérialisation textuelle pour les 10 types de contenus pris en charge, afin de garantir leur reconnaissance universelle par les smartphones iOS et Android lors du scan.

---

## 2. Périmètre

### Inclus
- Prise en charge des 10 types : URL, Texte libre, Wi-Fi, vCard 3.0, E-mail, SMS, Téléphone, Localisation GPS, Événement calendrier (iCalendar), et Données personnalisées brutes.
- Échappement rigoureux des caractères réservés selon les RFC applicables.
- Validation des champs obligatoires et des formats via schémas Zod.

### Exclus
- Conversion automatique de fichiers PDF ou images en QR code via hébergement cloud (puisque aucun serveur distant n'est utilisé ; l'utilisateur doit fournir l'URL publique de son fichier).

---

## 3. Utilisateur et cas d'utilisation
- **Particulier :** Partager son code Wi-Fi sans dicter un mot de passe complexe de 20 caractères.
- **Professionnel :** Distribuer une carte de visite vCard complète sur un salon.
- **Organisateur d'événement :** Permettre l'ajout d'une conférence au calendrier du smartphone en un scan.

---

## 4. Prérequis
- Définition stricte des types TypeScript dans `types/content.ts`.

---

## 5. Parcours utilisateur
1. L'utilisateur clique sur l'icône du type de contenu souhaité dans `QrTypeSelector`.
2. Le formulaire dédié s'affiche avec ses champs spécifiques.
3. L'utilisateur remplit les champs.
4. Le système valide en temps réel les données et sérialise la chaîne encodable transmise au moteur QR.

---

## 6. Comportement attendu
Chaque sérialiseur transforme un objet structuré en une chaîne brute respectant la norme :

1. **URL :** Chaîne textuelle commençant obligatoirement par `http://` ou `https://`.
2. **Texte :** Chaîne brute sans préfixe particulier.
3. **Wi-Fi :** Format universel `WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<password>;H:<true|false>;;`
   - *Règle d'échappement :* Les caractères spéciaux `;`, `:`, `,`, `\` et `"` dans le SSID et le mot de passe sont obligatoirement précédés d'une barre oblique inverse (`\`).
4. **vCard (Version 3.0) :**
   ```text
   BEGIN:VCARD
   VERSION:3.0
   N:Nom;Prénom;;;
   FN:Prénom Nom
   ORG:Entreprise
   TITLE:Fonction
   TEL;TYPE=CELL:+33612345678
   EMAIL;TYPE=INTERNET:contact@exemple.fr
   URL:https://monsite.fr
   ADR:;;Rue;Ville;;CodePostal;Pays
   NOTE:Note éventuelle
   END:VCARD
   ```
5. **E-mail :** Schéma standard `mailto:<email>?subject=<encodeURIComponent(sujet)>&body=<encodeURIComponent(corps)>`
6. **SMS :** Schéma standard `smsto:<phoneNumber>:<message>`
7. **Téléphone :** Schéma `tel:<phoneNumber>`
8. **Localisation GPS :** Schéma géographique `geo:<latitude>,<longitude>?q=<encodeURIComponent(label)>`
9. **Événement (iCalendar) :**
   ```text
   BEGIN:VEVENT
   SUMMARY:Titre de la réunion
   LOCATION:Lieu ou lien visio
   DESCRIPTION:Détails de l'événement
   DTSTART:20261115T140000Z
   DTEND:20261115T160000Z
   END:VEVENT
   ```
10. **Données brutes (Custom) :** Encodage direct de la chaîne brute saisie par l'utilisateur.

---

## 7. Règles métier
- **Préservation des options de design :** Si l'utilisateur a personnalisé les couleurs ou le cadre, le changement de type de contenu ne doit en aucun cas réinitialiser son travail esthétique.
- **Minimisation de la chaîne :** Les champs facultatifs non renseignés (ex. note dans une vCard, description d'événement) doivent être purement omis pour ne pas alourdir inutilement la densité de la matrice QR.

---

## 8. Validations et erreurs
- Utilisation de Zod pour chaque formulaire.
- Message d'erreur clair sous chaque champ invalide :
  - URL sans protocole : *« L'URL doit commencer par https:// ou http:// »*.
  - Latitude hors bornes : *« La latitude doit être comprise entre -90 et +90 »*.
  - Wi-Fi : *« Le nom du réseau (SSID) est obligatoire »*.
  - Événement : *« La date de fin ne peut pas être antérieure à la date de début »*.

---

## 9. Cas limites
- **Mots de passe Wi-Fi contenant des guillemets et points-virgules (`P:abc;123"xyz`) :** La fonction `escapeWifiString()` doit doubler les barres obliques inverses et échapper chaque point-virgule (`P:abc\;123\"xyz`).
- **Noms de famille avec particules ou tirets (`De La Tour-d'Auvergne`) :** Normalisation UTF-8 sans altération des apostrophes.

---

## 10. Interface utilisateur
- `QrTypeSelector` : Barre d'onglets scrollable avec icônes Lucide explicites (Globe, Texte, Wifi, User, Mail, MessageSquare, Phone, MapPin, Calendar, Code).
- Formulaire dédié pour chaque type (`FormUrl`, `FormWifi`, `FormVCard`, etc.) avec étiquettes accessibles et infobulles d'aide.

---

## 11. Architecture technique

### Composants
- `components/editor/QrTypeSelector.vue`
- `components/editor/QrContentForm.vue`
- `components/forms/Form*.vue`

### Composables
- `composables/useQrProject.ts` : Stocke le type actif et les données spécifiques.

### Services
- `services/qr/serializers/*.serializer.ts` : 10 fonctions pures de sérialisation.
- `services/validation/content.schema.ts` : Schémas Zod.

### Types et données
- Interfaces TypeScript `QrContent` et `QrContentType` issues de `types/content.ts`.

### Dépendances
- `zod` pour les validateurs de schéma.

---

## 12. Critères d'acceptation
- **CA-TYP-01 :** Étant donné un formulaire Wi-Fi avec SSID `MonReseau` et mot de passe `Secret;123`, lorsque la sérialisation s'exécute, alors la chaîne retournée est `WIFI:S:MonReseau;T:WPA;P:Secret\;123;;`.
- **CA-TYP-02 :** Étant donné un formulaire vCard avec Nom et Téléphone seuls, lorsque le QR code est scanné sur iPhone, alors l'application Contacts propose immédiatement l'enregistrement du contact.

---

## 13. Stratégie de tests

### Cas nominaux
- Tests unitaires pour chaque fonction de sérialisation avec des jeux de données complets.

### Cas d'erreur
- Soumission d'une chaîne URL invalide : le validateur Zod renvoie un résultat `success: false` avec le message attendu.

### Cas limites
- Événement durant toute la journée : vérification du format `DTSTART;VALUE=DATE:20261115`.
- Coordonnées GPS avec virgule au lieu d'un point : conversion automatique en décimal.

### Non-régression
- Vérification que la matrice se régénère sans perte de style lors de la bascule entre URL et Wi-Fi.

---

## 14. Exigences liées
- `FR-002`, `FR-003`, `FR-015`.

---

## 15. Dépendances et risques
- **Risque :** Différences de prise en charge de certains champs vCard entre les vieux Android et iOS récents.
- **Atténuation :** Utilisation stricte de vCard 3.0 qui constitue le standard le plus universellement reconnu.

---

## 16. Documentation à mettre à jour
- `docs/04-modele-de-donnees.md`.

---

## 17. Questions ouvertes
- *Faudra-t-il ajouter le support de vCard 4.0 ?* Non, vCard 3.0 est actuellement plus largement compatible avec les scanners natifs grand public. Décision figée pour la v1.0.
