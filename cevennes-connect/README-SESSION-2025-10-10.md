# 📋 Session du 10 octobre 2025 - État du projet

## 🎯 Objectifs de la session

1. ✅ Finaliser l'extension Chrome pour importer des événements Facebook
2. ✅ Améliorer le géocodage automatique avec contrainte de distance (50km autour de Ganges)
3. ⚠️ Améliorer l'artefact IA (en cours, à revoir demain)

---

## ✅ Ce qui a été fait

### 1. Extension Chrome - Import Facebook Events

**Statut : ✅ Fonctionnel en production**

L'extension Chrome permet d'extraire automatiquement des événements Facebook et de les publier directement sur le site.

#### Workflow final
1. Visiter une page d'événement Facebook
2. Cliquer sur l'extension Chrome → "📥 Extraire cet événement"
3. Cliquer sur "✅ Publier directement sur le site"
4. L'événement apparaît instantanément sur https://cevennes-sud-website.vercel.app/evenements

#### Fichiers concernés
- `/chrome-extension/manifest.json` - Configuration extension
- `/chrome-extension/popup.html` - Interface utilisateur
- `/chrome-extension/popup.js` - Logique extraction + publication
- `/chrome-extension/content.js` - Extraction HTML depuis Facebook (max 100KB)
- `/chrome-extension/background.js` - Service worker
- `/app/api/extract-facebook-event/route.ts` - API extraction OpenAI GPT-4o
- `/app/api/chrome-extension/import-event/route.ts` - API insertion directe Supabase

#### Corrections appliquées
- ✅ Fix payload 413 : extraction ciblée `[role="main"]` au lieu du body complet
- ✅ Fix schéma Supabase : `premium_level` au lieu de `is_premium`
- ✅ Fix Next.js : suppression de `export const config` (déprécié)
- ✅ Fix Supabase client : utilisation de `getSupabaseAdmin()` au lieu de `supabase`
- ✅ URL production par défaut : `https://cevennes-sud-website.vercel.app`

#### Technologies
- Chrome Extension Manifest V3
- OpenAI GPT-4o (extraction structurée depuis HTML)
- Google Geocoding API (coordonnées GPS)
- Supabase (base de données PostgreSQL)

---

### 2. Géocodage intelligent avec rayon 50km

**Statut : ✅ Déployé en production**

#### Problème initial
Les événements étaient géocodés n'importe où en France (ex: Laroque en Lozère → 80km de Ganges)

#### Solution implémentée
Modification de `/app/api/geocode/route.ts` :

```typescript
// Calcul distance Haversine
function calculateDistance(lat1, lng1, lat2, lng2): number {
  // Formule standard de distance entre 2 points GPS
  const R = 6371 // Rayon Terre en km
  // ... calcul
  return distanceEnKm
}

// Validation distance
const GANGES_LAT = 43.9339
const GANGES_LNG = 3.7086
const MAX_DISTANCE_KM = 50

if (distance > MAX_DISTANCE_KM) {
  // Retourne Ganges par défaut
  return { lat: GANGES_LAT, lng: GANGES_LNG, status: 'OUT_OF_RANGE' }
}
```

#### Améliorations
- **Bias géographique** Google Geocoding : `bounds=43.7,3.5|44.2,4.0` (zone Cévennes)
- **Validation distance** : calcul Haversine depuis Ganges
- **Logs détaillés** : distance affichée dans les logs serveur
- **Fallback intelligent** : Ganges par défaut si hors rayon ou échec

#### Où c'est utilisé
- ✅ Artefact IA (texte/screenshot)
- ✅ Extension Chrome Facebook
- ✅ Import Google Places
- ✅ Deep scraping

---

### 3. Migration GPT-4o pour recherche web

**Statut : ✅ Déployé (mais pas fonctionnel comme attendu)**

#### Changements
- Passage de `gpt-4-turbo` → `gpt-4o` dans :
  - `/app/api/extract-facebook-event/route.ts`
  - `/app/admin/artefact-ia/page.tsx`

#### Prompt mis à jour
```
UTILISE LA RECHERCHE WEB pour trouver les coordonnées GPS du lieu mentionné
- Cherche "[nom du lieu] près de Ganges, Cévennes, France" sur Google Maps
- Si le lieu est à plus de 50km de Ganges (43.9339, 3.7086), retourne null
- Retourne les coordonnées exactes trouvées
```

#### ⚠️ Problème identifié
OpenAI ne permet pas la recherche web via l'API standard. Le prompt demandant la recherche web n'a donc aucun effet.

**Solution actuelle :** Le fallback sur `/api/geocode` fonctionne correctement avec validation de distance.

---

## ⚠️ À revoir demain

### Artefact IA - Briefing à refaire

**Problème :**
Le prompt et la logique de l'artefact IA contiennent beaucoup de tests et de logique obsolète.

**Localisation :**
`/app/admin/artefact-ia/page.tsx`

**Ce qui doit être nettoyé :**
1. **Prompt système** (`DEFAULT_PROMPT` ligne 9-104)
   - Trop verbeux
   - Instructions contradictoires
   - Gestion GPS à clarifier (OpenAI ne peut pas faire de recherche web)

