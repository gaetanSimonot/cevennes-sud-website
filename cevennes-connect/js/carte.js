// Cévennes Connect - Gestion de la carte Leaflet + OpenStreetMap
// Intégration Leaflet avec markers personnalisés (remplace Google Maps)

// ==================== VARIABLES GLOBALES ====================

let map;
let markers = [];
let userLocationMarker = null;
let currentFilter = 'all';
let currentFilterType = 'all';
let businessFilterManager;
let eventMarkers = [];
let markersLayer; // Layer group pour les markers

// Configuration de la carte
const mapConfig = {
    center: [43.9344, 3.6789], // Ganges (lat, lng inversés pour Leaflet)
    zoom: 11,
    maxZoom: 18,
    minZoom: 8
};

// ==================== INITIALISATION ====================

function initMap() {
    try {
        console.log('🗺️ Initialisation de Leaflet...');

        // Utiliser la carte existante si elle existe
        if (window.map) {
            console.log('ℹ️ Utilisation de la carte existante');
            map = window.map;
            addBusinessMarkers(); // Ajouter directement les markers
            return;
        }

        const mapContainer = document.getElementById('map');
        console.log('Conteneur carte:', mapContainer);

        if (!mapContainer) {
            throw new Error('Conteneur #map non trouvé');
        }

        // Créer la carte
        console.log('Création de la carte Leaflet...');
        map = L.map('map', {
            center: mapConfig.center,
            zoom: mapConfig.zoom,
            maxZoom: mapConfig.maxZoom,
            minZoom: mapConfig.minZoom,
            zoomControl: true
        });

        console.log('Carte créée, ajout des tuiles...');

        // Ajouter la couche OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://cevennes-connect.fr">Cévennes Connect</a>',
            maxZoom: 18,
            subdomains: 'abc'
        }).addTo(map);

        console.log('Tuiles ajoutées, création du layer group...');

        // Créer le layer group pour les markers
        markersLayer = L.layerGroup().addTo(map);

        console.log('Layer group créé, initialisation du gestionnaire de filtres...');

        // Initialiser le gestionnaire de filtres (optionnel)
        try {
            if (typeof BusinessFilterManager !== 'undefined') {
                businessFilterManager = new BusinessFilterManager(businesses, document.getElementById('business-list'));
            } else {
                console.warn('BusinessFilterManager non disponible');
            }
        } catch (filterError) {
            console.warn('Erreur gestionnaire de filtres:', filterError);
        }

        console.log('Ajout des markers...');

        // Ajouter les markers
        addBusinessMarkers();

        console.log('Markers ajoutés, initialisation des contrôles...');

        // Initialiser les contrôles
        initMapControls();

        console.log('Contrôles initialisés, ajout des event listeners...');

        // Gestionnaires d'événements
        initMapEventListeners();

        // Forcer le redimensionnement de la carte
        setTimeout(() => {
            map.invalidateSize();
            console.log('Carte redimensionnée');
        }, 100);

        console.log('✅ Leaflet initialisé avec succès !');

        // Notification utilisateur
        if (window.CevennesConnect && window.CevennesConnect.showToast) {
            window.CevennesConnect.showToast('Carte chargée !', 'success');
        }

    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de la carte:', error);
        handleMapError(error.message);
    }
}

// ==================== MARKERS ====================

function addBusinessMarkers() {
    try {
        console.log('Ajout des markers de commerces...');

        // Nettoyer les markers existants
        clearMarkers();

        if (!businesses || businesses.length === 0) {
            console.warn('Aucune donnée business disponible');
            return;
        }

        businesses.forEach((business, index) => {
            try {
                const marker = createBusinessMarker(business);
                markers.push(marker);
                markersLayer.addLayer(marker);
            } catch (markerError) {
                console.warn(`Erreur création marker ${index}:`, markerError);
            }
        });

        console.log(`✅ ${markers.length} markers ajoutés à la carte`);
    } catch (error) {
        console.error('Erreur lors de l\'ajout des markers:', error);
    }
}

