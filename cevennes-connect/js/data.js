// Données de démonstration pour Cévennes Connect
// Région : Sud Cévennes (25km autour de Ganges)

// Commerces et professionnels
const businesses = [
  {
    id: 1,
    name: "Restaurant Le Ranquet",
    category: "restaurant",
    lat: 43.9344,
    lng: 3.6789,
    address: "Place du Village, 34190 Ganges",
    phone: "04.67.73.85.05",
    email: "contact@leranquet.fr",
    website: null,
    description: "Cuisine traditionnelle cévenole dans un cadre authentique. Spécialités : agneau des Cévennes, châtaignes, miel local.",
    hours: "12h-14h, 19h-22h (fermé dimanche soir et lundi)",
    premium: "gratuit",
    rating: 4.5,
    reviews: 89,
    images: ["restaurant1.jpg"]
  },
  {
    id: 2,
    name: "Boulangerie Pâtisserie Cévenole",
    category: "commerce",
    lat: 43.9320,
    lng: 3.6800,
    address: "2 Rue de la République, 34190 Ganges",
    phone: "04.67.73.82.15",
    email: null,
    website: null,
    description: "Pain artisanal, pâtisseries traditionnelles et spécialités cévenoles. Fougasse aux grattons, canistrelli aux châtaignes.",
    hours: "6h30-19h30 (fermé dimanche après-midi et lundi)",
    premium: "gratuit",
    rating: 4.7,
    reviews: 156,
    images: ["boulangerie1.jpg"]
  },
  {
    id: 3,
    name: "Dr. Marie Dubois - Médecin généraliste",
    category: "sante",
    lat: 43.9360,
    lng: 3.6770,
    address: "5 Avenue des Cévennes, 34190 Ganges",
    phone: "04.67.73.90.12",
    email: "dr.dubois@wanadoo.fr",
    website: null,
    description: "Cabinet de médecine générale. Consultations sur rendez-vous. Urgences acceptées.",
    hours: "8h-12h, 14h-18h (fermé mercredi après-midi et weekend)",
    premium: "gratuit",
    rating: 4.3,
    reviews: 67,
    images: ["cabinet1.jpg"]
  },
  {
    id: 4,
    name: "Garage Martin - Mécanique auto",
    category: "artisan",
    lat: 43.9300,
    lng: 3.6850,
    address: "Route de Montpellier, 34190 Ganges",
    phone: "04.67.73.78.90",
    email: "garage.martin@orange.fr",
    website: null,
    description: "Réparation tous véhicules, contrôle technique, vente de véhicules d'occasion. Spécialiste 4x4 et utilitaires.",
    hours: "8h-12h, 14h-18h (fermé weekend)",
    premium: "premium",
    rating: 4.4,
    reviews: 134,
    images: ["garage1.jpg"]
  },
  {
    id: 5,
    name: "Café de la Place",
    category: "restaurant",
    lat: 43.9340,
    lng: 3.6785,
    address: "1 Place du 8 Mai, 34190 Ganges",
    phone: "04.67.73.81.23",
    email: null,
    website: null,
    description: "Bar-tabac-restaurant. Cuisine familiale, plats du jour. Terrasse ombragée. PMU, journaux.",
    hours: "6h-20h (fermé dimanche)",
    premium: "gratuit",
    rating: 4.1,
    reviews: 201,
    images: ["cafe1.jpg"]
  },
  {
    id: 6,
    name: "Pharmacie des Cévennes",
    category: "sante",
    lat: 43.9350,
    lng: 3.6795,
    address: "12 Rue Victor Hugo, 34190 Ganges",
    phone: "04.67.73.84.67",
    email: "pharmacie.cevennes@orange.fr",
    website: null,
    description: "Pharmacie, parapharmacie, orthopédie. Préparations magistrales. Matériel médical en location.",
    hours: "8h30-12h30, 14h-19h30 (samedi 8h30-19h, fermé dimanche)",
    premium: "gratuit",
    rating: 4.6,
    reviews: 98,
    images: ["pharmacie1.jpg"]
  },
  {
    id: 7,
    name: "Menuiserie Cévennes Bois",
    category: "artisan",
    lat: 43.9280,
    lng: 3.6820,
    address: "Zone Artisanale, 34190 Ganges",
    phone: "04.67.73.92.45",
    email: "cevennes.bois@wanadoo.fr",
    website: "www.cevennesbois.fr",
    description: "Menuiserie traditionnelle et moderne. Aménagements intérieurs, escaliers, mobilier sur mesure.",
    hours: "7h30-12h, 13h30-17h30 (fermé weekend)",
    premium: "premium",
    rating: 4.8,
    reviews: 76,
    images: ["menuiserie1.jpg"]
  },
  {
    id: 8,
    name: "Épicerie Bio Terre et Saveurs",
    category: "commerce",
    lat: 43.9365,
    lng: 3.6775,
    address: "8 Rue des Écoles, 34190 Ganges",
    phone: "04.67.73.97.12",
    email: "terreetSaveurs@gmail.com",
    website: null,
    description: "Produits biologiques locaux, fruits et légumes de saison, produits cévenols artisanaux.",
    hours: "9h-12h30, 15h-19h (fermé dimanche après-midi et lundi matin)",
    premium: "gratuit",
    rating: 4.5,
    reviews: 112,
    images: ["epicerie1.jpg"]
  },
  {
    id: 9,
    name: "Hôtel des Cévennes",
    category: "hebergement",
    lat: 43.9330,
    lng: 3.6790,
    address: "Avenue de la Gare, 34190 Ganges",
    phone: "04.67.73.85.88",
    email: "hotel.cevennes@orange.fr",
    website: "www.hotel-cevennes-ganges.com",
    description: "Hôtel 2 étoiles, 20 chambres climatisées. Restaurant, parking privé. Proche du centre-ville.",
    hours: "24h/24 (réception 7h-22h)",
    premium: "premium",
    rating: 4.2,
    reviews: 189,
    images: ["hotel1.jpg"]
  },
  {
    id: 10,
    name: "Coiffure Tendance",
    category: "sante",
    lat: 43.9355,
    lng: 3.6780,
    address: "4 Rue de la Mairie, 34190 Ganges",
    phone: "04.67.73.89.34",
    email: null,
    website: null,
    description: "Salon de coiffure mixte. Coupe, coloration, permanente. Produits L'Oréal Professionnel.",
    hours: "9h-12h, 14h-18h (fermé dimanche et lundi)",
    premium: "gratuit",
    rating: 4.3,
    reviews: 87,
    images: ["coiffure1.jpg"]
  },
  {
    id: 11,
    name: "Ferme de la Bergerie - Fromages de chèvre",
    category: "commerce",
    lat: 43.9180,
    lng: 3.6950,
    address: "Hameau de la Bergerie, 34190 Moules-et-Baucels",
    phone: "04.67.73.75.23",
    email: "ferme.bergerie@free.fr",
    website: null,
    description: "Fromages fermiers au lait de chèvre. Vente directe à la ferme. Pélardon AOP, yaourts, fromage frais.",
    hours: "17h-19h (mardi, jeudi, samedi)",
    premium: "gratuit",
    rating: 4.9,
    reviews: 65,
    images: ["ferme1.jpg"]
  },
  {
    id: 12,
    name: "Auto-École des Cévennes",
    category: "service_pro",
    lat: 43.9345,
    lng: 3.6805,
    address: "15 Boulevard Gambetta, 34190 Ganges",
    phone: "04.67.73.91.56",
    email: "autoecole.cevennes@gmail.com",
    website: null,
    description: "Permis B, A, AM. Code accéléré, conduite accompagnée. Moniteurs diplômés d'État.",
    hours: "9h-12h, 14h-18h (fermé weekend)",
    premium: "gratuit",
    rating: 4.1,
    reviews: 156,
    images: ["autoecole1.jpg"]
  },
  {
    id: 13,
    name: "Plomberie Chauffage Cévennes",
    category: "artisan",
    lat: 43.9290,
    lng: 3.6830,
    address: "3 Impasse des Artisans, 34190 Ganges",
    phone: "06.12.34.56.78",
    email: "plomberie.cevennes@orange.fr",
    website: null,
    description: "Installation, dépannage, entretien. Chauffage, sanitaire, énergies renouvelables. Dépannage 24h/24.",
    hours: "8h-17h (urgences 24h/24)",
    premium: "premium",
    rating: 4.6,
    reviews: 134,
    images: ["plomberie1.jpg"]
  },
  {
    id: 14,
    name: "Boucherie Charcuterie Moderne",
    category: "commerce",
    lat: 43.9335,
    lng: 3.6785,
    address: "6 Place du Marché, 34190 Ganges",
    phone: "04.67.73.83.45",
    email: null,
    website: null,
    description: "Viandes fraîches, charcuterie artisanale, spécialités régionales. Agneau des Cévennes, saucisson de châtaigne.",
    hours: "8h-12h30, 15h-19h (fermé dimanche après-midi et lundi)",
    premium: "gratuit",
    rating: 4.4,
    reviews: 167,
    images: ["boucherie1.jpg"]
  },
  {
    id: 15,
    name: "Cabinet Vétérinaire Dr. Moreau",
    category: "sante",
    lat: 43.9310,
    lng: 3.6840,
    address: "Route de Saint-Hippolyte, 34190 Ganges",
    phone: "04.67.73.87.91",
    email: "vet.moreau@wanadoo.fr",
    website: null,
    description: "Soins vétérinaires pour animaux domestiques et d'élevage. Urgences, vaccinations, chirurgie.",
    hours: "8h30-12h, 14h-18h30 (samedi matin, urgences 24h/24)",
    premium: "gratuit",
    rating: 4.7,
    reviews: 203,
    images: ["veterinaire1.jpg"]
  },
  {
    id: 16,
    name: "Maison de la Presse",
    category: "commerce",
    lat: 43.9348,
    lng: 3.6788,
    address: "9 Rue de la République, 34190 Ganges",
    phone: "04.67.73.86.12",
    email: null,
    website: null,
    description: "Presse, librairie, papeterie, jeux. Point Mondial Relay. Cartes postales, souvenirs des Cévennes.",
    hours: "7h-12h30, 14h30-19h (dimanche 7h-12h)",
    premium: "gratuit",
    rating: 4.0,
    reviews: 89,
    images: ["presse1.jpg"]
  },
  {
    id: 17,
    name: "Cave Coopérative des Cévennes",
    category: "commerce",
    lat: 43.9250,
    lng: 3.6750,
    address: "Route de Montpellier, 34190 Ganges",
    phone: "04.67.73.80.15",
    email: "cave.cevennes@wanadoo.fr",
    website: "www.cave-cevennes.com",
    description: "Vins des Cévennes, Languedoc. Dégustation, vente directe. Cuvées spéciales, vins biologiques.",
    hours: "9h-12h, 14h-18h30 (fermé dimanche)",
    premium: "premium",
    rating: 4.5,
    reviews: 178,
    images: ["cave1.jpg"]
  },
  {
    id: 18,
    name: "Taxi Cévennes",
    category: "service_pro",
    lat: 43.9340,
    lng: 3.6790,
    address: "Station Place de la Gare, 34190 Ganges",
    phone: "06.78.90.12.34",
    email: "taxi.cevennes@free.fr",
    website: null,
    description: "Transport de personnes 24h/24. Aéroports, gares, excursions. Véhicules climatisés 1 à 8 places.",
    hours: "24h/24, 7j/7",
    premium: "gratuit",
    rating: 4.3,
    reviews: 234,
    images: ["taxi1.jpg"]
  },
  {
    id: 19,
    name: "Électricité Cévennes Service",
    category: "artisan",
    lat: 43.9320,
    lng: 3.6810,
    address: "12 Rue de l'Industrie, 34190 Ganges",
    phone: "04.67.73.94.67",
    email: "elec.cevennes@orange.fr",
    website: null,
    description: "Installation électrique, domotique, éclairage. Dépannage 24h/24. Énergies renouvelables, photovoltaïque.",
    hours: "8h-17h (urgences 24h/24)",
    premium: "premium",
    rating: 4.5,
    reviews: 112,
    images: ["electricite1.jpg"]
  },
  {
    id: 20,
    name: "Pizzeria La Fontaine",
    category: "restaurant",
    lat: 43.9325,
    lng: 3.6795,
    address: "7 Rue de la Fontaine, 34190 Ganges",
    phone: "04.67.73.88.77",
    email: null,
    website: null,
    description: "Pizzas au feu de bois, pâtes fraîches, salades. Terrasse en bord de rivière. Livraison à domicile.",
    hours: "18h30-22h30 (fermé dimanche soir et lundi)",
    premium: "gratuit",
    rating: 4.2,
    reviews: 198,
    images: ["pizzeria1.jpg"]
  }
];

