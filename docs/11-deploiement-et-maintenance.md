# Déploiement Statique et Maintenance Opérationnelle — QR Studio

> **Version :** 1.0.0  
> **Statut :** À valider  
> **Rôle :** Procédures de build, hébergement statique, politiques de cache HTTP et exploitation  
> **Date :** 2026-10-27

---

## 1. Principes d'exploitation et hébergement Jamstack

QR Studio est conçu selon l'architecture **Jamstack statique pure** :
- **Aucun serveur d'application à maintenir** (pas d'instance Node.js en continu, pas de serveur PHP, Python ou Ruby).
- **Zéro base de données hébergée**.
- **Coûts d'infrastructure quasi-nuls** : L'intégralité du site peut être distribuée sur un réseau de diffusion de contenu mondial (CDN) via Cloudflare Pages, Vercel, Netlify ou AWS S3/CloudFront.
- **Résilience absolue aux pics de charge** : Le site ne peut pas tomber pour cause de saturation de base de données.

---

## 2. Procédure de compilation et commandes vérifiées

### 2.1. Prérequis d'environnement
- **Node.js** : `>= 18.19.0` ou `>= 20.9.0` (LTS recommandée).
- **Gestionnaire de paquets** : `npm` (`>= 9.0.0`) ou `pnpm` (`>= 8.0.0`).
- **Certificat HTTPS** obligatoire en production (l'API Canvas, le presse-papier et les fonctionnalités modernes du navigateur l'exigent).

### 2.2. Commandes du cycle de déploiement

```bash
# 1. Installation des dépendances figées
npm ci

# 2. Contrôle de typage strict
npm run typecheck

# 3. Exécution de la suite de tests unitaires
npm run test:unit

# 4. Génération statique des pages HTML et bundles optimisés
npm run generate

# 5. Prévisualisation locale du rendu statique produit
npm run preview
```

### 2.3. Structure des artefacts générés
La commande `npm run generate` produit le répertoire `.output/public/` contenant :
- `index.html` (page d'accueil pré-rendue).
- `create/index.html` (éditeur pré-rendu avec skeleton SSR).
- `projects/index.html`.
- `guides/qr-code-wifi/index.html` (et toutes les autres routes éditoriales).
- `_nuxt/` (chunks JavaScript hachés, feuilles de styles CSS minifiées, polices).
- `sitemap.xml` et `robots.txt`.

---

## 3. Configuration des en-têtes HTTP et stratégie de mise en cache

Une politique de cache rigoureuse sur le CDN garantit un chargement instantané pour les utilisateurs tout en permettant des mises à jour immédiates lors d'un nouveau déploiement.

```text
┌────────────────────────────────────────────────────────┐
│ STRATÉGIE DE CACHE HTTP                                │
│                                                        │
│ Fichiers HTML (*.html) :                               │
│ Cache-Control: public, max-age=0, must-revalidate      │
│ -> Toujours frais, vérifié à chaque requête.          │
│                                                        │
│ Assets versionnés (_nuxt/*.js, _nuxt/*.css, images) :  │
│ Cache-Control: public, max-age=31536000, immutable     │
│ -> Mis en cache 1 an sans risque (nom avec hash MD5).  │
└────────────────────────────────────────────────────────┘
```

---

## 4. Variables d'environnement de production

Les variables de build sont injectées via le fichier `.env` ou l'interface de l'hébergeur statique. Aucune clé secrète n'existe dans ce projet puisqu'il n'y a pas de backend :

```bash
# Identifiant public Google AdSense (fourni après validation du compte)
NUXT_PUBLIC_ADSENSE_CLIENT_ID="ca-pub-XXXXXXXXXXXXXXXX"

# URL canonique officielle du site en production
NUXT_PUBLIC_SITE_URL="https://qrstudio.app"
```

---

## 5. Matrice de contrôles post-déploiement (Smoke Tests)

Immédiatement après chaque mise en production :
1. **Contrôle HTTP 200 :** Vérifier que `/`, `/create`, `/projects` et les guides retournent un statut HTTP 200.
2. **Contrôle console navigateur :** Ouvrir `/create` et s'assurer de l'absence totale d'erreur JavaScript dans la console.
3. **Test de création et export nominal :**
   - Saisir une URL et télécharger un PNG.
   - Vérifier que le fichier est intègre et scannable.
4. **Contrôle de l'en-tête de sécurité CSP :** S'assurer que les en-têtes de sécurité sont appliqués sans bloquer le rendu local.
5. **Vérification du sitemap :** Accéder à `https://qrstudio.app/sitemap.xml` et valider la structure XML.

---

## 6. Procédure de retour arrière (Rollback)

Grâce au déploiement statique et à l'immuabilité des builds Git :
- En cas d'anomalie critique détectée en production, le retour à la version précédente s'effectue en **un clic** dans l'interface de l'hébergeur statique (Cloudflare Pages / Vercel / Netlify) en réactivant le déploiement précédent.
- Temps moyen de bascule : **inférieur à 10 secondes**.
- Zéro impact sur les utilisateurs dans la mesure où aucune base de données distante n'a été modifiée.

---

## 7. Maintenance et veille des dépendances

1. **Audit de vulnérabilité :** Exécution hebdomadaire de `npm audit` pour corriger les failles éventuelles sur les dépendances de développement.
2. **Mises à jour majeures :**
   - Toute montée de version de `qr-code-styling`, `dexie` ou `nuxt` doit être testée isolément sur une branche dédiée.
   - Les tests E2E Playwright et le protocole physique de scan doivent être exécutés avant toute fusion sur la branche principale.
