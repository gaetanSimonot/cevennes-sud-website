# 📊 ANALYSE DU PROJET ACTUEL - MIGRATION NEXT.JS

**Date:** 8 Octobre 2025
**Branche:** refactor-test
**Objectif:** Refactoriser en Next.js 14 avec architecture propre

---

## 🗂️ INVENTAIRE DES FICHIERS

### Pages HTML (28 fichiers)

**Pages Publiques:**
- `index.html` - Page d'accueil
- `acteurs-locaux.html` - Annuaire professionnels/commerces
- `evenements.html` - Calendrier événements
- `echangeons.html` - Petites annonces
- `parlons-en.html` - Forum discussion
- `carte.html` - Carte interactive Google Maps
- `covoiturage.html` - Covoiturage local
- `troc-tout.html` - Troc et services
- `boite-idees.html` - Boîte à idées
- `itineraires-rando.html` - Randonnées
- `panneau-village.html` - Panneau village
- `activites-spontanees.html` - Activités spontanées
- `annonces.html` - Annonces

**Pages Admin:**
- `admin.html` - Dashboard admin
- `admin-add-actor.html` - Ajouter acteur manuel
- `admin-add-event.html` - Ajouter événement manuel
- `admin-event-ai.html` - **ARTEFACT IA** (extraction événements)
- `admin-manage-actors.html` - Gestion acteurs
- `admin-manage-events.html` - Gestion événements
- `admin-import-google.html` - Import Google Places
- `admin-import-google-events.html` - Import Google Events

**Pages Backup/Test:**
- `carte_backup.html`
- `index-new.html`, `index-modern.html`, `index-ultra-modern.html`, `index-final.html`, `index-clean.html`

---

## 📦 STRUCTURE DES DONNÉES

### /data/actors-data.json (468 KB, 8218 lignes)

**Structure:**
```json
{
  "commerce": [
    {
      "name": "string",
      "category": "commerce" | "restaurant" | "artisan" | "therapeute" | "service" | "association",
      "description": "string",
      "address": "string",
      "phone": "string",
      "email": "string",
      "website": "string",
      "horaires": "string",
      "specialites": ["string"],
      "lat": number,
      "lng": number,
      "image": "string (URL)",
      "rating": number,
      "reviews_count": number,
      "premium_level": "standard" | "premium" | "mega-premium"
    }
  ],
  "restaurant": [...],
  "artisan": [...],
  "therapeute": [...],
  "service": [...],
  "association": [...]
}
```

**Catégories:**
- commerce
- restaurant
- artisan
- therapeute
- service
- association

**Niveaux Premium:**
- `standard`: Nom uniquement
- `premium`: Carte avec photo
- `mega-premium`: Carte complète avec badge spécial

### /data/events-data.json (8.7 KB)

**Structure:**
```json
[
  {
    "id": number (timestamp),
    "title": "string",
    "category": "marche" | "culture" | "sport" | "festival" | "atelier" | "theatre",
    "description": "string",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "location": "string",
    "address": "string",
    "price": "string",
    "organizer": "string",
    "contact": "string (email ou tel)",
    "website": "string",
    "image": "string (URL Unsplash)",
    "lat": number,
    "lng": number,
    "premium_level": "standard" | "premium" | "mega-premium"
  }
]
```

**Catégories:**
- marche
- culture
- sport
- festival
- atelier
- theatre

---

## 🔌 API SERVERLESS EXISTANTES

### /api/github-commit.js

**Fonctionnalité:**
- Commit fichiers JSON sur GitHub
- Update ou création de fichiers
- Gère SHA pour updates
- Branch: main

**Endpoint:** `/api/github-commit`
**Method:** POST
**Body:**
```json
{
  "filePath": "cevennes-connect/data/events-data.json",
  "content": "string (JSON stringifié)",
  "commitMessage": "string"
}
```

**Env Variables:**
- `GITHUB_TOKEN`
- `GITHUB_REPO` (default: gaetanSimonot/cevennes-sud-website)

### /api/openai.js

**Fonctionnalité:**
- Proxy OpenAI API
- Extraction et reformulation d'infos
- Protection de la clé API

