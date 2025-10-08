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
- **Google Maps API**
- **OpenAI API** (extraction automatique)
- **GitHub API** (storage des données)

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
│   └── utils.ts         # Fonctions utilitaires
├── data/                # Données JSON
│   ├── actors-data.json # Acteurs locaux
│   └── events-data.json # Événements
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
   GITHUB_TOKEN=ghp_xxxxx
   OPENAI_API_KEY=sk-xxxxx
   GOOGLE_MAPS_API_KEY=AIzaSyxxxxx
   GOOGLE_PLACES_API_KEY=AIzaSyxxxxx
   GITHUB_REPO=username/repo
   ADMIN_PASSWORD=votre_mot_de_passe
   ```

4. **Lancer en développement**
   ```bash
   npm run dev
   ```

5. **Ouvrir http://localhost:3000**

## 📊 Données

Les données sont stockées dans des fichiers JSON dans le dossier `/data/` :

- **actors-data.json** : Annuaire structuré par catégories (commerce, restaurant, artisan, therapeute, service, association)
- **events-data.json** : Liste d'événements avec dates, lieux, catégories

### Système Premium

3 niveaux d'affichage :
- **standard** : Nom uniquement
- **premium** : Carte avec photo
- **mega-premium** : Carte complète + badge animé

## 🔐 Admin

Accès : `/admin`
Mot de passe : défini dans `.env.local` (ADMIN_PASSWORD)

### Artefact IA

L'outil principal pour ajouter du contenu automatiquement :

1. **Texte** : Coller du texte brut (listing événements, etc.)
2. **URL** : Extraire depuis une page web
3. **Screenshot** : Upload image et extraction OCR + IA

L'IA (OpenAI GPT-4) extrait et structure automatiquement les données, puis les commit directement dans les JSON sur GitHub.

### Import Google Places

Import massif depuis Google Places API avec reformulation automatique des descriptions par IA.

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

1. Admin se connecte sur `/admin`
2. Utilise l'Artefact IA (texte/URL/screenshot)
3. IA extrait et structure les données
4. Formulaire se remplit automatiquement
5. Admin vérifie/modifie si besoin
6. Clic "Publier" → Commit JSON sur GitHub
7. Vercel redéploie automatiquement (~30sec)
8. Nouveau contenu visible sur le site

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
