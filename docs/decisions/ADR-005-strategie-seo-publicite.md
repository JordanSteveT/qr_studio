# ADR-005 : Séparation Stricte entre Moteur Applicatif, Stratégie SEO et Monétisation Publicitaire

> **Statut :** Retenue  
> **Date :** 2026-10-27  
> **Décideurs :** Product Owner, Architecte Logiciel, Responsable SEO & Monétisation

---

## 1. Contexte
QR Studio propose un outil gratuit financé par la publicité programmatique et tire l'essentiel de son acquisition du référencement naturel sur les moteurs de recherche.

## 2. Problème à résoudre
Comment intégrer des scripts publicitaires tiers (AdSense) et une plateforme de consentement (CMP) sans :
- Ralentir ou corrompre la promesse de génération locale instantanée.
- Dégrader l'expérience utilisateur ou les scores Core Web Vitals.
- Exposer les données saisies par l'utilisateur aux régies publicitaires.

## 3. Options évaluées
1. **Option A : Publicité intrusive et bloqueur d'accès (Paywall / AdBlock detector agressif)**  
   *Inconvénients :* Taux de rebond élevé, dégradation immédiate de la réputation de la marque, sanction par Google sur les Core Web Vitals.
2. **Option B : Couplage direct des scripts publicitaires dans le flux de téléchargement**  
   *Inconvénients :* Si le script publicitaire bloque ou échoue, le téléchargement du QR code ne fonctionne plus. Risque majeur de fuite de données.
3. **Option C : Découplage architectural absolu et dégradation gracieuse**  
   *Avantages :* Le moteur de génération et d'export fonctionne de manière 100 % autonome, que les scripts publicitaires soient chargés, bloqués ou refusés. Encarts publicitaires encapsulés dans des conteneurs à dimensions réservées en CSS (CLS = 0).

## 4. Décision retenue
**Adoption de l'Option C : Découplage architectural absolu et dégradation gracieuse.**

## 5. Raisons de cette décision
- **Intangibilité de l'outil métier :** Un utilisateur sans réseau (mode avion) ou équipé d'un bloqueur de publicité doit pouvoir créer et télécharger son QR code sans obstacle.
- **Préservation des signaux Core Web Vitals :** L'expérience visuelle ne doit souffrir d'aucun sursaut d'affichage (CLS < 0,05).
- **Conformité éthique et légale :** Aucune donnée saisie dans les formulaires de l'application n'est exposée aux balises tierces.

## 6. Avantages
- Fiabilité applicative maximale.
- Éligibilité optimale aux critères de qualité éditoriale et technique de Google AdSense.
- Respect absolu du consentement de l'utilisateur.

## 7. Inconvénients et compromis
- Revenus publicitaires non garantis pour la part d'audience utilisant des bloqueurs de publicité.
- Nécessite d'anticiper en CSS des zones de dimensions fixes pour les bannières.

## 8. Conséquences techniques
- Création d'un composant autonome `<AdSlot>` avec slot de secours.
- Les scripts AdSense et CMP sont chargés en mode asynchrone / différé (`defer` / `lazy-hydration`) sans bloquer le rendu critique.

## 9. Conséquences sur la sécurité et la confidentialité
- Cloisonnement étanche : les objets d'état de l'éditeur ne sont pas exposés sur `window` de façon lisible par des scripts tiers.
- Bannière de consentement respectueuse des directives européennes.

## 10. Possibilités de réévaluation
Si le modèle publicitaire display s'avérait insuffisant, des options de mécénat (ex. bouton « Offrez-moi un café » ou sponsors éthiques sous forme d'images statiques directes sans traceurs) pourront être envisagées.
