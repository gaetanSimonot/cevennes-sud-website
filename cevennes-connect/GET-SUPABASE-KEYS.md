# 🔑 Récupérer les clés Supabase

## Étape 1: Aller sur le Dashboard Supabase

1. Va sur https://supabase.com/dashboard
2. Ouvre ton projet **"cevennes-connect"**

## Étape 2: Récupérer les clés API

1. Dans le menu latéral, clique sur **"Settings"** (⚙️ en bas)
2. Clique sur **"API"**
3. Tu verras 3 informations importantes :

### 📍 Project URL
```
https://XXXX.supabase.co
```
→ Copie cette URL (commence par `https://` et termine par `.supabase.co`)

### 🔓 anon / public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
```
→ Copie cette clé (commence par `eyJ...`, très longue)

### 🔐 service_role key (ATTENTION: SECRÈTE!)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
```
→ Copie cette clé (commence par `eyJ...`, très longue, **garde-la secrète**)

## Étape 3: Mettre à jour .env.local

Une fois que tu as les 3 valeurs, remplace-les dans le fichier `.env.local` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Étape 4: Envoie-moi les clés

Envoie-moi simplement :
1. La Project URL
2. La anon key
3. La service_role key

Je les ajouterai dans `.env.local` et lancerai la migration !

---

**Note:** Ces clés sont déjà sur Vercel (tu l'as confirmé), mais on en a besoin localement pour lancer le script de migration.