// Événements
const events = [
  {
    id: 1,
    title: "Marché hebdomadaire de Ganges",
    category: "marche",
    date: "2024-10-04",
    time: "08h00-12h00",
    location: "Centre-ville, Ganges",
    lat: 43.9344,
    lng: 3.6789,
    description: "Marché traditionnel avec producteurs locaux, artisans et commerçants. Fruits, légumes, fromages, pain, vêtements.",
    price: "Gratuit",
    organizer: "Mairie de Ganges",
    recurring: "Chaque vendredi",
    contact: "04.67.73.85.20",
    image: "marche1.jpg"
  },
  {
    id: 2,
    title: "Festival des Châtaignes",
    category: "culture",
    date: "2024-10-15",
    time: "10h00-18h00",
    location: "Place du Village, Ganges",
    lat: 43.9344,
    lng: 3.6789,
    description: "Fête traditionnelle autour de la châtaigne. Dégustation, animations, artisanat local, musique cévenole.",
    price: "Gratuit",
    organizer: "Association Cévennes Traditions",
    recurring: null,
    contact: "06.12.34.56.78",
    image: "chataignes1.jpg"
  },
  {
    id: 3,
    title: "Randonnée découverte : Cirque de Navacelles",
    category: "nature",
    date: "2024-10-08",
    time: "09h00-17h00",
    location: "Départ parking mairie, Ganges",
    lat: 43.9344,
    lng: 3.6789,
    description: "Randonnée guidée vers le Cirque de Navacelles (UNESCO). Niveau moyen. Prévoir chaussures de marche et pique-nique.",
    price: "15€ par personne",
    organizer: "Club de Randonnée Cévenol",
    recurring: null,
    contact: "04.67.73.82.90",
    image: "rando1.jpg"
  },
  {
    id: 4,
    title: "Soirée concert : Musique traditionnelle",
    category: "culture",
    date: "2024-10-12",
    time: "20h30-23h00",
    location: "Salle des Fêtes, Ganges",
    lat: 43.9350,
    lng: 3.6785,
    description: "Concert du groupe 'Les Voix Cévenoles'. Chants traditionnels occitans et polyphonies. Bar et restauration sur place.",
    price: "12€ adulte, 8€ enfant",
    organizer: "Mairie de Ganges",
    recurring: null,
    contact: "04.67.73.85.20",
    image: "concert1.jpg"
  },
  {
    id: 5,
    title: "Vide-greniers d'automne",
    category: "famille",
    date: "2024-10-20",
    time: "07h00-17h00",
    location: "Cours de la République, Ganges",
    lat: 43.9340,
    lng: 3.6790,
    description: "Grand vide-greniers organisé par l'école primaire. Plus de 100 exposants. Buvette et restauration.",
    price: "Gratuit visiteurs",
    organizer: "Association Parents d'Élèves",
    recurring: null,
    contact: "06.78.90.12.34",
    image: "videgrenier1.jpg"
  },
  {
    id: 6,
    title: "Atelier cuisine cévenole",
    category: "gastronomie",
    date: "2024-10-18",
    time: "14h00-18h00",
    location: "Restaurant Le Ranquet, Ganges",
    lat: 43.9344,
    lng: 3.6789,
    description: "Apprenez à cuisiner l'agneau des Cévennes et les desserts aux châtaignes. Dégustation incluse.",
    price: "45€ par personne",
    organizer: "Restaurant Le Ranquet",
    recurring: null,
    contact: "04.67.73.85.05",
    image: "cuisine1.jpg"
  },
  {
    id: 7,
    title: "Match de football : Ganges vs Saint-Hippolyte",
    category: "sport",
    date: "2024-10-06",
    time: "15h00-17h00",
    location: "Stade Municipal, Ganges",
    lat: 43.9380,
    lng: 3.6750,
    description: "Championnat régional senior. Buvette et animation musicale. Entrée libre pour tous.",
    price: "Gratuit",
    organizer: "FC Ganges",
    recurring: null,
    contact: "06.45.67.89.01",
    image: "football1.jpg"
  },
  {
    id: 8,
    title: "Exposition peinture : 'Lumières des Cévennes'",
    category: "culture",
    date: "2024-10-10",
    time: "14h00-18h00",
    location: "Mairie, Salle d'exposition, Ganges",
    lat: 43.9345,
    lng: 3.6785,
    description: "Œuvres de l'artiste local Jean Pradier. Paysages cévenols à l'huile et à l'aquarelle. Vernissage le 10 à 18h.",
    price: "Gratuit",
    organizer: "Association Culturelle Gangeoise",
    recurring: "Jusqu'au 31 octobre",
    contact: "04.67.73.85.20",
    image: "expo1.jpg"
  },
  {
    id: 9,
    title: "Cours d'aquagym",
    category: "sport",
    date: "2024-10-07",
    time: "10h00-11h00",
    location: "Piscine municipale, Ganges",
    lat: 43.9360,
    lng: 3.6800,
    description: "Cours d'aquagym tout niveau avec moniteur diplômé. Matériel fourni. Séance d'essai gratuite.",
    price: "8€ la séance",
    organizer: "Centre Aquatique Ganges",
    recurring: "Tous les lundis",
    contact: "04.67.73.87.65",
    image: "aquagym1.jpg"
  },
  {
    id: 10,
    title: "Marché nocturne d'été",
    category: "marche",
    date: "2024-10-25",
    time: "18h00-22h00",
    location: "Place du 8 Mai, Ganges",
    lat: 43.9340,
    lng: 3.6785,
    description: "Marché nocturne avec producteurs locaux, artisans et restaurateurs. Ambiance conviviale, musique live.",
    price: "Gratuit",
    organizer: "Comité des Fêtes",
    recurring: null,
    contact: "06.23.45.67.89",
    image: "marche_nocturne1.jpg"
  },
  {
    id: 11,
    title: "Conférence : Histoire des Cévennes",
    category: "culture",
    date: "2024-11-05",
    time: "18h30-20h00",
    location: "Bibliothèque municipale, Ganges",
    lat: 43.9335,
    lng: 3.6790,
    description: "Conférence de l'historien Michel Rouvière sur l'histoire des Cévennes et des Camisards. Entrée libre.",
    price: "Gratuit",
    organizer: "Société d'Histoire des Cévennes",
    recurring: null,
    contact: "04.67.73.85.20",
    image: "conference1.jpg"
  },
  {
    id: 12,
    title: "Bourse aux jouets",
    category: "famille",
    date: "2024-11-15",
    time: "09h00-17h00",
    location: "Salle polyvalente, Ganges",
    lat: 43.9355,
    lng: 3.6795,
    description: "Bourse aux jouets, livres et vêtements enfants. Dépôt samedi 14 de 14h à 18h. 10% de commission.",
    price: "Gratuit visiteurs",
    organizer: "Association Les P'tits Loups",
    recurring: null,
    contact: "06.34.56.78.90",
    image: "jouets1.jpg"
  },
  {
    id: 13,
    title: "Trail des Cévennes - 15km",
    category: "sport",
    date: "2024-11-10",
    time: "09h00-13h00",
    location: "Départ Place de la Mairie, Ganges",
    lat: 43.9345,
    lng: 3.6785,
    description: "Trail nature 15km à travers les paysages cévenols. Ravitaillement, vestiaires, douches. Inscriptions sur place.",
    price: "20€ inscription",
    organizer: "Running Club Cévennes",
    recurring: null,
    contact: "06.78.90.12.34",
    image: "trail1.jpg"
  },
  {
    id: 14,
    title: "Atelier poterie pour enfants",
    category: "famille",
    date: "2024-11-20",
    time: "14h00-16h00",
    location: "Atelier Terre & Feu, Ganges",
    lat: 43.9330,
    lng: 3.6800,
    description: "Initiation à la poterie pour enfants 6-12 ans. Création d'un objet à emporter. Matériel fourni.",
    price: "25€ par enfant",
    organizer: "Atelier Terre & Feu",
    recurring: "Tous les mercredis",
    contact: "04.67.73.92.14",
    image: "poterie1.jpg"
  },
  {
    id: 15,
    title: "Dégustation vins et fromages",
    category: "gastronomie",
    date: "2024-11-25",
    time: "19h00-22h00",
    location: "Cave Coopérative, Ganges",
    lat: 43.9250,
    lng: 3.6750,
    description: "Soirée dégustation des vins locaux accompagnés de fromages fermiers. Présentation par le sommelier.",
    price: "30€ par personne",
    organizer: "Cave Coopérative des Cévennes",
    recurring: null,
    contact: "04.67.73.80.15",
    image: "degustation1.jpg"
  }
];