function createBusinessMarker(business) {
    // Créer l'icône personnalisée selon la catégorie
    const icon = createCustomIcon(business.category, business.premium === 'premium');

    // Créer le marker
    const marker = L.marker([business.lat, business.lng], {
        icon: icon,
        title: business.name,
        zIndexOffset: business.premium === 'premium' ? 1000 : 100
    });

    // Créer le popup
    const popup = createBusinessPopup(business);
    marker.bindPopup(popup, {
        maxWidth: 320,
        className: 'custom-popup'
    });

    // Gestionnaire de clic sur le marker
    marker.on('click', function() {
        // Centrer la carte sur le marker
        map.setView([business.lat, business.lng], Math.max(map.getZoom(), 14));

        // Mettre en évidence dans la sidebar
        highlightBusinessInSidebar(business.id);

        // Tracker l'événement
        if (window.CevennesConnect) {
            window.CevennesConnect.trackEvent('map', 'marker_click', business.name);
        }
    });

    // Stocker les informations du business dans le marker
    marker.businessData = business;

    return marker;
}

function createCustomIcon(category, isPremium) {
    const categoryConfig = categories.businesses[category];
    const color = isPremium ? '#FFD700' : categoryConfig.color;
    const size = isPremium ? 40 : 35;

    // Créer un div HTML personnalisé pour l'icône
    const iconHtml = `
        <div class="custom-marker ${isPremium ? 'premium' : ''}"
             style="width: ${size}px; height: ${size}px; background-color: ${color};
                    display: flex; align-items: center; justify-content: center; color: white;
                    font-size: ${isPremium ? '1.4rem' : '1.2rem'};">
            ${categoryConfig.icon}
        </div>
    `;

    return L.divIcon({
        html: iconHtml,
        className: 'custom-div-icon',
        iconSize: [size, size],
        iconAnchor: [size/2, size],
        popupAnchor: [0, -size]
    });
}

function createBusinessPopup(business) {
    const categoryConfig = categories.businesses[business.category];

    return `
        <div style="max-width: 300px; font-family: 'Inter', sans-serif;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <span style="font-size: 2rem;">${categoryConfig.icon}</span>
                <div>
                    <h3 style="margin: 0; color: var(--color-primary); font-size: 1.2rem;">${business.name}</h3>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                        <span class="badge badge-primary" style="font-size: 0.8rem;">${categoryConfig.name}</span>
                        ${business.premium === 'premium' ? '<span class="badge badge-warning" style="font-size: 0.8rem;"><i class="fas fa-crown"></i> Premium</span>' : ''}
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 12px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="color: var(--color-accent); margin-right: 5px;">${generateStars(business.rating)}</span>
                    <span style="font-size: 0.9rem; color: var(--color-text-light);">${business.rating}/5 (${business.reviews} avis)</span>
                </div>
            </div>

            <p style="margin: 8px 0; color: var(--color-text-light); font-size: 0.9rem;">
                <i class="fas fa-map-marker-alt" style="margin-right: 6px; color: var(--color-primary);"></i>
                ${business.address}
            </p>

            <p style="margin: 8px 0; color: var(--color-text-light); font-size: 0.9rem;">
                <i class="fas fa-clock" style="margin-right: 6px; color: var(--color-primary);"></i>
                ${business.hours}
            </p>

            <p style="margin: 8px 0; color: var(--color-text-dark); font-size: 0.9rem; line-height: 1.4;">
                ${business.description.length > 100 ? business.description.substring(0, 100) + '...' : business.description}
            </p>

            <div style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;">
                <a href="tel:${business.phone}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; text-decoration: none;">
                    <i class="fas fa-phone"></i> Appeler
                </a>
                ${business.website ? `<a href="${business.website}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; text-decoration: none;" target="_blank">
                    <i class="fas fa-globe"></i> Site web
                </a>` : ''}
                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="getDirections(${business.lat}, ${business.lng}, '${business.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-directions"></i> Itinéraire
                </button>
            </div>

            <div style="margin-top: 10px; text-align: center;">
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="showBusinessDetails(${business.id})">
                    <i class="fas fa-info-circle"></i> Plus d'infos
                </button>
            </div>
        </div>
    `;
}

// ==================== CONTRÔLES DE CARTE ====================

