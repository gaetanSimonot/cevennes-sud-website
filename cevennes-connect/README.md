# Cévennes Connect

Plateforme locale pour le Sud Cévennes (25km autour de Ganges).

## 🌟 Features

- **Annuaire géolocalisé** : Commerces, restaurants, artisans, thérapeutes
- **Agenda événements** : Marchés, festivals, ateliers, spectacles
- **Petites annonces** : Troc, covoiturage, échanges locaux
- **Interface admin avec IA** : Extraction automatique d'informations depuis texte, URL ou screenshot

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL database)
- **Google Maps API** (cartes interactives)
- **Google Places API** (import automatique)
- **OpenAI GPT-4 Vision** (extraction IA depuis texte/URL/screenshot)

## 📁 Structure du Projet

```
cevennes-connect/
├── app/                    # Pages Next.js (App Router)
│   ├── acteurs-locaux/    # Annuaire professionnels
│   ├── evenements/        # Calendrier événements
│   ├── admin/             # Interface admin
│   │   ├── artefact-ia/  # Extraction IA
│   │   ├── import-google/ # Import Google Places
│   │   └── manage-*/      # Gestion données
│   └── api/               # API Routes
│       ├── github-commit/ # Commit JSON sur GitHub
│       ├── openai/        # Proxy OpenAI API
│       └── geocode/       # Géocodage adresses
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI (Button, Card, Badge, Input)
│   ├── layout/           # Header, Footer
│   └── cards/            # EventCard, ActorCard
├── lib/                  # Utilitaires
│   ├── types.ts         # Types TypeScript
│   ├── utils.ts         # Fonctions utilitaires
│   └── supabase.ts      # Client Supabase
└── public/              # Assets statiques
```

## 🚀 Setup

1. **Clone le repo**
   ```bash
   git clone https://github.com/gaetanSimonot/cevennes-sud-website.git
   cd cevennes-connect
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**

   Créer `.env.local` avec :
   ```
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_KEY=eyJxxx...

   # OpenAI
   OPENAI_API_KEY=sk-xxxxx

   # Google Maps
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxx
   GOOGLE_PLACES_API_KEY=AIzaSyxxxxx
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir http://localhost:3000**

## 📊 Données

Les données sont stockées dans **Supabase** (PostgreSQL) :

- **Table `actors`** : Annuaire structuré par catégories (commerce, restaurant, artisan, therapeute, service, association)
- **Table `events`** : Liste d'événements avec dates, lieux, catégories

### Système Premium

3 niveaux d'affichage différenciés :

#### Événements
- **standard** : Carte compacte (icône + titre + date/lieu)
- **premium** : Carte complète avec image, border jaune, fond gradient
- **mega-premium** : Carte large avec image, border purple, fond gradient, toutes les infos

#### Acteurs (Cartes)
- **standard** : Mini-carte (icône + nom + catégorie)
- **premium** : Carte complète avec image, description, contacts
- **mega-premium** : Carte complète avec image, description, contacts, mise en avant

#### Acteurs (Carte Google Maps)
- **standard** : Petit point (6px, semi-transparent)
- **premium** : Point moyen (10px, border jaune 3px) + tooltip au survol
- **mega-premium** : Gros point (14px, border purple 4px) + tooltip au survol
- Tooltip au survol : image + nom + description + téléphone
- Popup au clic : toutes les infos complètes

### Vue Hybride Carte+Liste

Mode inspiré d'Airbnb :
- Carte sticky à gauche
- Liste scrollable à droite avec cartes acteurs
- Hover sur liste → highlight sur carte
- Synchronisation bidirectionnelle

## 🔐 Admin

Accès : `/admin`

### Pages Admin CRUD

- **Dashboard** : Stats temps réel (acteurs, événements à venir)
- **Gestion Acteurs** : Liste, édition, suppression, bulk delete, pagination (20/page)
- **Gestion Événements** : Liste, édition, suppression, bulk delete, pagination (20/page)
- **Créer Acteur** : Formulaire avec validation + Google Maps autocomplete
- **Créer Événement** : Formulaire avec validation + Google Maps autocomplete
- Tous les changements sont instantanés (Supabase)

### Artefact IA

L'outil principal pour ajouter du contenu automatiquement :

1. **Texte** : Coller du texte brut (listing événements, etc.)
2. **URL** : Extraire depuis une page web
3. **Screenshot** : Upload image et extraction OCR + IA

L'IA (OpenAI GPT-4 Vision) extrait et structure automatiquement les données, puis les ajoute directement dans Supabase.

### Import Google Places

Import massif depuis Google Places API avec reformulation automatique des descriptions par OpenAI GPT-4.

## 🌍 Deploy

Le site se déploie automatiquement sur Vercel à chaque push sur `main`.

**Variables d'environnement Vercel** :
Ajouter toutes les variables de `.env.local` dans les settings Vercel.

## 🔧 Scripts

```bash
npm run dev      # Développement (localhost:3000)
npm run build    # Build production
npm run start    # Lancer build production
npm run lint     # Vérifier ESLint
```

## 📝 Workflow

### Ajout Rapide (Artefact IA)
1. Admin ouvre `/admin/artefact-ia`
2. Colle texte / URL / screenshot
3. IA extrait et structure automatiquement
4. Formulaire se remplit
5. Admin vérifie/modifie
6. Clic "Publier" → Ajouté dans Supabase instantanément
7. Visible immédiatement sur le site (pas de redéploiement)

### Gestion Manuelle
1. Admin ouvre `/admin/manage-actors` ou `/admin/manage-events`
2. Liste paginée avec filtres (catégorie, recherche, temps)
3. Édition directe ou suppression
4. Bulk delete pour suppression multiple
5. Changements instantanés dans Supabase

## 🎨 Thèmes Couleur

- **Index** : Emerald/Teal (vert)
- **Acteurs** : Purple/Indigo (violet)
- **Événements** : Pink/Purple (rose)
- **Échangeons** : Blue/Cyan (bleu)
- **Parlons-en** : Orange/Red (orange)

## 📄 License

© 2025 Cévennes Sud. Tous droits réservés.

## 🤝 Contributeurs

Site développé avec ❤️ pour la communauté locale des Cévennes.

## 📮 Contact

- Email : contact@cevennesud.fr
- Tél : 04 67 73 XX XX