// Petites annonces
const listings = [
  {
    id: 1,
    title: "Vélo VTT Giant excellent état",
    category: "sport",
    type: "vente",
    price: 280,
    description: "VTT Giant Talon 2 (2022) peu utilisé, parfait pour les randonnées dans les Cévennes. Révision complète récente chez le concessionnaire. Fourche avant, 21 vitesses. Visible à Ganges.",
    images: ["vtt1.jpg"],
    location: "Ganges",
    contact: "06.12.34.56.78",
    contactName: "Pierre M.",
    date: "2024-09-25",
    views: 67,
    premium: false
  },
  {
    id: 2,
    title: "Table en bois massif + 6 chaises",
    category: "maison",
    type: "vente",
    price: 450,
    description: "Belle table de salle à manger en chêne massif (200x90cm) avec 6 chaises assorties. Quelques rayures d'usage mais très bon état général. Cause déménagement.",
    images: ["table1.jpg"],
    location: "Saint-Hippolyte-du-Fort",
    contact: "marie.dupont@orange.fr",
    contactName: "Marie D.",
    date: "2024-09-20",
    views: 123,
    premium: false
  },
  {
    id: 3,
    title: "Cherche baby-sitter pour garde d'enfants",
    category: "services",
    type: "cherche",
    price: null,
    description: "Famille cherche baby-sitter expérimentée pour garde de 2 enfants (5 et 8 ans) les mercredis et vacances scolaires. Secteur Ganges. Références demandées. 12€/heure.",
    images: [],
    location: "Ganges",
    contact: "06.78.90.12.34",
    contactName: "Sophie L.",
    date: "2024-09-28",
    views: 89,
    premium: true
  },
  {
    id: 4,
    title: "Renault Clio IV - 85 000 km",
    category: "vehicules",
    type: "vente",
    price: 8900,
    description: "Renault Clio IV 1.2 TCE 90ch (2017). Très bon état, entretien suivi en garage. Climatisation, GPS, régulateur de vitesse. CT OK jusqu'en 2025.",
    images: ["clio1.jpg", "clio2.jpg"],
    location: "Ganges",
    contact: "04.67.73.89.45",
    contactName: "Michel R.",
    date: "2024-09-22",
    views: 234,
    premium: true
  },
  {
    id: 5,
    title: "Donne plants de légumes",
    category: "jardin",
    type: "donne",
    price: 0,
    description: "Je donne plants de tomates, courgettes, aubergines et aromates (basilic, persil). Issus de mon potager bio. À venir chercher rapidement.",
    images: ["plants1.jpg"],
    location: "Moules-et-Baucels",
    contact: "06.45.67.89.01",
    contactName: "Jean-Claude B.",
    date: "2024-09-29",
    views: 45,
    premium: false
  },
  {
    id: 6,
    title: "Cours particuliers de mathématiques",
    category: "services",
    type: "propose",
    price: 25,
    description: "Professeur de mathématiques retraité propose cours particuliers collège/lycée. 30 ans d'expérience. Disponible soirs et weekends. 25€/heure.",
    images: [],
    location: "Ganges",
    contact: "jacques.martin@wanadoo.fr",
    contactName: "Jacques M.",
    date: "2024-09-24",
    views: 156,
    premium: false
  },
  {
    id: 7,
    title: "Échange taille de haies contre légumes",
    category: "services",
    type: "echange",
    price: null,
    description: "Propose taille de haies et petits travaux de jardinage contre légumes de saison ou œufs frais. Personne sérieuse avec matériel.",
    images: [],
    location: "Saint-Hippolyte-du-Fort",
    contact: "06.23.45.67.89",
    contactName: "Laurent P.",
    date: "2024-09-26",
    views: 78,
    premium: false
  },
  {
    id: 8,
    title: "iPhone 13 Pro - 128Go",
    category: "high_tech",
    type: "vente",
    price: 650,
    description: "iPhone 13 Pro 128Go bleu alpin. État impeccable, toujours avec coque et verre trempé. Boîte d'origine, chargeur inclus. Cause changement d'opérateur.",
    images: ["iphone1.jpg"],
    location: "Ganges",
    contact: "06.34.56.78.90",
    contactName: "Amélie T.",
    date: "2024-09-27",
    views: 178,
    premium: true
  },
  {
    id: 9,
    title: "Poussette combinée Trio",
    category: "enfants",
    type: "vente",
    price: 180,
    description: "Poussette trio Bébé Confort avec nacelle, cosy auto et châssis. Très peu servie (2ème enfant). Housse de pluie et ombrelle incluses.",
    images: ["poussette1.jpg"],
    location: "Ganges",
    contact: "lisa.dubois@gmail.com",
    contactName: "Lisa D.",
    date: "2024-09-21",
    views: 145,
    premium: false
  },
  {
    id: 10,
    title: "Cherche terrain pour potager",
    category: "immobilier",
    type: "cherche",
    price: null,
    description: "Recherche petit terrain (200-500m²) pour créer potager familial. Secteur Ganges et environs. Possibilité de location ou achat.",
    images: [],
    location: "Ganges",
    contact: "06.67.89.01.23",
    contactName: "Claude F.",
    date: "2024-09-23",
    views: 92,
    premium: false
  },
  {
    id: 11,
    title: "Machine à laver Bosch 8kg",
    category: "electromenager",
    type: "vente",
    price: 320,
    description: "Lave-linge Bosch série 6, 8kg, A+++. Achat il y a 3 ans, très bon état. Programmes éco, délicats, rapide. Cause déménagement à l'étranger.",
    images: ["lavelinge1.jpg"],
    location: "Saint-Hippolyte-du-Fort",
    contact: "04.67.73.91.28",
    contactName: "François G.",
    date: "2024-09-19",
    views: 201,
    premium: false
  },
  {
    id: 12,
    title: "Cours de guitare tous niveaux",
    category: "services",
    type: "propose",
    price: 30,
    description: "Musicien professionnel donne cours de guitare classique, folk, électrique. Tous niveaux, enfants et adultes. Solfège ou tablatures. 30€/h.",
    images: ["guitare1.jpg"],
    location: "Ganges",
    contact: "06.78.90.12.34",
    contactName: "Julien R.",
    date: "2024-09-30",
    views: 67,
    premium: true
  }
];