function initMapControls() {
    console.log('Initialisation des contrôles...');

    // Contrôles simples sans complications
    try {
        // Ajouter le contrôle de géolocalisation directement au DOM
        const locationButton = document.createElement('button');
        locationButton.innerHTML = '<i class="fas fa-location-arrow"></i> Localiser';
        locationButton.className = 'btn btn-outline';
        locationButton.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            padding: 10px;
        `;
        locationButton.onclick = locateUser;

        const mapContainer = document.getElementById('map');
        mapContainer.appendChild(locationButton);

        // Ajouter les boutons de vue au-dessus de la carte
        const viewToggle = document.createElement('div');
        viewToggle.innerHTML = `
            <button class="btn btn-primary active" onclick="switchMapView('businesses')" style="margin: 0 5px;">
                Commerces
            </button>
            <button class="btn btn-outline" onclick="switchMapView('events')" style="margin: 0 5px;">
                Événements
            </button>
        `;
        viewToggle.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: white;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        `;
        viewToggle.className = 'view-toggle-control';

        mapContainer.appendChild(viewToggle);

        console.log('Contrôles ajoutés avec succès');
    } catch (error) {
        console.warn('Erreur lors de l\'ajout des contrôles:', error);
    }
}

function initMapEventListeners() {
    // Événement de clic sur la carte (fermer popups)
    map.on('click', function() {
        unhighlightAllBusinesses();
    });

    // Événement de zoom
    map.on('zoomend', function() {
        const zoom = map.getZoom();

        // Ajuster la taille des markers selon le zoom
        markers.forEach(marker => {
            const business = marker.businessData;
            const isPremium = business.premium === 'premium';

            // Recréer l'icône avec la nouvelle taille
            const newIcon = createCustomIcon(business.category, isPremium);
            marker.setIcon(newIcon);
        });
    });

    // Événement de changement de vue
    map.on('moveend', function() {
        updateVisibleBusinesses();
    });
}

// ==================== GÉOLOCALISATION ====================

function locateUser() {
    if (!navigator.geolocation) {
        alert('La géolocalisation n\'est pas supportée par votre navigateur.');
        return;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
    };

    navigator.geolocation.getCurrentPosition(
        position => {
            const userLocation = [position.coords.latitude, position.coords.longitude];

            // Supprimer l'ancien marker utilisateur s'il existe
            if (userLocationMarker) {
                map.removeLayer(userLocationMarker);
            }

            // Créer un nouveau marker pour l'utilisateur
            const userIcon = L.divIcon({
                html: '<div style="width: 16px; height: 16px; background-color: #4285F4; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>',
                className: 'user-location-icon',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            userLocationMarker = L.marker(userLocation, {
                icon: userIcon,
                title: 'Votre position',
                zIndexOffset: 2000
            }).addTo(map);

            // Centrer la carte sur l'utilisateur
            map.setView(userLocation, 14);

            // Popup pour l'utilisateur
            userLocationMarker.bindPopup(`
                <div style="text-align: center; padding: 5px;">
                    <h4 style="margin: 0 0 8px 0; color: var(--color-primary);">Vous êtes ici</h4>
                    <p style="margin: 0; font-size: 0.9rem;">Précision: ±${Math.round(position.coords.accuracy)}m</p>
                </div>
            `);

            // Calculer les distances depuis la position utilisateur
            updateDistancesFromUser({ lat: position.coords.latitude, lng: position.coords.longitude });

            if (window.CevennesConnect) {
                window.CevennesConnect.trackEvent('map', 'geolocation_success');
                window.CevennesConnect.showToast('Position trouvée !', 'success');
            }
        },
        error => {
            let message;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Géolocalisation refusée par l\'utilisateur.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Position non disponible.';
                    break;
                case error.TIMEOUT:
                    message = 'Délai de géolocalisation dépassé.';
                    break;
                default:
                    message = 'Erreur de géolocalisation.';
            }

            if (window.CevennesConnect) {
                window.CevennesConnect.showToast(message, 'error');
                window.CevennesConnect.trackEvent('map', 'geolocation_error', error.code.toString());
            } else {
                alert(message);
            }
        },
        options
    );
}

function updateDistancesFromUser(userLocation) {
    // Mettre à jour les distances dans les données business
    businesses.forEach(business => {
        business.distanceFromUser = calculateDistance(
            userLocation.lat, userLocation.lng,
            business.lat, business.lng
        );
    });

    // Recharger la liste avec les distances
    if (window.loadBusinessList) {
        loadBusinessList();
    }
}

// ==================== FILTRAGE ====================

function filterBusinesses() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.querySelector('#category-filters .filter-btn.active').dataset.category;

    let filteredBusinesses = businesses;

    // Filtrer par recherche
    if (searchTerm) {
        filteredBusinesses = filteredBusinesses.filter(business =>
            business.name.toLowerCase().includes(searchTerm) ||
            business.description.toLowerCase().includes(searchTerm) ||
            business.address.toLowerCase().includes(searchTerm)
        );
    }

    // Filtrer par catégorie
    if (category !== 'all') {
        filteredBusinesses = filteredBusinesses.filter(business =>
            business.category === category
        );
    }

    // Afficher/masquer les markers
    markers.forEach(marker => {
        const business = marker.businessData;
        const isVisible = filteredBusinesses.includes(business);

        if (isVisible) {
            markersLayer.addLayer(marker);
        } else {
            markersLayer.removeLayer(marker);
        }
    });

    // Mettre à jour le compteur
    updateResultsCount(filteredBusinesses.length);

    // Ajuster les bounds pour afficher tous les markers visibles
    if (filteredBusinesses.length > 0) {
        fitMapToBounds(filteredBusinesses);
    }
}

