# Sécurité, Confidentialité et Protection des Données — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Politique de sécurité, modèle de menaces, respect de la vie privée et conformité réglementaire  
> **Date :** 2026-10-27

---

## 1. Principe cardinal : Traitement 100 % local (Privacy by Design)

L'architecture de QR Studio repose sur un engagement technique fondamental : **l'étanchéité absolue des données utilisateur**.

Contrairement aux générateurs de QR codes en ligne classiques qui reçoivent vos mots de passe Wi-Fi, coordonnées personnelles ou documents confidentiels sur leurs serveurs, QR Studio exécute l'intégralité du cycle de vie des données (saisie, validation, encodage matriciel, rendu graphique et export de fichiers) **localement au sein du bac à sable (sandbox) du navigateur client**.

```text
┌────────────────────────────────────────────────────────┐
│ NAVIGATEUR CLIENT                                       │
│                                                        │
│ Saisie utilisateur ---> Moteur QR Studio (JS/Canvas)   │
│         │                         │                    │
│         ▼                         ▼                    │
│   Stockage Local           Fichier Téléchargé          │
│    (IndexedDB)               (SVG, PNG, PDF)           │
│                                                        │
│ ══════════════════════════════════════════════════════ │
│ MUR DE SÉCURITÉ : ZÉRO REQUÊTE RÉSEAU VERS UN BACKEND  │
└────────────────────────────────────────────────────────┘
```

---

## 2. Cartographie des données sensibles et garanties d'étanchéité

| Type de donnée saisie | Risque en cas de fuite | Traitement appliqué par QR Studio |
| :--- | :--- | :--- |
| **Clés Wi-Fi (WPA/WEP)** | Intrusion sur le réseau privé de l'utilisateur | Conservée uniquement en mémoire vive et dans l'IndexedDB locale chiffrée par l'OS. Jamais transmise. |
| **Fiches contact vCard** | Fuite de carnet d'adresses, RGPD | Sérialisée en chaîne vCard 3.0 directement dans le navigateur. |
| **Coordonnées GPS** | Révélation d'adresses privées | Calcul trigonométrique et encodage d'URL cartographique local. |
| **Logos & Images de marque** | Espionnage ou vol de créations | Stockés sous forme de `Blob` binaire dans IndexedDB. |

---

## 3. Délimitation stricte entre le moteur métier et les services tiers

La transparence envers l'utilisateur impose de distinguer formellement deux périmètres :

1. **Le moteur applicatif QR Studio :**  
   Aucune API distante, aucun cookie, aucun traceur, aucun backend. Fonctionne même si la connexion Internet est coupée après le chargement initial de la page.
2. **Les services tiers de monétisation (Google AdSense / Réseau publicitaire) :**  
   - Les scripts publicitaires tiers utilisent des cookies et traceurs de navigation soumis aux réglementations internationales (RGPD en Europe, CCPA/CPRA en Californie).
   - **Garantie technique :** Aucun contenu saisi par l'utilisateur dans les formulaires QR (pas de mot de passe, pas de texte, pas d'URL) n'est transmis aux balises ou scripts publicitaires.
   - Une **Consent Management Platform (CMP)** certifiée par l'IAB est intégrée avant le chargement de toute publicité personnalisée afin de recueillir le consentement libre et éclairé de l'utilisateur.
   - Si l'utilisateur refuse le consentement ou dispose d'un bloqueur de publicité (AdBlocker), l'application continue de fonctionner sans aucune restriction technique.

---

## 4. Modèle de menaces et mesures d'atténuation

---

### 4.1. Téléversement de logos et prévention des attaques XSS via SVG
- **Menace :** Les fichiers vectoriels `.svg` peuvent contenir des scripts exécutables JavaScript malveillants (`<script>`, balises `<image onload="...">`, ou événements `onerror`). Si un SVG malveillant était injecté directement dans le DOM via `v-html` ou un `innerHTML`, il pourrait exécuter du code dans le contexte de l'application.
- **Contre-mesure obligatoire de QR Studio :**
  1. **Interdiction formelle de `v-html`** sur tout contenu issu d'un fichier téléversé.
  2. Les logos SVG téléversés sont traités comme des images isolées : ils sont chargés via une balise `<img src="blob:...">` ou dessinés sur un élément `<canvas>` via la méthode `CanvasRenderingContext2D.drawImage()`. Cette méthode neutralise l'exécution de tout script JavaScript éventuellement encapsulé dans le SVG.
  3. Limitation stricte de la taille des fichiers images à **2 Mo**.

---

### 4.2. Import de fichiers de configuration JSON
- **Menace :** Un attaquant pourrait inciter un utilisateur à importer un fichier `.json` corrompu ou contenant une tentative de pollution de prototype (`__proto__`, `constructor`) ou des charges utiles malveillantes.
- **Contre-mesure :**
  1. Tout fichier JSON téléversé passe obligatoirement par le parseur natif sécurisé `JSON.parse()`.
  2. L'objet résultant est validé contre le schéma strict Zod (`projectImportSchema`).
  3. Tout champ inattendu est rejeté (`strip` / `strict`). Si la validation échoue, le fichier est immédiatement rejeté avec un message d'erreur clair et la mémoire est libérée.

---

### 4.3. Débordement de mémoire et saturation du stockage local (IndexedDB)
- **Menace :** L'accumulation de projets contenant des logos haute définition peut dépasser le quota de stockage alloué par le navigateur, provoquant des erreurs silencieuses de sauvegarde.
- **Contre-mesure :**
  1. Les logos sont automatiquement redimensionnés à une résolution maximale de 1024×1024 px avant d'être persistés dans IndexedDB.
  2. L'API `navigator.storage.estimate()` est consultée pour vérifier l'espace disponible.
  3. En cas d'erreur `QuotaExceededError`, l'utilisateur est prévenu par une notification explicite l'invitant à exporter ses projets en JSON ou à supprimer d'anciens projets.

---

## 5. Droit à l'effacement et gestion de la rétention des données

Conformément à l'esprit du RGPD :
- L'utilisateur dispose à tout moment, depuis la page `/projects`, d'un bouton d'action **« Tout effacer »**.
- L'activation de cette action déclenche la purge immédiate et irréversible de la base de données IndexedDB (`Dexie.delete()`) et des clés de préférences dans `localStorage`.
- Aucune sauvegarde résiduelle n'est conservée, dans la mesure où aucun serveur ne stocke de copie.

---

## 6. Politique de Sécurité du Contenu (Content Security Policy - CSP)

Pour le déploiement de production, les en-têtes HTTP de sécurité recommandés sont les suivants :

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://pagead2.googlesyndication.com; frame-src https://googleads.g.doubleclick.net; connect-src 'self' https://pagead2.googlesyndication.com; object-src 'none'; base-uri 'self';
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
```

*Note : Les directives de scripts distants sont limitées aux domaines officiels des régies publicitaires agréées après recueil du consentement.*
