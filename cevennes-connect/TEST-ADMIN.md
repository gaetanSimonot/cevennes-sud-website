# 📋 Tests Admin - Cévennes Connect

Date: 2025-10-09
Status: En cours de vérification

## ✅ Tests Backend (API Routes)

### API Events
- ✅ GET `/api/events` - Retourne 20 événements avec pagination
- ✅ GET `/api/events/[id]` - Route existe
- ✅ PUT `/api/events/[id]` - Route existe
- ✅ DELETE `/api/events/[id]` - Route existe
- ✅ POST `/api/bulk-delete` - Route existe

### API Actors
- ⏳ GET `/api/actors` - À tester
- ✅ GET `/api/actors/[id]` - Route existe
- ✅ PUT `/api/actors/[id]` - Route existe
- ✅ DELETE `/api/actors/[id]` - Route existe

### API GitHub/Geocoding
- ✅ POST `/api/github-commit` - Fonctionnel
- ✅ POST `/api/geocode` - Fonctionnel
- ✅ POST `/api/openai` - Fonctionnel

## 🔍 Tests Frontend (Pages Admin)

### Pages de Gestion

#### `/admin/manage-events`
- ✅ Page charge (HTML généré)
- ⚠️ Affiche "Chargement..." indéfiniment
- ✅ Boutons présents: Retour Admin, Nouvel événement
- ✅ Filtres présents: Recherche, Catégorie, Temps
- 🐛 **BUG**: Les données API ne s'affichent pas dans l'UI

#### `/admin/manage-actors`
- ⏳ À tester

### Pages d'Édition

#### `/admin/manage-events/[id]/edit`
- ⏳ À tester
- ✅ Route existe dans le code
- Fonctionnalités attendues:
  - Chargement de l'événement via API
  - Formulaire pré-rempli
  - Bouton Sauvegarder
  - Redirection après succès

#### `/admin/manage-actors/[id]/edit`
- ⏳ À tester

### Pages de Création

#### `/admin/create-event`
- ⏳ À tester
- ✅ Code contient Google Maps integration
- ✅ Code contient Autocomplete
- Fonctionnalités attendues:
  - Formulaire vide
  - Carte Google Maps
  - Géocodage automatique
  - Commit GitHub après création

#### `/admin/create-actor`
- ⏳ À tester
- ✅ Code existe

### Autres Pages Admin

#### `/admin/artefact-ia`
- ✅ Fonctionne complètement
- ✅ Extraction via GPT-4 Vision
- ✅ Géocodage automatique
- ✅ Commit GitHub
- ✅ Éditeur de prompt IA ajouté

#### `/admin/import-google`
- ⏳ À tester
- ✅ Code existe

## 🐛 Bugs Identifiés

### BUG #1: manage-events affiche "Chargement..." indéfiniment
**Statut**: 🔴 Critique
**Impact**: Impossible de gérer les événements
**Cause probable**:
- Hook useEffect ne se déclenche pas correctement
- Erreur silencieuse dans fetchEvents()
- Problème de state management React

**Solution à appliquer**:
1. Ajouter console.log dans useEffect
2. Vérifier les erreurs dans la console navigateur
3. Tester l'appel API direct depuis le composant

## 📝 Tests à Effectuer Manuellement

### Test Workflow Complet Événement

1. **Création**:
   - [ ] Aller sur `/admin/create-event`
   - [ ] Remplir le formulaire
   - [ ] Vérifier la carte Google Maps
   - [ ] Tester l'autocomplete d'adresse
   - [ ] Sauvegarder
   - [ ] Vérifier le commit GitHub

2. **Visualisation**:
   - [ ] Aller sur `/admin/manage-events`
   - [ ] Vérifier que le nouvel événement apparaît
   - [ ] Tester les filtres (catégorie, temps, recherche)
   - [ ] Tester la pagination

3. **Édition**:
   - [ ] Cliquer sur "Éditer" pour un événement
   - [ ] Modifier des champs
   - [ ] Sauvegarder
   - [ ] Vérifier les changements dans la liste

4. **Suppression**:
   - [ ] Cliquer sur "Supprimer"
   - [ ] Confirmer
   - [ ] Vérifier que l'événement disparaît

### Test Workflow Complet Acteur

1. **Création**:
   - [ ] Aller sur `/admin/create-actor`
   - [ ] Remplir le formulaire
   - [ ] Sauvegarder

2. **Gestion**:
   - [ ] Aller sur `/admin/manage-actors`
   - [ ] Vérifier l'affichage
   - [ ] Éditer/Supprimer

## 🎯 Prochaines Actions

1. **Priorité 1**: Débugger manage-events (affichage des données)
2. **Priorité 2**: Tester manage-actors
3. **Priorité 3**: Tester les pages de création
4. **Priorité 4**: Tester l'édition end-to-end

## 💡 Notes

- Les API routes fonctionnent ✅
- Le problème est côté client (React)
- Probable souci de hydration ou useEffect
- Toutes les pages existent dans le code