function filterByPremium(type) {
    // Réinitialiser les boutons premium
    document.querySelectorAll('[id^="premium-"]').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`premium-${type}`).classList.add('active');

    let filteredBusinesses = businesses;

    if (type === 'premium') {
        filteredBusinesses = businesses.filter(business => business.premium === 'premium');
    } else if (type === 'gratuit') {
        filteredBusinesses = businesses.filter(business => business.premium === 'gratuit');
    }

    // Afficher/masquer les markers
    markers.forEach(marker => {
        const business = marker.businessData;
        const isVisible = filteredBusinesses.includes(business);

        if (isVisible) {
            markersLayer.addLayer(marker);
        } else {
            markersLayer.removeLayer(marker);
        }
    });

    updateResultsCount(filteredBusinesses.length);

    if (filteredBusinesses.length > 0) {
        fitMapToBounds(filteredBusinesses);
    }
}

function resetFilters() {
    // Réinitialiser les champs de recherche
    document.getElementById('search-input').value = '';

    // Réinitialiser les boutons de filtre
    document.querySelectorAll('.filter-btn.active').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('[data-category="all"], [id$="-all"]').forEach(btn => btn.classList.add('active'));

    // Afficher tous les markers
    markers.forEach(marker => markersLayer.addLayer(marker));

    // Mettre à jour le compteur
    updateResultsCount(businesses.length);

    // Recentrer la carte
    map.setView(mapConfig.center, mapConfig.zoom);
}

// ==================== UTILITAIRES ====================

function clearMarkers() {
    markersLayer.clearLayers();
    markers = [];
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('results-count');
    if (resultsCount) {
        resultsCount.textContent = `${count} résultat${count > 1 ? 's' : ''}`;
    }
}

function fitMapToBounds(businessList) {
    if (businessList.length === 0) return;

    const group = new L.featureGroup();

    businessList.forEach(business => {
        group.addLayer(L.marker([business.lat, business.lng]));
    });

    map.fitBounds(group.getBounds(), { padding: [20, 20] });

    // S'assurer que le zoom n'est pas trop élevé
    setTimeout(() => {
        if (map.getZoom() > 16) map.setZoom(16);
    }, 100);
}