2. **Logique de géocodage** (lignes 656-690)
   - Actuellement : essaie d'utiliser lat/lng de l'IA (qui n'existent jamais)
   - Fallback sur `/api/geocode` (qui fonctionne)
   - À simplifier : toujours utiliser `/api/geocode`

3. **Tabs multiples** (texte, URL, image, scraper, facebook, settings)
   - Certains ne sont plus utilisés
   - À simplifier l'interface

**Recommandation :**
- Simplifier le prompt pour extraction pure (sans instructions GPS impossible)
- Toujours passer par `/api/geocode` pour la géolocalisation
- Nettoyer les tabs inutilisés
- Tester avec des vrais cas d'usage

---

## 📊 Architecture actuelle

```
┌─────────────────────────────────────────────────┐
│           SOURCES D'ÉVÉNEMENTS                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Extension Chrome → Facebook Events           │
│     - content.js extrait HTML                    │
│     - popup.js appelle /api/extract-facebook     │
│     - OpenAI GPT-4o parse le HTML                │
│     - /api/chrome-extension/import-event         │
│       → INSERT direct Supabase                   │
│                                                  │
│  2. Artefact IA → Texte/Screenshot               │
│     - User colle texte ou upload image           │
│     - /api/openai avec GPT-4o                    │
│     - /api/geocode pour GPS                      │
│     - Preview → Validation → INSERT              │
│                                                  │
│  3. Deep Scraping → Sites web                    │
│     - URL → cheerio extraction                   │
│     - OpenAI reformulation                       │
│     - /api/geocode                               │
│     - INSERT scraped_events_pending              │
│                                                  │
│  4. Google Places API → Lieux Cévennes           │
│     - Recherche par catégorie                    │
│     - GPS natif Google                           │
│     - Reformulation OpenAI                       │
│     - INSERT direct                              │
│                                                  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│            GÉOCODAGE CENTRALISÉ                  │
├─────────────────────────────────────────────────┤
│  /app/api/geocode/route.ts                       │
│                                                  │
│  1. Google Geocoding API                         │
│     - bias: region=fr                            │
│     - bounds: 43.7,3.5|44.2,4.0 (Cévennes)       │
│                                                  │
│  2. Calcul distance Haversine                    │
│     - Depuis Ganges (43.9339, 3.7086)            │
│     - Max 50km                                   │
│                                                  │
│  3. Fallback                                     │
│     - Si > 50km → Ganges                         │
│     - Si échec → Ganges                          │
│                                                  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│              BASE DE DONNÉES                     │
├─────────────────────────────────────────────────┤
│  Supabase PostgreSQL                             │
│                                                  │
│  Table: events                                   │
│  - id, title, category, description              │
│  - date, time, location, address                 │
│  - lat, lng (validés < 50km de Ganges)           │
│  - price, organizer, contact, website            │
│  - image, premium_level                          │
│  - created_at, updated_at                        │
│                                                  │
│  Table: scraped_events_pending                   │
│  - Événements scrapés en attente validation      │
│                                                  │
└─────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────┐
│            AFFICHAGE PUBLIC                      │
├─────────────────────────────────────────────────┤
│  /app/evenements/page.tsx                        │
│                                                  │
│  - Carte Google Maps interactive                 │
│  - Filtres : catégorie, recherche, dates         │
│  - Liste avec sidebar                            │
│  - Responsive mobile                             │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Variables d'environnement

**Vercel Production :**
```bash
OPENAI_API_KEY=sk-proj-...
GOOGLE_MAPS_API_KEY=AIzaSyCSJRp7NCeKSPiKnezVyJiJFg5dqhbWnyw
NEXT_PUBLIC_SUPABASE_URL=https://xtfaogsnhzpzmjvvhhmy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh... (admin)
```

---

## 📝 Prochaines étapes (demain)

1. **Rebriefer l'artefact IA**
   - Simplifier le prompt
   - Clarifier la logique de géocodage
   - Nettoyer l'interface

2. **Tester l'extension Chrome sur plusieurs événements Facebook**
   - Vérifier la géolocalisation
   - Tester avec événements à Ganges, Montpellier, Nîmes

3. **Documenter les cas d'usage**
   - Guide utilisateur artefact IA
   - Guide installation extension Chrome
   - Guide admin général

4. **Optimisations possibles**
   - Déduplication automatique d'événements
   - Améliorer le matching de catégories
   - Détection automatique premium_level

---

## 🛠️ Commandes utiles

```bash
# Développement local
npm run dev

# Build production
npm run build

# Deploy Vercel
git push origin main

# Vérifier logs Vercel
# → Dashboard Vercel → cevennes-sud-website → Functions logs
```

---

## 📚 Documentation technique

- **Next.js 14 App Router** : https://nextjs.org/docs
- **OpenAI API** : https://platform.openai.com/docs
- **Google Maps APIs** : https://developers.google.com/maps
- **Supabase** : https://supabase.com/docs
- **Chrome Extensions** : https://developer.chrome.com/docs/extensions/

---

## 📞 Contact

Projet : Cévennes Connect
URL Production : https://cevennes-sud-website.vercel.app
Repo GitHub : https://github.com/gaetanSimonot/cevennes-sud-website

---

*Dernière mise à jour : 10 octobre 2025, 22h*
