# Modèle de Données et Typage TypeScript — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Spécification exhaustive des types TypeScript, schémas de validation Zod et structures de persistance  
> **Date :** 2026-10-27

---

## 1. Principes directeurs du modèle de données

1. **Typage strict et discriminé (Discriminated Unions)** :  
   Chaque type de contenu QR possède une clé discriminante fixe (`type: 'URL' | 'WIFI' | ...`) permettant à TypeScript de vérifier statiquement l'exhaustivité des branches (`switch/case`).
2. **Versionnage explicite des schémas (`schemaVersion`)** :  
   Tout projet sauvegardé en local ou exporté en JSON inclut un numéro de version de schéma entier (`schemaVersion: 1`). Cela permet d'exécuter des fonctions de migration sans perte de données lors des futures versions de l'application.
3. **Séparation nette des responsabilités de stockage** :
   - *Données du projet* : L'état nécessaire pour réhydrater l'éditeur (options de design, texte saisi).
   - *Données encodées* : La chaîne textuelle finale générée par le sérialiseur (ex. la chaîne vCard brute).
   - *Données binaires (Logos)* : Les logos importés sont isolés sous forme de `Blob` dans IndexedDB et ne polluent pas les objets légers de configuration.
   - *Exports finaux* : Les fichiers images générés (PNG, SVG) ne sont pas stockés en base ; ils sont régénérés à la volée pour économiser l'espace disque du navigateur.

---

## 2. Définition des types de contenu (`types/content.ts`)

```typescript
/**
 * Types de contenus pris en charge par QR Studio
 */
export type QrContentType =
  | 'URL'
  | 'TEXT'
  | 'WIFI'
  | 'VCARD'
  | 'EMAIL'
  | 'SMS'
  | 'PHONE'
  | 'GEO'
  | 'EVENT'
  | 'CUSTOM';

// -------------------------------------------------------------
// 1. URL
// -------------------------------------------------------------
export interface QrUrlData {
  type: 'URL';
  url: string; // Doit être une URL valide commençant par http:// ou https://
}

// -------------------------------------------------------------
// 2. Texte libre
// -------------------------------------------------------------
export interface QrTextData {
  type: 'TEXT';
  text: string; // Longueur max recommandée : 2000 caractères
}

// -------------------------------------------------------------
// 3. Réseau Wi-Fi
// -------------------------------------------------------------
export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface QrWifiData {
  type: 'WIFI';
  ssid: string;               // Nom du réseau (1 à 32 caractères)
  password?: string;          // Clé de sécurité (vide si nopass)
  encryption: WifiEncryption; // Type de sécurité
  hidden: boolean;            // Réseau masqué ou non
}

// -------------------------------------------------------------
// 4. Contact vCard (conforme vCard 3.0)
// -------------------------------------------------------------
export interface QrVCardData {
  type: 'VCARD';
  firstName: string;          // Prénom
  lastName: string;           // Nom de famille
  organization?: string;      // Entreprise / Société
  jobTitle?: string;          // Poste / Fonction
  phoneWork?: string;         // Téléphone professionnel
  phoneMobile?: string;       // Téléphone portable
  email?: string;             // Adresse e-mail
  website?: string;           // Site web professionnel ou personnel
  addressStreet?: string;     // Adresse (rue)
  addressCity?: string;       // Ville
  addressPostalCode?: string; // Code postal
  addressCountry?: string;    // Pays
  note?: string;              // Note complémentaire
}

// -------------------------------------------------------------
// 5. E-mail pré-rempli
// -------------------------------------------------------------
export interface QrEmailData {
  type: 'EMAIL';
  email: string;              // Adresse e-mail du destinataire
  subject?: string;           // Objet du message
  body?: string;              // Corps du message
}

// -------------------------------------------------------------
// 6. SMS pré-rempli
// -------------------------------------------------------------
export interface QrSmsData {
  type: 'SMS';
  phoneNumber: string;        // Numéro de téléphone international (ex. +33612345678)
  message?: string;           // Message pré-saisi
}

// -------------------------------------------------------------
// 7. Appel téléphonique direct
// -------------------------------------------------------------
export interface QrPhoneData {
  type: 'PHONE';
  phoneNumber: string;        // Format E.164 recommandé
}

// -------------------------------------------------------------
// 8. Coordonnées géographiques GPS
// -------------------------------------------------------------
export interface QrGeoData {
  type: 'GEO';
  latitude: number;           // Entre -90 et +90
  longitude: number;          // Entre -180 et +180
  query?: string;             // Nom optionnel du lieu (label)
}

// -------------------------------------------------------------
// 9. Événement calendrier (iCalendar)
// -------------------------------------------------------------
export interface QrEventData {
  type: 'EVENT';
  title: string;              // Titre de l'événement
  location?: string;          // Lieu ou URL de visioconférence
  description?: string;       // Description
  startDate: string;          // Format ISO 8601 (ex. 2026-11-15T14:00:00Z)
  endDate: string;            // Format ISO 8601 (doit être >= startDate)
  allDay: boolean;            // Événement sur toute la journée
}

// -------------------------------------------------------------
// 10. Données personnalisées brutes
// -------------------------------------------------------------
export interface QrCustomData {
  type: 'CUSTOM';
  rawPayload: string;         // Chaîne libre encodée telle quelle
}

/**
 * Union discriminée représentant l'ensemble des contenus possibles
 */
export type QrContent =
  | QrUrlData
  | QrTextData
  | QrWifiData
  | QrVCardData
  | QrEmailData
  | QrSmsData
  | QrPhoneData
  | QrGeoData
  | QrEventData
  | QrCustomData;
```

