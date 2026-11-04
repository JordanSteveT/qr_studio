# ADR-001 : Déploiement Statique Pur (SSG / Jamstack)

> **Statut :** Retenue  
> **Date :** 2026-10-27  
> **Décideurs :** Architecte Logiciel, Product Owner

---

## 1. Contexte
QR Studio a pour ambition de fournir un service gratuit, rapide et hautement disponible de génération de QR codes sans dépendre de budgets d'infrastructure élevés et sans risquer des pannes de serveurs applicatifs lors de pics de trafic.

## 2. Problème à résoudre
Quel modèle d'hébergement et de rendu adopter entre :
- Un rendu dynamique côté serveur (SSR avec instance Node.js active en permanence).
- Une application monopage classique rendue uniquement dans le navigateur (SPA brute sans SSR).
- Une génération de site statique au build (SSG - Static Site Generation) distribuée sur CDN.

## 3. Options évaluées
1. **Option A : SSR dynamique (Node.js / Nitro Server)**  
   *Inconvénients :* Nécessite des serveurs toujours actifs, coûts d'hébergement récurrents, vulnérabilité aux attaques par déni de service (DDoS), maintenance d'infrastructures.
2. **Option B : SPA classique (Single Page Application type Vite/Vue)**  
   *Inconvénients :* Très mauvais pour le référencement naturel (SEO) sur les pages éditoriales et guides, car le contenu n'est pas présent dans le HTML initial.
3. **Option C : SSG (Static Site Generation via Nuxt)**  
   *Avantages :* HTML pré-compilé idéal pour les robots de recherche, fichiers statiques distribuables sur n'importe quel CDN mondial gratuit ou à très faible coût (Cloudflare Pages, Vercel, Netlify).

## 4. Décision retenue
**Adoption de l'Option C : Déploiement en Static Site Generation (SSG)** via la commande `nuxt generate`.

## 5. Raisons de cette décision
- Coûts d'hébergement proches de zéro, même en cas de millions de visiteurs mensuels.
- Temps de réponse au premier octet (TTFB) ultra-faible grâce à la mise en cache mondiale sur les nœuds périphériques du CDN.
- Sécurité maximale : aucun serveur web applicatif exécutant du code backend en production.

## 6. Avantages
- Fiabilité et résilience totale.
- Excellentes notes Core Web Vitals.
- Indexabilité parfaite pour le SEO.

## 7. Inconvénients et compromis
- Obligation de compiler l'ensemble des pages lors d'une modification de contenu.
- Nécessite d'isoler strictement le code dépendant du navigateur (`window`, Canvas) pour ne pas casser la compilation Node.js lors du build.

## 8. Conséquences techniques
- Utilisation de balises `<ClientOnly>` avec skeleton loader sur l'éditeur `/create`.
- Toutes les routes publiques doivent être pré-définies ou explorables lors de la phase de crawl du build.

## 9. Conséquences sur la sécurité et la confidentialité
- Surface d'attaque serveur réduite à zéro.
- Pas de base de données à sécuriser sur Internet.

## 10. Possibilités de réévaluation
Si le volume de pages éditoriales venait à dépasser 10 000 articles (nécessitant des temps de compilation excessifs), une architecture ISR (Incremental Static Regeneration) pourrait être envisagée. Pour la v1.0, le SSG standard est optimal.