// Catégories avec icônes et couleurs
const categories = {
  businesses: {
    restaurant: {
      name: "Restaurants & Cafés",
      icon: "🍽️",
      color: "#FF6B35",
      count: () => businesses.filter(b => b.category === 'restaurant').length
    },
    sante: {
      name: "Santé & Bien-être",
      icon: "🏥",
      color: "#4ECDC4",
      count: () => businesses.filter(b => b.category === 'sante').length
    },
    artisan: {
      name: "Artisans & Services",
      icon: "🔧",
      color: "#45B7D1",
      count: () => businesses.filter(b => b.category === 'artisan').length
    },
    commerce: {
      name: "Commerces",
      icon: "🛒",
      color: "#96CEB4",
      count: () => businesses.filter(b => b.category === 'commerce').length
    },
    hebergement: {
      name: "Hébergement",
      icon: "🏨",
      color: "#FFEAA7",
      count: () => businesses.filter(b => b.category === 'hebergement').length
    },
    service_pro: {
      name: "Services Pro",
      icon: "🎓",
      color: "#DDA0DD",
      count: () => businesses.filter(b => b.category === 'service_pro').length
    }
  },
  events: {
    culture: {
      name: "Culture",
      icon: "🎭",
      color: "#9B59B6",
      count: () => events.filter(e => e.category === 'culture').length
    },
    sport: {
      name: "Sport",
      icon: "⚽",
      color: "#E74C3C",
      count: () => events.filter(e => e.category === 'sport').length
    },
    famille: {
      name: "Famille",
      icon: "👨‍👩‍👧‍👦",
      color: "#F39C12",
      count: () => events.filter(e => e.category === 'famille').length
    },
    gastronomie: {
      name: "Gastronomie",
      icon: "🍷",
      color: "#8E44AD",
      count: () => events.filter(e => e.category === 'gastronomie').length
    },
    nature: {
      name: "Nature",
      icon: "🌲",
      color: "#27AE60",
      count: () => events.filter(e => e.category === 'nature').length
    },
    marche: {
      name: "Marchés",
      icon: "🛒",
      color: "#16A085",
      count: () => events.filter(e => e.category === 'marche').length
    }
  },
  listings: {
    vehicules: {
      name: "Véhicules",
      icon: "🚗",
      color: "#3498DB",
      count: () => listings.filter(l => l.category === 'vehicules').length
    },
    immobilier: {
      name: "Immobilier",
      icon: "🏠",
      color: "#E67E22",
      count: () => listings.filter(l => l.category === 'immobilier').length
    },
    high_tech: {
      name: "High-Tech",
      icon: "📱",
      color: "#9B59B6",
      count: () => listings.filter(l => l.category === 'high_tech').length
    },
    maison: {
      name: "Maison & Jardin",
      icon: "🏡",
      color: "#27AE60",
      count: () => listings.filter(l => l.category === 'maison').length
    },
    sport: {
      name: "Sport & Loisirs",
      icon: "🚴‍♂️",
      color: "#E74C3C",
      count: () => listings.filter(l => l.category === 'sport').length
    },
    services: {
      name: "Services",
      icon: "🛠️",
      color: "#34495E",
      count: () => listings.filter(l => l.category === 'services').length
    },
    enfants: {
      name: "Enfants & Bébés",
      icon: "👶",
      color: "#F39C12",
      count: () => listings.filter(l => l.category === 'enfants').length
    },
    jardin: {
      name: "Jardin",
      icon: "🌱",
      color: "#2ECC71",
      count: () => listings.filter(l => l.category === 'jardin').length
    },
    electromenager: {
      name: "Électroménager",
      icon: "🏠",
      color: "#95A5A6",
      count: () => listings.filter(l => l.category === 'electromenager').length
    }
  },
  listingTypes: {
    vente: { name: "Je vends", icon: "💰", color: "#E74C3C" },
    cherche: { name: "Je cherche", icon: "🔍", color: "#3498DB" },
    donne: { name: "Je donne", icon: "🎁", color: "#27AE60" },
    echange: { name: "J'échange", icon: "🔄", color: "#F39C12" },
    propose: { name: "Je propose", icon: "🤝", color: "#9B59B6" }
  }
};

