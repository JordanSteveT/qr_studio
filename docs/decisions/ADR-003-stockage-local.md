# ADR-003 : Stockage Local des Projets via IndexedDB et Dexie.js

> **Statut :** Retenue  
> **Date :** 2026-10-27  
> **Décideurs :** Architecte Logiciel, Développeur Senior Frontend

---

## 1. Contexte
Pour permettre à l'utilisateur de retrouver ses QR codes lors de visites ultérieures sans créer de compte ni dépendre d'une base de données cloud, l'application doit persister les projets localement sur l'appareil.

## 2. Problème à résoudre
Quelle technologie de stockage navigateur choisir pour stocker des configurations de projets pouvant comporter des logos sous forme binaire ?

## 3. Options évaluées
1. **Option A : `localStorage` pur**  
   *Limites :* Quota restreint (~5 Mo selon les navigateurs), fonctionnement synchrone bloquant le thread principal d'exécution, incapable de stocker efficacement des objets binaires (`Blob`) sans conversion Base64 lourde qui gonfle la taille de 33 %.
2. **Option B : API `IndexedDB` native**  
   *Avantages :* Asynchrone, quota très élevé (plusieurs centaines de Mo), supporte nativement les `Blob`.  
   *Limites :* API bas niveau complexe basée sur des événements (`onsuccess`, `onerror`), très verbeuse et propice aux bugs lors des montées de version de schéma.
3. **Option C : `IndexedDB` abstrait via le wrapper `Dexie.js`**  
   *Avantages :* API moderne basée sur les Promesses/async-await, typage TypeScript strict des tables, gestion intuitive et robuste des migrations de schémas de données, empreinte légère (~20 ko).

## 4. Décision retenue
- **Adoption de l'Option C (`Dexie.js` sur IndexedDB)** pour le stockage structuré des projets, de leurs paramètres et des logos binaires.
- Conservation de `localStorage` uniquement pour les préférences d'interface simples et non critiques (thème sombre, dernier type de QR sélectionné).

## 5. Raisons de cette décision
- Sécurité et fluidité : aucune opération I/O ne bloque l'interface réactive.
- Capacité à stocker des dizaines de projets sans saturer le navigateur.
- Évolutivité simplifiée des modèles de données grâce aux migrations Dexie.

## 6. Avantages
- Fiabilité et robustesse des transactions.
- Support natif des images logos sans artifice de conversion.
- Typage de bout en bout des enregistrements en base.

## 7. Inconvénients et compromis
- Ajout d'une dépendance externe (`dexie`).
- Les données restent locales au navigateur (si l'utilisateur vide son cache de navigation ou change d'ordinateur, les projets ne sont pas transférés automatiquement).

## 8. Conséquences techniques
- Implémentation d'une fonction d'export/import au format JSON autonome pour pallier la volatilité du stockage local et permettre le transfert d'un appareil à l'autre.
- Initialisation de Dexie côté client uniquement.

## 9. Conséquences sur la sécurité et la confidentialité
- Les données restent enfermées dans le bac à sable du domaine de l'utilisateur.
- Possibilité pour l'utilisateur de purger l'intégralité de la base d'un simple clic (« Tout effacer »).

## 10. Possibilités de réévaluation
Si l'application proposait un jour une synchronisation cloud optionnelle pour les utilisateurs professionnels, cette couche locale servirait de cache hors-ligne *offline-first*.