---

## 3. Définition des options de design graphique (`types/design.ts`)

```typescript
export type QrDotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type QrCornerSquareType = 'square' | 'dot' | 'extra-rounded' | 'none';
export type QrCornerDotType = 'square' | 'dot' | 'none';

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrColorStop {
  offset: number; // 0 à 1
  color: string;  // Code hexadécimal (#rrggbb) ou rgba
}

export interface QrGradient {
  type: 'linear' | 'radial';
  rotation: number; // En radians ou degrés (0 à 360)
  colorStops: [QrColorStop, QrColorStop, ...QrColorStop[]];
}

export interface QrDotsDesign {
  color: string;
  type: QrDotType;
  gradient?: QrGradient;
}

export interface QrCornersSquareDesign {
  color: string;
  type: QrCornerSquareType;
}

export interface QrCornersDotDesign {
  color: string;
  type: QrCornerDotType;
}

export interface QrBackgroundDesign {
  color: string;           // Supporte transparent via rgba(0,0,0,0) ou hex
  isTransparent: boolean;
  gradient?: QrGradient;
}

export interface QrLogoSettings {
  hasLogo: boolean;
  imageSize: number;           // Ratio par rapport au QR code (0.15 à 0.35, défaut 0.25)
  margin: number;              // Marge en pixels autour du logo (0 à 20, défaut 5)
  hideBackgroundDots: boolean; // Supprime les points sous le logo
  logoMimeType?: string;       // ex. 'image/png' | 'image/svg+xml'
  logoFileName?: string;       // Nom d'origine du fichier
}

export type QrFrameType =
  | 'none'
  | 'bottom-badge'
  | 'top-badge'
  | 'full-card'
  | 'speech-bubble';

export interface QrFrameSettings {
  type: QrFrameType;
  text: string;               // Libellé d'appel à l'action (max 30 car.)
  textColor: string;          // Couleur du texte (Hex)
  frameColor: string;         // Couleur du bandeau/fond de cadre
  fontFamily: string;         // Police (Inter, Roboto, Arial, sans-serif)
}

export interface QrDesign {
  dots: QrDotsDesign;
  cornersSquare: QrCornersSquareDesign;
  cornersDot: QrCornersDotDesign;
  background: QrBackgroundDesign;
  logo: QrLogoSettings;
  frame: QrFrameSettings;
  errorCorrectionLevel: QrErrorCorrectionLevel;
  margin: number;             // Quiet zone en pixels (défaut 10 px)
}
```

