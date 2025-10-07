#!/usr/bin/env python3
"""
Script pour récupérer les commerces via Google Places API
et générer les fichiers JSON pour acteurs-locaux.html
"""

import requests
import json
import time
import os

# Configuration
GOOGLE_PLACES_API_KEY = 'AIzaSyBe9S2a8Afc67NtS9UmvEwOoLt3BFne0eI'
CENTER = {'lat': 43.9339, 'lng': 3.7086}  # Ganges
RADIUS = 5000  # 5km autour de Ganges

# Mapping des catégories du site vers les types Google Places
CATEGORIES_MAP = {
    'commerce': ['store', 'supermarket', 'convenience_store', 'grocery_or_supermarket', 'shopping_mall'],
    'restaurant': ['restaurant', 'cafe', 'bakery', 'meal_takeaway', 'food'],
    'artisan': ['plumber', 'electrician', 'locksmith', 'roofing_contractor', 'hardware_store'],
    'therapeute': ['physiotherapist', 'spa', 'beauty_salon', 'hair_care', 'dentist', 'doctor'],
    'service': ['car_repair', 'car_dealer', 'gas_station', 'bank', 'post_office', 'laundry'],
    'association': ['community_center', 'local_government_office', 'library']
}


def create_actor_data(place, category):
    """Crée la structure de données pour un acteur local"""
    location = place['geometry']['location']

    # Photo
    photo_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    if place.get('photos'):
        photo_ref = place['photos'][0]['photo_reference']
        photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference={photo_ref}&key={GOOGLE_PLACES_API_KEY}"

    # Horaires
    horaires = 'Horaires non renseignés'
    if place.get('opening_hours') and place['opening_hours'].get('weekday_text'):
        horaires = ', '.join(place['opening_hours']['weekday_text'])

    return {
        'id': place['place_id'],
        'name': place['name'],
        'category': category,
        'description': ', '.join(place.get('types', [])[:3]) if place.get('types') else 'Commerce local',
        'address': place.get('vicinity') or place.get('formatted_address', ''),
        'phone': place.get('formatted_phone_number', 'Non renseigné'),
        'email': '',  # Non disponible via l'API
        'website': place.get('website', ''),
        'horaires': horaires,
        'specialites': place.get('types', [])[:5],
        'lat': location['lat'],
        'lng': location['lng'],
        'image': photo_url,
        'rating': place.get('rating', 0),
        'reviews_count': place.get('user_ratings_total', 0),
        'google_maps_url': place.get('url', f"https://www.google.com/maps/search/?api=1&query={place['name']}&query_place_id={place['place_id']}")
    }


def search_places(place_type):
    """Cherche les commerces par type via Google Places API"""
    url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    params = {
        'location': f"{CENTER['lat']},{CENTER['lng']}",
        'radius': RADIUS,
        'type': place_type,
        'key': GOOGLE_PLACES_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data['status'] == 'OK':
            return data['results']
        else:
            print(f"  ⚠️  Erreur API pour type {place_type}: {data['status']}")
            return []
    except Exception as e:
        print(f"  ❌ Erreur fetch pour type {place_type}: {e}")
        return []


def get_place_details(place_id):
    """Récupère les détails complets d'un lieu"""
    url = 'https://maps.googleapis.com/maps/api/place/details/json'
    params = {
        'place_id': place_id,
        'fields': 'name,formatted_address,formatted_phone_number,website,opening_hours,geometry,types,photos,rating,user_ratings_total,url,vicinity',
        'key': GOOGLE_PLACES_API_KEY
    }

    try:
        response = requests.get(url, params=params)
        data = response.json()

        if data['status'] == 'OK':
            return data['result']
        else:
            print(f"  ⚠️  Erreur détails pour {place_id}: {data['status']}")
            return None
    except Exception as e:
        print(f"  ❌ Erreur fetch détails pour {place_id}: {e}")
        return None


def fetch_all_places():
    """Fonction principale pour récupérer tous les commerces"""
    all_actors = {
        'commerce': [],
        'restaurant': [],
        'artisan': [],
        'therapeute': [],
        'service': [],
        'association': []
    }

    print('🔍 Début de la recherche des commerces autour de Ganges...\n')

    for category, types in CATEGORIES_MAP.items():
        print(f'\n📍 Catégorie: {category.upper()}')
        places_set = set()  # Pour éviter les doublons

        for place_type in types:
            print(f'  Recherche: {place_type}...')
            places = search_places(place_type)

            # Attendre pour respecter les limites de l'API
            time.sleep(0.3)

            for place in places:
                place_id = place['place_id']
                if place_id not in places_set:
                    places_set.add(place_id)

                    # Récupérer les détails complets
                    details = get_place_details(place_id)
                    time.sleep(0.3)

                    if details:
                        actor_data = create_actor_data(details, category)
                        all_actors[category].append(actor_data)
                        print(f"    ✓ {details['name']}")

        print(f'  Total {category}: {len(all_actors[category])} commerces')

    return all_actors


def main():
    """Point d'entrée principal"""
    try:
        # Récupérer les données
        actors = fetch_all_places()

        # Afficher le résumé
        print('\n\n📊 RÉSUMÉ:')
        print('=' * 50)
        total = 0
        for category, items in actors.items():
            count = len(items)
            total += count
            print(f'{category.ljust(15)}: {count} commerces')
        print('=' * 50)
        print(f'{"TOTAL".ljust(15)}: {total} commerces')

        # Créer le dossier data s'il n'existe pas
        os.makedirs('../data', exist_ok=True)

        # Sauvegarder dans un fichier JSON
        output_file = '../data/actors-data.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(actors, f, ensure_ascii=False, indent=2)

        print(f'\n✅ Données sauvegardées dans {output_file}')

    except Exception as e:
        print(f'\n❌ Erreur: {e}')
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