**Endpoint:** `/api/openai`
**Method:** POST
**Body:**
```json
{
  "messages": [{"role": "system|user|assistant", "content": "string"}],
  "model": "gpt-4o",
  "max_tokens": 1000,
  "temperature": 0.7
}
```

**Env Variables:**
- `OPENAI_API_KEY`

### /api/geocode.js

**Fonctionnalité:**
- Proxy Google Geocoding API
- Conversion adresse → lat/lng
- Protection de la clé API

**Endpoint:** `/api/geocode`
**Method:** GET ou POST
**Params/Body:**
```json
{
  "address": "string"
}
```

**Env Variables:**
- `GOOGLE_MAPS_API_KEY`

---

## 🎨 DESIGN & STYLES

### Palette de Couleurs (par section)

- **Index/Accueil:** Emerald/Teal (vert)
- **Acteurs Locaux:** Purple/Indigo (violet)
- **Événements:** Pink/Purple (rose)
- **Échangeons:** Blue/Cyan (bleu)
- **Parlons-en:** Orange/Red (orange)

### Framework CSS

- **Tailwind CSS** (via CDN actuellement)
- Classes utility-first
- Responsive design (breakpoints standard)
- Animations custom (floating, reveal, etc.)

### Composants visuels

**Cards:**
- Event cards (avec image, badge premium)
- Actor cards (3 niveaux d'affichage selon premium_level)
- Premium badges

**Navigation:**
- Header avec logo + menu desktop
- Dropdown "Utile" (6 sous-menus)
- Menu mobile responsive
- Footer multi-colonnes

**Filtres:**
- Boutons catégories
- Barre recherche
- Toggle vue carte/liste

---

## ⚙️ FONCTIONNALITÉS PRINCIPALES

### 1. Affichage Public

**Acteurs Locaux:**
- Liste/grille de cards
- Filtres par catégorie
- Recherche texte
- Carte Google Maps avec markers
- 3 niveaux d'affichage (standard/premium/mega-premium)

**Événements:**
- Liste chronologique
- Filtres par catégorie
- Tri par date
- Cards événements avec images
- Badges premium

**Carte Interactive:**
- Google Maps
- Markers acteurs + événements
- Clustering
- InfoWindows détaillées
- Filtres par catégorie

### 2. Interface Admin (avec Artefact IA)

**Login:**
- Protection par mot de passe
- Storage local pour session

**Dashboard:**
- Stats (nombre acteurs/événements)
- Liens vers outils

**Artefact IA (admin-event-ai.html) - CŒUR DU SYSTÈME:**

Interface à 3 tabs :

**Tab 1 : Screenshot/Image**
- Drop zone drag & drop
- Upload fichier image
- Preview image
- Bouton "Analyser avec IA"
- OpenAI Vision extrait les infos
- Formulaire se remplit automatiquement
- Détection doublons
- Bouton "Publier sur GitHub"

**Tab 2 : Texte**
- Zone textarea
- Coller du texte brut (listing événements, etc.)
- Bouton "Analyser avec IA"
- OpenAI extrait et structure
- Formulaire se remplit automatiquement
- Détection doublons
- Bouton "Publier sur GitHub"

**Tab 3 : URL/Lien**
- Input URL
- Bouton "Fetch & Analyser"
- Fetch du contenu HTML
- OpenAI extrait les infos
- Formulaire se remplit automatiquement
- Détection doublons
- Bouton "Publier sur GitHub"

**Workflow:**
1. Admin colle contenu (texte/URL/screenshot)
2. Clic "Analyser"
3. OpenAI extrait les données structurées
4. Formulaire se remplit automatiquement
5. Admin vérifie/modifie si besoin
6. Clic "Publier"
7. Détection doublons (prévient si existe)
8. Commit JSON sur GitHub via API
9. Vercel redéploie automatiquement
10. Event/Actor visible sur le site

**Import Google Places (admin-import-google.html):**
- Sélection catégorie
- Slider rayon (km autour de Ganges)
- Bouton "Importer depuis Google"
- Fetch Google Places API
- Pour chaque résultat :
  - OpenAI reformule description
  - Preview de la card
- Sélection multiple des items à garder
- Bouton "Publier sélection"
- Détection doublons
- Commit dans actors-data.json
- Vercel redéploie

**Gestion Manuelle:**
- Formulaires classiques pour ajout
- Édition d'items existants
- Suppression

### 3. Système de Commit GitHub

**Flux:**
1. Admin crée/modifie un item
2. JavaScript côté client prépare le JSON
3. Appel `/api/github-commit` avec :
   - `filePath`: actors-data.json ou events-data.json
   - `content`: nouveau JSON complet (stringifié)
   - `commitMessage`: descriptif
4. API serverless :
   - Fetch SHA du fichier existant
   - Encode content en base64
   - PUT vers GitHub API
   - Retour success/error
5. GitHub déclenche Vercel webhook
6. Vercel redéploie automatiquement
7. Nouveau contenu visible en ~30 secondes

---

## 🔑 VARIABLES D'ENVIRONNEMENT

**Actuellement utilisées (dans Vercel):**
```
GITHUB_TOKEN=ghp_xxxxx
OPENAI_API_KEY=sk-xxxxx
GOOGLE_MAPS_API_KEY=AIzaSyCSJRp7NCeKSPiKnezVyJiJFg5dqhbWnyw
GOOGLE_PLACES_API_KEY=AIzaSyBe9S2a8Afc67NtS9UmvEwOoLt3BFne0eI
GITHUB_REPO=gaetanSimonot/cevennes-sud-website
ADMIN_PASSWORD=??? (à vérifier dans le code)
```

**Clés publiques (dans js/config.js):**
- `GOOGLE_MAPS_API_KEY` (OK car restriction domaine)
- `GOOGLE_PLACES_API_KEY` (OK car restriction domaine)

---

## 🎯 FONCTIONNALITÉS À RECRÉER

### Pages Publiques (Next.js)

✅ **app/page.tsx** - Accueil
- Hero section
- Présentation 3 services
- Stats
- CTA

✅ **app/acteurs-locaux/page.tsx**
- Liste acteurs avec filtres
- Recherche
- Toggle liste/carte
- 3 niveaux d'affichage

✅ **app/evenements/page.tsx**
- Liste événements
- Filtres catégories
- Tri chronologique

✅ **app/carte/page.tsx**
- Google Maps
- Markers acteurs + événements
- Filtres
- InfoWindows

✅ **app/echangeons/page.tsx**
✅ **app/parlons-en/page.tsx**
✅ **app/covoiturage/page.tsx**
✅ **app/troc-tout/page.tsx**
✅ **app/boite-idees/page.tsx**
✅ **app/itineraires-rando/page.tsx**
✅ **app/panneau-village/page.tsx**

### Interface Admin (Next.js)

✅ **app/admin/page.tsx** - Dashboard
- Login form
- Stats
- Navigation vers outils

✅ **app/admin/artefact-ia/page.tsx** - ARTEFACT IA
- 3 tabs (Screenshot/Texte/URL)
- Drop zone images
- Textarea texte
- Input URL
- Bouton "Analyser avec IA"
- Formulaire auto-rempli
- Détection doublons
- Bouton "Publier"

✅ **app/admin/import-google/page.tsx**
- Sélection catégorie
- Slider rayon
- Import Google Places
- Reformulation OpenAI
- Preview résultats
- Sélection multiple
- Détection doublons
- Publish

✅ **app/admin/manage-actors/page.tsx**
✅ **app/admin/manage-events/page.tsx**

### API Routes (Next.js App Router)

✅ **app/api/github-commit/route.ts**
- Garder la logique actuelle
- TypeScript
- Validation Zod

✅ **app/api/openai/route.ts**
- Garder la logique actuelle
- TypeScript

✅ **app/api/geocode/route.ts**
- Garder la logique actuelle
- TypeScript

✅ **app/api/extract/route.ts** (nouveau)
- Endpoint unifié pour extraction IA
- Détecte type (text/url/image)
- Appelle OpenAI
- Retourne JSON structuré

✅ **app/api/google-import/route.ts** (nouveau)
- Import Google Places
- Reformulation OpenAI
- Retourne tableau d'acteurs

---

## 📐 ARCHITECTURE PROPOSÉE

```
cevennes-connect/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Accueil)
│   ├── globals.css
│   ├── acteurs-locaux/
│   │   └── page.tsx
│   ├── evenements/
│   │   └── page.tsx
│   ├── carte/
│   │   └── page.tsx
│   ├── echangeons/
│   │   └── page.tsx
│   ├── parlons-en/
│   │   └── page.tsx
│   ├── covoiturage/
│   │   └── page.tsx
│   ├── troc-tout/
│   │   └── page.tsx
│   ├── boite-idees/
│   │   └── page.tsx
│   ├── itineraires-rando/
│   │   └── page.tsx
│   ├── panneau-village/
│   │   └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx (auth wrapper)
│   │   ├── page.tsx (dashboard)
│   │   ├── artefact-ia/
│   │   │   └── page.tsx
│   │   ├── import-google/
│   │   │   └── page.tsx
│   │   ├── manage-actors/
│   │   │   └── page.tsx
│   │   └── manage-events/
│   │       └── page.tsx
│   └── api/
│       ├── github-commit/
│       │   └── route.ts
│       ├── openai/
│       │   └── route.ts
│       ├── geocode/
│       │   └── route.ts
│       ├── extract/
│       │   └── route.ts
│       └── google-import/
│           └── route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   └── Select.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Container.tsx
│   ├── cards/
│   │   ├── EventCard.tsx
│   │   └── ActorCard.tsx
│   ├── maps/
│   │   └── GoogleMap.tsx
│   └── admin/
│       ├── LoginForm.tsx
│       ├── ArtefactIA.tsx
│       ├── GoogleImport.tsx
│       └── ProtectedRoute.tsx
├── lib/
│   ├── github.ts (commit functions)
│   ├── openai.ts (extraction functions)
│   ├── google.ts (places API)
│   ├── utils.ts (helpers)
│   └── types.ts (TypeScript types)
├── public/
│   └── images/
├── data/
│   ├── actors-data.json ✅ CONSERVER
│   └── events-data.json ✅ CONSERVER
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

---

## 🚨 POINTS CRITIQUES À NE PAS OUBLIER

### 1. Système de Commit GitHub
**DOIT fonctionner exactement comme avant:**
- Admin → Artefact IA → OpenAI → Formulaire → Publish
- Détection doublons avant commit
- Commit JSON sur GitHub main branch
- Message de commit descriptif
- Vercel redéploie automatiquement

### 2. Artefact IA (Cœur du système)
**DOIT conserver:**
- 3 tabs (Screenshot/Texte/URL)
- Interface drag & drop
- Analyse OpenAI automatique
- Remplissage formulaire automatique
- Preview avant publication
- Détection doublons
- Logs en temps réel

### 3. Structure des JSON
**NE PAS modifier:**
- actors-data.json structure (catégories)
- events-data.json structure (array)
- Champs existants
- Format des données

### 4. Niveaux Premium
**Système à 3 niveaux:**
- standard: Nom seul
- premium: Card avec photo
- mega-premium: Card complète + badge

### 5. Google Maps
**Fonctionnalités:**
- Markers acteurs + événements
- Clustering si nombreux points
- InfoWindows avec toutes les infos
- Filtres par catégorie
- Centrage sur Ganges (43.9339, 3.7086)

### 6. Variables d'Environnement
**Toutes à configurer dans Vercel:**
- GITHUB_TOKEN (secret)
- OPENAI_API_KEY (secret)
- GOOGLE_MAPS_API_KEY (peut être public avec restrictions)
- GOOGLE_PLACES_API_KEY (peut être public avec restrictions)
- ADMIN_PASSWORD (secret)
- GITHUB_REPO

---

## 📊 STATISTIQUES

- **28 pages HTML** → **~12 pages Next.js** (avec composants réutilisables)
- **8218 lignes** dans actors-data.json
- **250 événements** environ dans events-data.json
- **6 catégories** acteurs
- **6 catégories** événements
- **3 niveaux** premium
- **3 API routes** existantes à conserver
- **2 nouvelles** API routes à créer

---

## ✅ VALIDATION PRÉ-MIGRATION

- [x] Analyse complète effectuée
- [x] Structure JSON documentée
- [x] API routes identifiées
- [x] Fonctionnalités listées
- [x] Architecture définie
- [x] Points critiques notés

**Prêt pour Phase 2 : Sauvegarde et début de migration**