function highlightBusinessInSidebar(businessId) {
    // Supprimer les anciens highlights
    unhighlightAllBusinesses();

    // Mettre en évidence le business sélectionné
    const businessCard = document.querySelector(`[data-business-id="${businessId}"]`);
    if (businessCard) {
        businessCard.style.border = '2px solid var(--color-accent)';
        businessCard.style.background = 'rgba(255, 140, 0, 0.1)';
        businessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function unhighlightAllBusinesses() {
    document.querySelectorAll('.business-card').forEach(card => {
        card.style.border = '';
        card.style.background = '';
    });
}

function centerMapOnBusiness(businessId) {
    const business = businesses.find(b => b.id === businessId);
    if (!business) return;

    map.setView([business.lat, business.lng], 15);

    // Trouver et ouvrir le popup correspondant
    const marker = markers.find(m => m.businessData.id === businessId);
    if (marker) {
        marker.openPopup();
    }

    if (window.CevennesConnect) {
        window.CevennesConnect.trackEvent('map', 'center_on_business', business.name);
    }
}

function getDirections(lat, lng, name) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');

    if (window.CevennesConnect) {
        window.CevennesConnect.trackEvent('map', 'get_directions', name);
    }
}

function updateVisibleBusinesses() {
    const bounds = map.getBounds();
    if (!bounds) return;

    let visibleCount = 0;
    markers.forEach(marker => {
        if (markersLayer.hasLayer(marker) && bounds.contains(marker.getLatLng())) {
            visibleCount++;
        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('map-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// ==================== CHANGEMENT DE VUE ====================

function switchMapView(view) {
    // Mettre à jour les boutons
    document.querySelectorAll('.view-toggle-control button').forEach(btn => {
        btn.classList.remove('active', 'btn-primary');
        btn.classList.add('btn-outline');
    });

    const activeButton = document.querySelector(`[onclick="switchMapView('${view}')"]`);
    if (activeButton) {
        activeButton.classList.add('active', 'btn-primary');
        activeButton.classList.remove('btn-outline');
    }

    if (view === 'events') {
        // Masquer les markers de commerces
        markersLayer.clearLayers();

        // Ajouter les markers d'événements
        addEventMarkers();

        // Changer le titre de la sidebar
        const sidebarTitle = document.querySelector('.map-sidebar h3');
        if (sidebarTitle) {
            sidebarTitle.textContent = 'Événements';
        }
    } else {
        // Supprimer les markers d'événements
        removeEventMarkers();

        // Afficher les markers de commerces
        markers.forEach(marker => markersLayer.addLayer(marker));

        // Restaurer le titre de la sidebar
        const sidebarTitle = document.querySelector('.map-sidebar h3');
        if (sidebarTitle) {
            sidebarTitle.textContent = 'Résultats';
        }
    }

    if (window.CevennesConnect) {
        window.CevennesConnect.trackEvent('map', 'view_switch', view);
    }
}

// ==================== ÉVÉNEMENTS ====================

function addEventMarkers() {
    // Nettoyer les markers d'événements existants
    removeEventMarkers();

    events.forEach(event => {
        const marker = createEventMarker(event);
        eventMarkers.push(marker);
        markersLayer.addLayer(marker);
    });

    console.log(`${eventMarkers.length} markers d'événements ajoutés`);
}

function createEventMarker(event) {
    const categoryConfig = categories.events[event.category];

    // Créer une icône différente pour les événements
    const iconHtml = `
        <div style="width: 30px; height: 30px; background-color: ${categoryConfig.color};
                    border: 3px solid white; border-radius: 4px;
                    display: flex; align-items: center; justify-content: center;
                    color: white; font-size: 1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            ${categoryConfig.icon}
        </div>
    `;

    const icon = L.divIcon({
        html: iconHtml,
        className: 'event-div-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const marker = L.marker([event.lat, event.lng], {
        icon: icon,
        title: event.title,
        zIndexOffset: 500
    });

    const popup = createEventPopup(event);
    marker.bindPopup(popup, {
        maxWidth: 320,
        className: 'custom-popup'
    });

    marker.on('click', function() {
        map.setView([event.lat, event.lng], Math.max(map.getZoom(), 14));
    });

    marker.eventData = event;

    return marker;
}

function createEventPopup(event) {
    const categoryConfig = categories.events[event.category];

    return `
        <div style="max-width: 300px; font-family: 'Inter', sans-serif;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                <span style="font-size: 2rem;">${categoryConfig.icon}</span>
                <div>
                    <h3 style="margin: 0; color: var(--color-primary); font-size: 1.2rem;">${event.title}</h3>
                    <span class="badge badge-primary" style="font-size: 0.8rem; margin-top: 4px;">${categoryConfig.name}</span>
                </div>
            </div>

            <p style="margin: 8px 0; color: var(--color-text-light); font-size: 0.9rem;">
                <i class="fas fa-calendar" style="margin-right: 6px; color: var(--color-primary);"></i>
                ${formatDate(event.date)}
            </p>

            <p style="margin: 8px 0; color: var(--color-text-light); font-size: 0.9rem;">
                <i class="fas fa-clock" style="margin-right: 6px; color: var(--color-primary);"></i>
                ${event.time}
            </p>

            <p style="margin: 8px 0; color: var(--color-text-light); font-size: 0.9rem;">
                <i class="fas fa-map-marker-alt" style="margin-right: 6px; color: var(--color-primary);"></i>
                ${event.location}
            </p>

            <p style="margin: 8px 0; color: var(--color-text-dark); font-size: 0.9rem; line-height: 1.4;">
                ${event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}
            </p>

            <div style="margin: 12px 0;">
                <span style="font-weight: 600; color: var(--color-accent);">${event.price}</span>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 15px; flex-wrap: wrap;">
                ${event.contact ? `<a href="tel:${event.contact}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem; text-decoration: none;">
                    <i class="fas fa-phone"></i> Contacter
                </a>` : ''}
                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="getDirections(${event.lat}, ${event.lng}, '${event.title.replace(/'/g, "\\'")}')">
                    <i class="fas fa-directions"></i> Itinéraire
                </button>
            </div>

            <div style="margin-top: 10px; text-align: center;">
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.8rem;" onclick="showEventDetails(${event.id})">
                    <i class="fas fa-info-circle"></i> Plus d'infos
                </button>
            </div>
        </div>
    `;
}

function removeEventMarkers() {
    eventMarkers.forEach(marker => {
        markersLayer.removeLayer(marker);
    });
    eventMarkers = [];
}

// ==================== GESTION D'ERREURS ====================

function handleMapError(error) {
    console.error('Erreur Leaflet:', error);

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: var(--color-background); color: var(--color-text-light); text-align: center; padding: 20px;">
                <div>
                    <i class="fas fa-map-marked-alt" style="font-size: 4rem; color: var(--color-neutral); margin-bottom: 20px;"></i>
                    <h3 style="color: var(--color-text-dark);">Carte non disponible</h3>
                    <p>Impossible de charger la carte.<br>Vérifiez votre connexion internet ou réessayez plus tard.</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Réessayer
                    </button>
                </div>
            </div>
        `;
    }
}

// ==================== INITIALISATION AU CHARGEMENT ====================

// Fonction d'initialisation avec retry
function tryInitMap() {
    console.log('Tentative d\'initialisation de la carte...');

    // Vérifier si Leaflet est chargé
    if (typeof L === 'undefined') {
        console.error('Leaflet n\'est pas encore chargé, retry dans 100ms...');
        setTimeout(tryInitMap, 100);
        return;
    }

    // Vérifier si le conteneur existe
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Conteneur #map non trouvé');
        setTimeout(tryInitMap, 100);
        return;
    }

    // Vérifier si les données sont chargées
    if (typeof businesses === 'undefined') {
        console.error('Données businesses non chargées, retry dans 100ms...');
        setTimeout(tryInitMap, 100);
        return;
    }

    console.log('Conditions réunies, initialisation de la carte...');
    initMap();
}

// Initialiser la carte quand le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM ready, démarrage initialisation carte');
    tryInitMap();
});

// Backup: initialiser aussi quand la page est complètement chargée
window.addEventListener('load', function() {
    console.log('Window load event, vérification si carte initialisée');
    if (!map) {
        console.log('Carte pas encore initialisée, nouvelle tentative');
        tryInitMap();
    }
});

// ==================== EXPORT ====================

// Fonctions disponibles globalement
window.initMap = initMap;
window.locateUser = locateUser;
window.filterBusinesses = filterBusinesses;
window.filterByPremium = filterByPremium;
window.resetFilters = resetFilters;
window.centerMapOnBusiness = centerMapOnBusiness;
window.getDirections = getDirections;
window.toggleSidebar = toggleSidebar;
window.switchMapView = switchMapView;