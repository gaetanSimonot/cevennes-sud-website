// Script pour récupérer les commerces via Google Places API
// et générer les fichiers JSON pour acteurs-locaux.html

const GOOGLE_PLACES_API_KEY = 'AIzaSyBe9S2a8Afc67NtS9UmvEwOoLt3BFne0eI';
const CENTER = { lat: 43.9339, lng: 3.7086 }; // Ganges
const RADIUS = 5000; // 5km autour de Ganges

// Mapping des catégories du site vers les types Google Places
const CATEGORIES_MAP = {
    commerce: ['store', 'supermarket', 'convenience_store', 'grocery_or_supermarket', 'shopping_mall'],
    restaurant: ['restaurant', 'cafe', 'bakery', 'meal_takeaway', 'food'],
    artisan: ['plumber', 'electrician', 'carpenter', 'painter', 'roofing_contractor', 'hardware_store'],
    therapeute: ['physiotherapist', 'spa', 'beauty_salon', 'hair_care', 'dentist', 'doctor'],
    service: ['car_repair', 'car_dealer', 'gas_station', 'bank', 'atm', 'post_office', 'laundry'],
    association: ['community_center', 'local_government_office']
};

// Structure de données pour un acteur local
const createActorData = (place, category) => {
    return {
        id: place.place_id,
        name: place.name,
        category: category,
        description: place.types ? place.types.slice(0, 3).join(', ') : 'Commerce local',
        address: place.vicinity || place.formatted_address || '',
        phone: place.formatted_phone_number || 'Non renseigné',
        email: '', // Non disponible via l'API
        website: place.website || '',
        horaires: place.opening_hours?.weekday_text?.join(', ') || 'Horaires non renseignés',
        specialites: place.types?.slice(0, 5) || [],
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        image: place.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        rating: place.rating || 0,
        reviews_count: place.user_ratings_total || 0,
        google_maps_url: place.url || `https://www.google.com/maps/search/?api=1&query=${place.name}&query_place_id=${place.place_id}`
    };
};

// Fonction pour chercher les commerces par type
async function searchPlaces(type) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${CENTER.lat},${CENTER.lng}&radius=${RADIUS}&type=${type}&key=${GOOGLE_PLACES_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            return data.results;
        } else {
            console.error(`Erreur API pour type ${type}:`, data.status);
            return [];
        }
    } catch (error) {
        console.error(`Erreur fetch pour type ${type}:`, error);
        return [];
    }
}

// Fonction pour obtenir les détails d'un lieu
async function getPlaceDetails(placeId) {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,geometry,types,photos,rating,user_ratings_total,url,vicinity&key=${GOOGLE_PLACES_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK') {
            return data.result;
        } else {
            console.error(`Erreur détails pour ${placeId}:`, data.status);
            return null;
        }
    } catch (error) {
        console.error(`Erreur fetch détails pour ${placeId}:`, error);
        return null;
    }
}

// Fonction principale
async function fetchAllPlaces() {
    const allActors = {
        commerce: [],
        restaurant: [],
        artisan: [],
        therapeute: [],
        service: [],
        association: []
    };

    console.log('🔍 Début de la recherche des commerces autour de Ganges...\n');

    for (const [category, types] of Object.entries(CATEGORIES_MAP)) {
        console.log(`\n📍 Catégorie: ${category.toUpperCase()}`);
        const placesSet = new Set(); // Pour éviter les doublons

        for (const type of types) {
            console.log(`  Recherche: ${type}...`);
            const places = await searchPlaces(type);

            // Attendre un peu pour respecter les limites de l'API
            await new Promise(resolve => setTimeout(resolve, 200));

            for (const place of places) {
                if (!placesSet.has(place.place_id)) {
                    placesSet.add(place.place_id);

                    // Récupérer les détails complets
                    const details = await getPlaceDetails(place.place_id);
                    await new Promise(resolve => setTimeout(resolve, 200));

                    if (details) {
                        const actorData = createActorData(details, category);
                        allActors[category].push(actorData);
                        console.log(`    ✓ ${details.name}`);
                    }
                }
            }
        }

        console.log(`  Total ${category}: ${allActors[category].length} commerces`);
    }

    return allActors;
}

// Exécution
(async () => {
    try {
        const actors = await fetchAllPlaces();

        console.log('\n\n📊 RÉSUMÉ:');
        console.log('====================');
        Object.entries(actors).forEach(([category, list]) => {
            console.log(`${category}: ${list.length} commerces`);
        });
        console.log(`TOTAL: ${Object.values(actors).flat().length} commerces`);

        // Sauvegarder dans un fichier JSON
        const fs = require('fs');
        fs.writeFileSync(
            './data/actors-data.json',
            JSON.stringify(actors, null, 2),
            'utf-8'
        );

        console.log('\n✅ Données sauvegardées dans ./data/actors-data.json');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
})();