// Statistiques pour la page d'accueil
const stats = {
  businesses: businesses.length,
  events: events.length,
  listings: listings.length,
  users: 847 // Nombre fictif d'utilisateurs inscrits
};

// Configuration Google Maps
const mapConfig = {
  center: { lat: 43.9344, lng: 3.6789 }, // Ganges
  zoom: 11,
  styles: [
    {
      "featureType": "all",
      "elementType": "geometry.fill",
      "stylers": [{"weight": "2.00"}]
    },
    {
      "featureType": "all",
      "elementType": "geometry.stroke",
      "stylers": [{"color": "#9c9c9c"}]
    },
    {
      "featureType": "all",
      "elementType": "labels.text",
      "stylers": [{"visibility": "on"}]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{"color": "#f2f2f2"}]
    },
    {
      "featureType": "landscape",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "poi",
      "elementType": "all",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [{"saturation": -100}, {"lightness": 45}]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#eeeeee"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#7b7b7b"}]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#ffffff"}]
    },
    {
      "featureType": "road.highway",
      "elementType": "all",
      "stylers": [{"visibility": "simplified"}]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels.icon",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{"visibility": "off"}]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{"color": "#46bcec"}, {"visibility": "on"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [{"color": "#c8d7d4"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#070707"}]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#ffffff"}]
    }
  ]
};

// Fonction utilitaires
function formatPrice(price) {
  if (price === 0) return "Gratuit";
  if (price === null || price === undefined) return "Prix sur demande";
  return price.toLocaleString('fr-FR') + "€";
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

function getDistanceFromGanges(lat, lng) {
  const gangesLat = 43.9344;
  const gangesLng = 3.6789;

  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat - gangesLat) * Math.PI / 180;
  const dLon = (lng - gangesLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(gangesLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }

  if (hasHalfStar) {
    stars += '☆';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }

  return stars;
}

// Export des données pour utilisation dans les autres scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    businesses,
    events,
    listings,
    categories,
    stats,
    mapConfig,
    formatPrice,
    formatDate,
    getTimeAgo,
    getDistanceFromGanges,
    generateStars
  };
}