---

## 4. Modèle de projet et persistance (`types/project.ts`)

```typescript
/**
 * Entité complète stockée dans IndexedDB (table 'projects')
 */
export interface QrProjectEntity {
  id: string;                 // UUID v4 unique
  name: string;               // Nom donné par l'utilisateur
  schemaVersion: number;      // Version courante : 1
  createdAt: number;          // Timestamp millisecondes
  updatedAt: number;          // Timestamp millisecondes
  content: QrContent;         // Données du contenu
  design: QrDesign;           // Options complètes de design
  logoBlob?: Blob;            // Fichier binaire du logo (optionnel)
  thumbnailDataUrl: string;   // Image miniature PNG 128x128 px pour l'affichage liste
}

/**
 * Format d'échange pour l'import / export de configuration JSON
 * (Le logo y est sérialisé en Base64 data-URL pour être autonome dans un unique fichier texte)
 */
export interface QrProjectJsonExport {
  app: 'QR Studio';
  schemaVersion: number;
  exportedAt: string;         // Date ISO
  name: string;
  content: QrContent;
  design: QrDesign;
  logoBase64?: string;        // Chaîne data:image/...;base64,... si un logo était présent
}
```

---

## 5. Préférences utilisateur locales (`types/preferences.ts`)

Stockées sous forme d'objet JSON sérialisé dans `localStorage` (clé `qr_studio_user_prefs`) :

```typescript
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  lastUsedContentType: QrContentType;
  defaultExportFormat: 'png' | 'svg' | 'jpeg' | 'webp';
  defaultExportResolution: number; // 1024, 2048, 4096
  autoSaveDraft: boolean;          // Sauvegarde automatique du brouillon courant
}
```

---

## 6. Schémas de validation Zod de référence (`services/validation/`)

Exemple de schéma Zod strict garantissant la validité du projet à l'import JSON :

```typescript
import { z } from 'zod';

export const wifiSchema = z.object({
  type: z.literal('WIFI'),
  ssid: z.string().min(1, 'Le nom du réseau (SSID) est obligatoire').max(32),
  password: z.string().optional(),
  encryption: z.enum(['WPA', 'WEP', 'nopass']),
  hidden: z.boolean().default(false),
});

export const urlSchema = z.object({
  type: z.literal('URL'),
  url: z.string().url('L\'URL doit être valide (http:// ou https://)'),
});

export const contentSchema = z.discriminatedUnion('type', [
  urlSchema,
  wifiSchema,
  // ... autres schémas de types
]);

export const projectImportSchema = z.object({
  app: z.literal('QR Studio'),
  schemaVersion: z.number().int().positive(),
  name: z.string().min(1).max(100),
  content: contentSchema,
  design: z.any(), // Schéma détaillé dans design.schema.ts
  logoBase64: z.string().optional(),
});
```

---

## 7. Stratégie de migration et cycle de vie des schémas

1. **Règle d'or :** Aucune modification de structure de type ne doit briser la compatibilité avec un fichier `schemaVersion: 1`.
2. **Mécanisme de migration :**
   - Un registre de fonctions de mise à niveau `migrations[versionCible]` est prévu dans `services/storage/migrations.ts`.
   - À l'ouverture d'un projet dont le `schemaVersion` est inférieur à la version courante de l'application, la fonction de migration est appliquée séquentiellement avant d'injecter l'objet dans l'état de l'éditeur.
   - Les champs supprimés ou renommés reçoivent des valeurs de repli par défaut sans alerter l'utilisateur.
