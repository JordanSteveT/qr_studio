# Spécification Fonctionnelle Détaillée : Gestion des Projets Locaux

> **Module :** `features/local-projects.md`  
> **Statut :** À valider  
> **Exigences couvertes :** `FR-009`, `FR-010`, `FR-011`, `SEC-003`  
> **Dernière révision :** 2026-10-27

---

## 1. Objectif
Permettre aux utilisateurs de sauvegarder, administrer (ouvrir, renommer, dupliquer, supprimer), importer et exporter l'ensemble de leurs projets de QR codes directement dans le navigateur via IndexedDB (Dexie.js), sans nécessiter de compte ni dépendre d'un serveur distant.

---

## 2. Périmètre

### Inclus
- Sauvegarde manuelle et brouillon automatique dans la table IndexedDB `projects`.
- Page de gestion dédiée `/projects` avec vue en grille réactive.
- Génération d'une vignette miniature (128×128 px) pour un affichage rapide dans la liste.
- Actions CRUD complètes : Créer, Ouvrir dans l'éditeur, Renommer, Dupliquer, Supprimer.
- Action globale « Tout effacer » pour réinitialiser la base locale (droit à l'effacement).
- Import et export de projet individuel au format JSON autonome.
- Gestion des migrations de schémas (`schemaVersion`).

### Exclus
- Synchronisation cloud multi-appareils (réservée à une architecture backend distincte).
- Partage de projet via lien public en ligne.

---

## 3. Utilisateur et cas d'utilisation
- **Utilisateur régulier :** Retrouver la semaine suivante la configuration exacte du QR code Wi-Fi de sa résidence secondaire pour en changer le mot de passe sans devoir tout redessiner.
- **Freelance :** Conserver un modèle type de carte de visite pour chaque client et en dupliquer les réglages graphiques en 1 clic.

---

## 4. Prérequis
- Support d'IndexedDB dans le navigateur client.
- Dépendance `dexie` installée.

---

## 5. Parcours utilisateur
1. Depuis l'éditeur `/create`, l'utilisateur clique sur « Enregistrer le projet ».
2. Une modale rapide ou une invite en ligne lui propose de nommer son projet (par défaut : *Wi-Fi - Bureau*).
3. Une notification toast confirme : *« Projet enregistré avec succès ! »*.
4. L'utilisateur clique sur l'onglet « Mes Projets » dans le menu de navigation (`/projects`).
5. La grille affiche la carte du projet avec sa vignette et sa date.
6. En cliquant sur « Ouvrir », le projet est rechargé dans l'éditeur dans son état exact.

---

## 6. Comportement attendu
- L'enregistrement persiste l'intégralité des paramètres de contenu, de design, de cadre, et le fichier binaire du logo (`Blob`).
- L'affichage de la liste des projets est asynchrone et n'occasionne aucun blocage de l'interface même en présence de 50 projets sauvegardés.

---

## 7. Règles métier
1. **Nommage automatique :** Si l'utilisateur ne saisit pas de nom, un titre explicite est dérivé automatiquement du type de contenu et de la date (ex. *« URL - qrstudio.app - 27/10/2026 »*).
2. **Vignette allégée :** Pour éviter de saturer la mémoire vive lors de l'affichage de la liste, une vignette miniature PNG basse résolution (128×128 px) est générée à l'enregistrement et stockée sous forme de DataURL.
3. **Sécurité à la suppression :** Toute suppression de projet exige une confirmation explicite pour éviter les pertes accidentelles, le stockage étant 100 % local sans corbeille distante.

---

## 8. Validations et erreurs
- **Contrôle du quota :** En cas d'erreur `QuotaExceededError` lors d'une tentative de sauvegarde, l'application informe l'utilisateur avec un message clair : *« Espace de stockage navigateur saturé. Veuillez exporter vos projets en JSON ou supprimer d'anciens projets »*.
- **Contrôle de l'import JSON :** Le fichier importé est validé par Zod (`projectImportSchema`). Tout fichier altéré ou non conforme est rejeté avec un message d'erreur pédagogique.

---

## 9. Cas limites
- **Navigateur en mode « Navigation Privée » :** Certains navigateurs restreignent ou effacent IndexedDB à la fermeture de la session. Un bandeau discret informe l'utilisateur que ses projets ne seront pas conservés après la fermeture de la fenêtre privée et l'invite à utiliser l'export JSON.

---

## 10. Interface utilisateur
- Bouton « Enregistrer » dans `EditorHeader` avec état visuel (indicateur de projet modifié non sauvegardé).
- Page `/projects` :
  - Barre d'action supérieure : compteur de projets, bouton « Nouvel export JSON global », bouton rouge « Tout effacer ».
  - Grille de composants `ProjectCard` : vignette, titre éditable, badge de type, date de mise à jour, menu d'actions (Éditer, Dupliquer, Supprimer, Exporter JSON).
  - Composant `ProjectEmptyState` lorsque la base est vide.

---

## 11. Architecture technique

### Composants
- `pages/projects.vue`
- `components/projects/ProjectCard.vue`
- `components/projects/ProjectEmptyState.vue`

### Composables
- `composables/useLocalProjects.ts` : Fonctions réactives `projects`, `isLoading`, `saveProject()`, `deleteProject()`, `duplicateProject()`, `clearAllProjects()`.

### Services
- `services/storage/db.service.ts` : Classe étendant `Dexie` avec schéma de table `projects: '++id, name, schemaVersion, createdAt, updatedAt'`.
- `services/storage/project-storage.service.ts` : Logique métier de persistance et conversion de Blob.

### Types et données
- `QrProjectEntity`, `QrProjectJsonExport` dans `types/project.ts`.

### Dépendances
- `dexie` (v4.x).

---

## 12. Critères d'acceptation
- **CA-PRJ-01 :** Étant donné un projet enregistré avec un logo, lorsque l'utilisateur recharge la page et clique sur « Ouvrir », alors le projet et son logo sont restaurés à 100 % dans l'éditeur.
- **CA-PRJ-02 :** Étant donné un clic sur « Dupliquer », alors une copie indépendante portant la mention *« Copie de ... »* apparaît dans la liste.

---

## 13. Stratégie de tests

### Cas nominaux
- Test unitaire d'insertion, lecture, mise à jour et suppression avec `fake-indexeddb`.
- Test d'export d'un projet en JSON et réimport dans une base vierge.

### Cas d'erreur
- Import d'un fichier JSON dont le `schemaVersion` est invalide : rejet propre avec avertissement.

### Cas limites
- Sauvegarde de 100 projets successifs : contrôle de la fluidité de la liste.

### Non-régression
- Vérification que la suppression d'un projet ne corrompt pas les projets adjacents.

---

## 14. Exigences liées
- `FR-009`, `FR-010`, `FR-011`, `SEC-003`.

---

## 15. Dépendances et risques
- **Risque :** Purge involontaire du cache navigateur par l'utilisateur.
- **Atténuation :** Présence visible de l'option « Exporter en JSON » pour inciter à des sauvegardes de sécurité externes.

---

## 16. Documentation à mettre à jour
- `docs/04-modele-de-donnees.md`.

---

## 17. Questions ouvertes
- *Faut-il limiter le nombre maximal de projets stockés ?* Non, le quota de stockage du navigateur est amplement suffisant (plusieurs centaines de Mo) pour des milliers de configurations texte. Seul le nombre de logos binaires est surveillé.
