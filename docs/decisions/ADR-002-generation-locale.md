# ADR-002 : Génération 100 % Locale dans le Navigateur (Zero-Backend)

> **Statut :** Retenue  
> **Date :** 2026-10-27  
> **Décideurs :** Architecte Logiciel, DPO / Sécurité, Product Owner

---

## 1. Contexte
La plupart des services de QR code envoient les chaînes saisies par les utilisateurs (mots de passe Wi-Fi, coordonnées personnelles vCard, liens secrets) à une API distante qui génère et renvoie l'image matricielle.

## 2. Problème à résoudre
Comment concilier performance instantanée, gratuité totale et garantie absolue de protection de la vie privée ?

## 3. Options évaluées
1. **Option A : API backend distante de génération (ex. Service Node/Go/Sharp)**  
   *Inconvénients :* Risque de fuite de données personnelles (RGPD), latence réseau à chaque frappe de clavier, coûts de serveurs pour absorber le calcul graphique.
2. **Option B : Génération 100 % locale côté client via JavaScript et Canvas/SVG**  
   *Avantages :* Confidentialité mathématiquement garantie (les données ne transitent pas sur le réseau), latence quasi-nulle (< 100 ms), fonctionnement possible hors-ligne, zéro coût de calcul pour l'éditeur du site.

## 4. Décision retenue
**Adoption stricte de l'Option B : Génération 100 % locale dans le navigateur.**

## 5. Raisons de cette décision
- Respect intangible de la promesse de vie privée (« Privacy by Design »).
- Élimination des coûts de serveurs de calcul graphique.
- Expérience utilisateur ultra-réactive en temps réel.

## 6. Avantages
- Zéro fuite de données possible côté réseau.
- Pas de dépendance à la disponibilité d'une API distante.
- Conformité native avec les principes d'éthique des données.

## 7. Inconvénients et compromis
- La puissance de calcul dépend de l'appareil de l'utilisateur (téléphones très anciens).
- Nécessite d'embarquer les bibliothèques de calcul graphique dans le bundle JavaScript client.

## 8. Conséquences techniques
- Utilisation des API Web natives (`HTMLCanvasElement`, `SVGElement`, `Blob`, `URL.createObjectURL`).
- Surveillance de l'empreinte mémoire lors de la manipulation d'images haute résolution (libération des objets Canvas et URLs d'objets).

## 9. Conséquences sur la sécurité et la confidentialité
- Sécurité optimale : le réseau ne peut intercepter aucune donnée saisie.
- Aucun registre de traitement RGPD complexe n'est requis pour les contenus de QR code.

## 10. Possibilités de réévaluation
Non réévaluable : ce principe fait partie intégrante de la proposition de valeur fondamentale de QR Studio.
