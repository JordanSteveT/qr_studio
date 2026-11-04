# Spécification Fonctionnelle Détaillée : Monétisation et Affichage Publicitaire

> **Module :** `features/advertising.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-013`, `SEC-002`, `QA-003`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Intégrer une monétisation publicitaire programmatique discrète et respectueuse (Google AdSense ou réseau partenaire agréé) permettant de financer le service sans jamais dégrader l'expérience utilisateur, sans ralentir la génération et en respectant scrupuleusement le consentement RGPD.

---

## 2. Périmètre

### Inclus
- Composant générique réutilisable `<AdSlot>`.
- Emplacements autorisés prédéfinis :
  - Bannière de pied de page (Footer Leaderboard 728×90 / 320×50 px).
  - Encart vertical latéral sur très grand écran (Desktop Skyscraper 160×600 ou 300×600 px).
  - Encart rectangulaire au milieu des guides éditoriaux (300×250 px).
- Gestion du consentement préalable via une CMP certifiée conforme au standard IAB TCF v2.2.
- Préservation absolue des signaux Core Web Vitals (CLS = 0) par réservation d'espace en CSS.
- Dégradation gracieuse en cas de blocage (AdBlocker) ou de refus de consentement.

### Exclus
- Publicités interstitielles plein écran bloquantes.
- Vidéos avec lecture automatique sonore.
- Faux boutons de téléchargement (*Fake Download Buttons*).
- Transmission de données de formulaires aux annonceurs.

---

## 3. Utilisateur et cas d'utilisation
- **Éditeur de QR Studio :** Générer des revenus publicitaires passifs indexés sur le volume de trafic SEO.
- **Utilisateur final :** Utiliser l'outil librement sans être agressé par des publicités intrusives ou trompeuses.

---

## 4. Prérequis
- Compte éditeur Google AdSense approuvé (ou régie équivalente).
- Variable d'environnement `NUXT_PUBLIC_ADSENSE_CLIENT_ID` configurée.

---

## 5. Parcours utilisateur
1. Lors de sa première visite depuis l'Union Européenne, l'utilisateur voit apparaître la bannière de consentement CMP.
2. S'il accepte : les scripts publicitaires sont chargés en mode différé et les bannières s'affichent dans les zones réservées.
3. S'il refuse ou utilise un AdBlocker : les scripts tiers ne sont pas exécutés et les encarts restent invisibles sans laisser de trous béants disgracieux.
4. Dans les deux cas, la génération et le téléchargement du QR code fonctionnent à 100 %.

---

## 6. Comportement attendu
- **Chargement asynchrone :** Les scripts publicitaires ne bloquent jamais le thread principal d'exécution ni le premier rendu graphique de l'application.
- **Indépendance opérationnelle :** Si le réseau publicitaire tombe en panne ou subit un temps de réponse lent, l'éditeur de QR code continue de fonctionner à sa vitesse maximale.

---

## 7. Règles métier
1. **Sanctuaire de l'action principale :** Il est strictement interdit d'insérer un encart publicitaire entre l'aperçu du QR code et les boutons d'export (PNG, SVG).
2. **Étanchéité des données :** Aucun paramètre encodé dans le QR code (SSID Wi-Fi, coordonnées, textes) ne doit être injecté dans les requêtes de ciblage publicitaire.

---

## 8. Validations et erreurs
- En cas d'erreur de chargement du script publicitaire (code HTTP 4xx/5xx ou blocage DNS), l'événement est intercepté silencieusement sans déclencher d'alerte à l'écran.

---

## 9. Cas limites
- **Écran mobile étroit (320 px) :** L'encart publicitaire de pied de page s'adapte automatiquement au format mobile standard (320×50 px) sans provoquer de dépassement horizontal (*horizontal overflow*).

---

## 10. Interface utilisateur
- Composant `AdSlot` :
  - Conteneur enveloppant avec bordure très discrète ou étiquette réglementaire *« Annonce »*.
  - Définition de styles CSS stricts :
    ```css
    .ad-slot-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 250px;
      contain: layout;
    }
    ```

---

## 11. Architecture technique

### Composants
- `components/ads/AdSlot.vue`

### Composables
- `composables/useConsent.ts` : Vérifie l'état d'accord de l'utilisateur avant d'autoriser l'injection du script.

### Dépendances
- Script officiel `adsbygoogle.js` injecté dynamiquement.

---

## 12. Critères d'acceptation
- **CA-ADS-01 :** Étant donné une page chargée avec des encarts publicitaires, alors le score CLS (Cumulative Layout Shift) mesuré par Lighthouse reste strictement inférieur à 0,05.
- **CA-ADS-02 :** Étant donné un navigateur avec AdBlock activé, alors l'utilisateur peut créer, personnaliser et télécharger son QR code sans aucun blocage applicatif.

---

## 13. Stratégie de tests

### Cas nominaux
- Vérification du rendu du conteneur d'encart sur les trois formats (footer, sidebar, in-article).

### Cas d'erreur
- Simulation d'un blocage de `pagead2.googlesyndication.com` via Playwright : vérification que le bouton d'export du QR code reste 100 % opérationnel.

### Cas limites
- Test d'orientation paysage sur smartphone : adaptation fluide de la bannière.

### Non-régression
- Vérification de l'absence totale de décalage d'éléments visuels lors de l'insertion différée de l'iframe publicitaire.

---

## 14. Exigences liées
- `FR-013`, `SEC-002`, `QA-003`.

---

## 15. Dépendances et risques
- **Risque :** Délai d'approbation initial du compte AdSense par Google.
- **Atténuation :** L'application est conçue pour fonctionner avec ou sans publicité activée via simple bascule de variable d'environnement.

---

## 16. Documentation à mettre à jour
- `docs/08-seo-publicite-et-monetisation.md`.

---

## 17. Questions ouvertes
- *Faut-il tester d'autres régies alternatives éthiques ?* Des alternatives respectueuses de la vie privée (ex. EthicalAds) pourront être évaluées ultérieurement.
