# 🚀 Migration vers Supabase - Instructions

## ✅ Étape 1: Créer les tables dans Supabase

1. Va sur https://supabase.com/dashboard
2. Ouvre ton projet "cevennes-connect"
3. Clique sur "SQL Editor" dans le menu latéral
4. Clique sur "New query"
5. **Copie/colle tout le contenu du fichier `supabase-setup.sql`**
6. Clique sur "Run" (ou Ctrl+Enter)
7. Tu devrais voir: "Success. No rows returned"

## ✅ Étape 2: Migrer les données

1. Assure-toi d'avoir les variables d'environnement localement:
   ```bash
   # Dans cevennes-connect/.env.local
   NEXT_PUBLIC_SUPABASE_URL=ton_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=ta_clef_anon
   SUPABASE_SERVICE_ROLE_KEY=ta_clef_service_role
   ```

2. Installe ts-node si pas déjà fait:
   ```bash
   npm install -g ts-node
   ```

3. Lance le script de migration:
   ```bash
   npx ts-node scripts/migrate-to-supabase.ts
   ```

4. Tu devrais voir:
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

## ✅ Étape 3: Vérifier dans Supabase

1. Va dans "Table Editor" sur Supabase
2. Clique sur la table "events"
3. Tu dois voir tous tes événements
4. Clique sur la table "actors"
5. Tu dois voir tous tes acteurs

## 📝 Prochaines étapes (je m'en occupe)

Une fois que tu confirmes que:
- ✅ Les tables sont créées
- ✅ Les données sont migrées
- ✅ Tu vois les données dans Supabase

Je vais:
1. Adapter toutes les routes API pour utiliser Supabase
2. Mettre à jour l'Artefact IA
3. Mettre à jour les pages de gestion
4. Tester le workflow complet
5. Déployer sur Vercel

## 🆘 En cas de problème

**Problème: "Missing Supabase environment variables"**
→ Vérifie que tu as bien `.env.local` avec les 3 variables

**Problème: "relation 'events' does not exist"**
→ Tu n'as pas exécuté le fichier SQL dans Supabase

**Problème: "duplicate key value violates unique constraint"**
→ Les tables existent déjà. Va dans SQL Editor et lance:
```sql
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS actors CASCADE;
```
Puis relance `supabase-setup.sql`

**Autre problème**
→ Envoie-moi l'erreur exacte et je t'aide !

## 🎯 Avantages de Supabase

✅ **Modifications instantanées** - Plus besoin d'attendre le rebuild Vercel
✅ **Base de données réelle** - PostgreSQL puissant
✅ **Requêtes optimisées** - Index, full-text search
✅ **Scalable** - Supporte des millions de lignes
✅ **Gratuit jusqu'à 500MB** - Largement suffisant
✅ **Backup automatique** - Tes données sont sécurisées
✅ **API temps réel** - Possibilité d'ajouter des features live plus tard
