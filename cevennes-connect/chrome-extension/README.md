# 🏔️ Cévennes Connect - Extension Chrome

Extension Chrome pour importer automatiquement les événements Facebook vers Cévennes Connect.

## 📦 Installation

### 1. Télécharger l'extension

Le dossier `chrome-extension` contient tous les fichiers nécessaires.

### 2. Installer dans Chrome

1. Ouvrez Chrome et allez sur `chrome://extensions/`
2. Activez le **Mode développeur** (coin supérieur droit)
3. Cliquez sur **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `chrome-extension`
5. L'extension est maintenant installée ! 🎉

### 3. Créer les icônes (temporaire)

Pour l'instant, vous devez créer 3 images PNG dans le dossier `icons/` :
- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Astuce rapide** : Utilisez un emoji 🏔️ ou une image simple pour l'instant.

Vous pouvez utiliser ce site pour générer les icônes rapidement :
- https://www.favicon-generator.org/
- Uploadez n'importe quelle image de montagne/cévennes
- Téléchargez les PNG de différentes tailles

## 🚀 Utilisation

### Workflow complet

1. **Ouvrez un événement Facebook**
   - Allez sur https://facebook.com/events/XXXXXX
   - L'extension détecte automatiquement la page

2. **Cliquez sur l'icône de l'extension**
   - Un popup s'ouvre avec l'interface

3. **Extraire l'événement**
   - Cliquez sur "📥 Extraire cet événement"
   - L'extension va :
     - Extraire le HTML de la page
     - L'envoyer à votre API `/api/extract-facebook-event`
     - Géocoder l'adresse automatiquement
     - Sauvegarder l'événement

4. **Ouvrir l'interface Admin**
   - Cliquez sur "🌐 Ouvrir l'interface Admin"
   - Vous êtes redirigé vers `http://localhost:3004/admin/artefact-ia`
   - L'événement extrait apparaît automatiquement ✅

## ⚙️ Configuration

### Changer l'URL du serveur

Par défaut, l'extension pointe vers `http://localhost:3004`.

Pour changer :
1. Ouvrez le popup de l'extension
2. Modifiez l'URL dans le champ "URL de votre serveur"
3. L'URL est sauvegardée automatiquement

Pour la production :
```
https://cevennes-sud-website.vercel.app
```

## 🎯 Fonctionnalités

✅ **Détection automatique** - Badge vert quand vous êtes sur une page d'événement Facebook
✅ **Extraction intelligente** - Utilise OpenAI GPT-4 pour extraire toutes les données
✅ **Géocodage automatique** - Trouve les coordonnées GPS automatiquement
✅ **Notification visuelle** - Badge "🏔️ Cévennes Connect actif" sur la page Facebook
✅ **Aperçu de l'événement** - Voir les données extraites avant de les envoyer
✅ **Multi-environnement** - Fonctionne en local et en production

## 🔧 Développement

### Structure des fichiers

```
chrome-extension/
├── manifest.json       # Configuration de l'extension
├── popup.html          # Interface du popup
├── popup.js            # Logique du popup
├── content.js          # Script injecté sur Facebook
├── background.js       # Service worker
├── icons/              # Icônes de l'extension
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # Ce fichier
```

### Modifier l'extension

Après modification :
1. Allez sur `chrome://extensions/`
2. Cliquez sur le bouton "🔄 Actualiser" de l'extension
3. Rechargez la page Facebook

### Déboguer

- **Popup** : Clic droit sur le popup → Inspecter
- **Content script** : F12 sur la page Facebook → Console
- **Background** : `chrome://extensions/` → Inspecter les vues : service worker

## 📊 API Utilisées

L'extension communique avec ces endpoints :

- `POST /api/extract-facebook-event` - Extraction avec OpenAI
- `GET /api/geocode?address=...` - Géocodage des adresses

## 🐛 Troubleshooting

### L'extension ne s'affiche pas
- Vérifiez que le Mode développeur est activé
- Rechargez l'extension depuis `chrome://extensions/`

### Badge vert n'apparaît pas
- Vérifiez que vous êtes bien sur `facebook.com/events/XXXXXX`
- Ouvrez la console (F12) pour voir les erreurs

### Erreur d'extraction
- Vérifiez que votre serveur local tourne (`npm run dev`)
- Vérifiez l'URL du serveur dans le popup
- Vérifiez la console pour les détails de l'erreur

### CORS Error
- L'extension contourne les restrictions CORS car elle s'exécute dans le contexte de la page
- Si vous avez toujours une erreur CORS, vérifiez la configuration de votre API

## 🎉 Prochaines étapes

- [ ] Créer les vraies icônes avec le logo Cévennes
- [ ] Ajouter un mode batch (extraire plusieurs événements d'un coup)
- [ ] Ajouter une liste d'historique des événements extraits
- [ ] Publier sur le Chrome Web Store

## 📝 Licence

MIT - Libre d'utilisation
