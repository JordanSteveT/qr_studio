# ADR-004 : Choix du Moteur de Rendu QR (`qr-code-styling`) et Architecture Composite pour les Cadres

> **Statut :** Retenue  
> **Date :** 2026-10-27  
> **Décideurs :** Architecte Logiciel, UX Designer, Ingénieur R&D

---

## 1. Contexte
La proposition de valeur de QR Studio repose sur la production de QR codes personnalisés, esthétiques (coins arrondis, dégradés, logos au centre, cadres d'appel à l'action) et exportables en haute résolution.

## 2. Problème à résoudre
Quel moteur open-source de génération retenir pour combiner styles graphiques modernes, formats vectoriels (SVG) et matriciels (PNG/Canvas), tout en comblant le manque de support natif pour les cadres avec texte ?

## 3. Options évaluées
1. **Option A : Bibliothèque `qrcode` (node-qrcode)**  
   *Avantages :* Ultra-légère, référence historique.  
   *Limites :* Rendu exclusivement carré brut noir et blanc. Ne supporte pas les formes de points personnalisées, ni les yeux arrondis, ni les dégradés, ni l'incrustation automatique de logos avec élimination des points.
2. **Option B : Réécriture complète d'un moteur géométrique sur-mesure**  
   *Avantages :* Contrôle absolu.  
   *Limites :* Effort de développement et de maintenance démesuré pour la v1.0 ; risque élevé de non-conformité avec les spécifications de décodage ISO/IEC 18004.
3. **Option C : `qr-code-styling` complétée par un service de composition sur-mesure (`FrameComposerService`)**  
   *Avantages :* Moteur open-source le plus complet pour les formes de modules, yeux personnalisés, dégradés linéaires/radiaux et incrustation de logos avec gestion de la redondance d'erreur.  
   *Limites identifiées :* Ne gère pas nativement les cadres décoratifs extérieurs avec texte (*« SCAN ME »*).

## 4. Décision retenue
- **Adoption de `qr-code-styling`** comme moteur de rendu de la matrice QR brute et de ses éléments graphiques internes.
- **Développement d'un service composite (`FrameComposerService`)** qui encapsule le résultat de `qr-code-styling` pour y adjoindre les cadres décoratifs, bordures et bandeaux de texte Call-to-Action.

## 5. Raisons de cette décision
- Réutilisation d'une bibliothèque mature, testée et activement maintenue.
- Respect rigoureux des standards de redondance et de géométrie QR.
- Flexibilité totale pour les cadres grâce à la sur-couche Canvas/SVG maison.

## 6. Avantages
- Richesse graphique immédiate pour l'utilisateur.
- Exports SVG vectoriels et PNG haute définition pris en charge.
- Indépendance architecturale : le composant applicatif dialogue avec une façade unifiée `QrEngineService`.

## 7. Inconvénients et compromis
- La bibliothèque pèse environ 60 ko (gzippé), ce qui justifie son chargement dynamique pour préserver la vitesse de chargement initial.
- Dépendance au DOM (`document.createElement`) imposant une isolation stricte vis-à-vis du SSR Nuxt.

## 8. Conséquences techniques
- Isolation dans `services/qr/qr-engine.service.ts` et `services/qr/frame-composer.service.ts`.
- Encapsulation des composants graphiques dans `<ClientOnly>`.
- Les exports WebP et JPEG sont dérivés de l'élément Canvas généré.

## 9. Conséquences sur la sécurité et la confidentialité
- Traitement 100 % local, aucune communication réseau émise par le moteur.

## 10. Possibilités de réévaluation
Si `qr-code-styling` venait à intégrer nativement un système de cadres textuels conforme à nos critères de design, le service `FrameComposerService` pourrait être allégé en conséquence.
