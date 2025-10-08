# 🚨 IMPORTANT: Configurer les variables Supabase sur Vercel

## Problème détecté

Les variables d'environnement Supabase ne sont **PAS configurées sur Vercel**, ce qui fait que :
- ❌ Les API routes retournent encore les anciennes données JSON
- ❌ Les suppressions ne fonctionnent pas vraiment
- ❌ Les modifications ne sont pas persistées

## 🔧 Solution : Ajouter les variables sur Vercel (5 minutes)

### Étape 1: Aller sur Vercel Dashboard

1. Va sur https://vercel.com/gaetansimonot/cevennes-sud-website
2. Clique sur **"Settings"** (en haut)
3. Clique sur **"Environment Variables"** dans le menu latéral

### Étape 2: Ajouter les 3 variables Supabase

**Variable 1:**
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://uhbybckkmtngfiozdqdn.supabase.co
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 2:**
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYnliY2trbXRuZ2Zpb3pkcWRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NTQ2NjEsImV4cCI6MjA3NTUzMDY2MX0.B2HUlY_OX1mfyhXgseoWl4tJbZSBj8mIMDjbL1JBJLM
Environments: ✅ Production ✅ Preview ✅ Development
```

**Variable 3:**
```
Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYnliY2trbXRuZ2Zpb3pkcWRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTk1NDY2MSwiZXhwIjoyMDc1NTMwNjYxfQ.X1Rku24ZAdssF7kBxpemi1b2PmNE0tGYnu36F-mNJnU
Environments: ✅ Production ✅ Preview ✅ Development
```

### Étape 3: Sauvegarder et redéployer

1. Clique sur **"Save"** après chaque variable
2. Une fois les 3 ajoutées, va sur **"Deployments"**
3. Clique sur **"Redeploy"** sur le dernier déploiement
4. OU attends que mon prochain commit déclenche un nouveau déploiement automatique

---

## ⏱️ Timing

Après avoir ajouté les variables :
1. **Vercel va redéployer automatiquement** (2-3 minutes)
2. Les API routes vont maintenant utiliser Supabase
3. Les modifications seront **instantanées** !

---

## ✅ Comment vérifier que ça marche

Une fois les variables ajoutées et le redéploiement terminé :

### Test 1: Vérifier l'API
```bash
curl "https://cevennes-sud-website.vercel.app/api/events?limit=1"
```
→ Devrait retourner des événements avec des IDs numériques séquentiels (1, 2, 3...) au lieu des anciens IDs timestamps

### Test 2: Suppression
1. Va sur /admin/manage-events
2. Supprime un événement
3. **Rafraîchis la page**
4. L'événement doit avoir disparu ✅

### Test 3: Modification
1. Va sur /admin/manage-events
2. Modifie un événement
3. Va sur /evenements
4. La modification doit être visible INSTANTANÉMENT ✅

---

## 🆘 Si ça ne marche toujours pas

### Vérifier les variables
1. Sur Vercel → Settings → Environment Variables
2. **Les 3 variables doivent être présentes**
3. Elles doivent être activées pour **Production**

### Vérifier le déploiement
1. Sur Vercel → Deployments
2. Le dernier déploiement doit être **après** l'ajout des variables
3. Le statut doit être **"Ready"** (vert)

### Vérifier les logs
1. Va sur le dernier déploiement
2. Clique sur **"Functions"**
3. Clique sur une fonction API (ex: `api/events`)
4. Regarde les logs pour voir les erreurs éventuelles

---

## 📝 Pourquoi c'est nécessaire

Les variables d'environnement sont utilisées par :
- `lib/supabase.ts` - Pour se connecter à Supabase
- Toutes les routes API - Pour lire/écrire dans la base de données
- Les pages admin - Pour créer/modifier/supprimer

Sans ces variables :
- ❌ Les API ne peuvent pas se connecter à Supabase
- ❌ Elles retournent les anciennes données JSON (fallback)
- ❌ Les modifications ne sont pas persistées

---

**IMPORTANT:** Une fois les variables ajoutées, tout fonctionnera ! 🎉
