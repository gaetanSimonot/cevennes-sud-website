# ✅ Migration Supabase - État d'avancement

## 🎉 TERMINÉ - Code adapté et committé !

Commit: `97028bb` - 🚀 Migration complète vers Supabase

### ✅ Ce qui a été fait

#### 1. Infrastructure Supabase créée
- ✅ `lib/supabase.ts` - Client Supabase + CRUD complet (eventsDB, actorsDB)
- ✅ `supabase-setup.sql` - Schéma PostgreSQL (tables events + actors)
- ✅ `scripts/migrate-to-supabase.ts` - Script de migration JSON → Supabase
- ✅ Installation dépendance @supabase/supabase-js

#### 2. Toutes les routes API adaptées
- ✅ `/api/events` - GET (avec filtres category/search/time/pagination) + **POST (création)**
- ✅ `/api/events/[id]` - GET, PUT, DELETE
- ✅ `/api/actors` - GET (avec filtres category/search/pagination) + **POST (création)**
- ✅ `/api/actors/[id]` - GET, PUT, DELETE
- ✅ `/api/bulk-delete` - Suppression en masse events/actors

#### 3. Pages Admin adaptées
- ✅ **Artefact IA** (`app/admin/artefact-ia/page.tsx`)
  - Charge les événements depuis `/api/events`
  - Vérifie les doublons
  - Crée via `/api/events` (POST)
  - Plus de dépendance à GitHub commits

- ✅ **Import Google Places** (`app/admin/import-google/page.tsx`)
  - Crée directement les acteurs via `/api/actors` (POST)
  - Assigne la bonne catégorie
  - Plus de dépendance à GitHub commits

#### 4. Documentation
- ✅ `MIGRATION-SUPABASE.md` - Instructions complètes pour toi

---

## 🚀 PROCHAINES ÉTAPES (à faire maintenant)

### Étape 1: Créer les tables dans Supabase (5 minutes)

1. Va sur https://supabase.com/dashboard
2. Ouvre ton projet "cevennes-connect"
3. Clique sur "SQL Editor" dans le menu latéral
4. Clique sur "New query"
5. **Copie/colle tout le contenu du fichier `supabase-setup.sql`**
6. Clique sur "Run" (ou Ctrl+Enter)
7. Tu devrais voir: "Success. No rows returned"

### Étape 2: Migrer les données (10 minutes)

1. Assure-toi d'avoir les variables d'environnement **localement** :

   ```bash
   # Édite cevennes-connect/.env.local
   NEXT_PUBLIC_SUPABASE_URL=ton_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_clef_anon
   SUPABASE_SERVICE_ROLE_KEY=ta_clef_service_role
   ```

2. Lance le script de migration :

   ```bash
   npx ts-node scripts/migrate-to-supabase.ts
   ```

3. Tu devrais voir :
   ```
   🚀 Starting migration to Supabase...
   📅 Migrating events...
      Found XX events in JSON
      ✅ Inserted XX/XX events
      🎉 Successfully migrated XX events!

   👤 Migrating actors...
      Found XX actors in JSON
      ✅ Inserted XX/XX actors
      🎉 Successfully migrated XX actors!

   🎉 MIGRATION COMPLETE!
   ```

### Étape 3: Vérifier dans Supabase (2 minutes)

1. Va dans "Table Editor" sur Supabase
2. Clique sur la table "events" → Tu dois voir tous tes événements ✓
3. Clique sur la table "actors" → Tu dois voir tous tes acteurs ✓

### Étape 4: Tester en production (5 minutes)

1. **Les variables d'environnement sont déjà sur Vercel** (tu l'as confirmé)

2. Le code est déjà déployé (commit pushé)

3. Teste la modification d'un événement :
   - Va sur https://cevennes-sud-website.vercel.app/admin/manage-events
   - Modifie un événement
   - Vérifie que la modification apparaît **instantanément** (pas de rebuild !)

4. Teste la création via Artefact IA :
   - Va sur https://cevennes-sud-website.vercel.app/admin/artefact-ia
   - Extrais un événement
   - Clique sur "Ajouter à Supabase"
   - Vérifie qu'il apparaît dans la liste

---

## 🆘 En cas de problème

### Problème: "Missing Supabase environment variables"
→ Vérifie que tu as bien `.env.local` avec les 3 variables

### Problème: "relation 'events' does not exist"
→ Tu n'as pas exécuté le fichier SQL dans Supabase (retour Étape 1)

### Problème: "duplicate key value violates unique constraint"
→ Les tables existent déjà. Va dans SQL Editor et lance :
```sql
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS actors CASCADE;
```
Puis relance `supabase-setup.sql`

### Problème en production: Les modifications ne fonctionnent pas
→ Vérifie que les 3 variables d'environnement sont bien sur Vercel :
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY

---

## 📊 Différences clés avec l'ancien système

| Avant (GitHub + JSON) | Maintenant (Supabase) |
|----------------------|----------------------|
| Modification → Commit GitHub → Rebuild Vercel (5-10 min) | Modification → Supabase → **Instantané !** |
| Fichiers JSON limités | Base de données PostgreSQL puissante |
| Pas de filtres optimisés | Index + Full-text search natifs |
| ~100 requêtes = lent | Millions de lignes = rapide |
| Risque de conflits Git | Pas de conflits possibles |

---

## 🎯 Ce qui reste à faire (optionnel, plus tard)

### Nettoyage (quand tout marche parfaitement)
- [ ] Supprimer `/api/github-commit` (plus utilisé)
- [ ] Backup puis supprimer `public/data/*.json` (données en double)
- [ ] Mettre à jour README pour expliquer Supabase

### Améliorations futures possibles
- [ ] Ajouter authentification Supabase pour l'admin
- [ ] Ajouter des webhooks pour notifs temps réel
- [ ] Implémenter la recherche full-text avancée
- [ ] Ajouter des triggers pour validation automatique

---

## 📝 Notes importantes

1. **Les pages publiques** (`/evenements`, `/acteurs-locaux`) utilisent déjà les API adaptées
   - Elles chargeront automatiquement depuis Supabase après la migration

2. **L'interface utilisateur n'a pas changé**
   - Tout fonctionne exactement pareil visuellement
   - Seul le backend a changé (JSON → Supabase)

3. **Les données JSON restent pour le moment**
   - En backup tant que tu n'as pas confirmé que tout marche
   - À supprimer plus tard une fois sûr à 100%

4. **Vercel redéploiera automatiquement**
   - Le commit déclenche un nouveau build
   - Les nouvelles routes API seront actives automatiquement

---

## 🎉 Avantages immédiats une fois migré

✅ **Modifications instantanées** - Plus besoin d'attendre le rebuild Vercel
✅ **Base de données réelle** - PostgreSQL puissant et scalable
✅ **Requêtes optimisées** - Index, full-text search natifs
✅ **Scalable** - Supporte des millions de lignes sans problème
✅ **Gratuit jusqu'à 500MB** - Largement suffisant pour ton usage
✅ **Backup automatique** - Tes données sont sécurisées
✅ **API temps réel** - Possibilité d'ajouter des features live plus tard

---

**Prochaine action recommandée : Exécute Étape 1 (créer les tables SQL) maintenant ! 🚀**
