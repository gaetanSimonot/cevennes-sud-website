// Cévennes Connect - Système de filtres et recherche
// Fonctions de filtrage avancées pour tous les types de contenu

// ==================== FILTRES GÉNÉRIQUES ====================

class FilterManager {
    constructor(data, container) {
        this.originalData = [...data];
        this.filteredData = [...data];
        this.container = container;
        this.activeFilters = {
            search: '',
            category: 'all',
            price: { min: 0, max: Infinity },
            location: 'all',
            date: 'all',
            custom: {}
        };
        this.sortBy = 'default';
        this.sortOrder = 'asc';

        // Callbacks
        this.onFilter = null;
        this.onSort = null;
        this.onRender = null;
    }

    // ==================== MÉTHODES DE FILTRAGE ====================

    // Filtrage par texte
    filterBySearch(searchTerm) {
        this.activeFilters.search = searchTerm.toLowerCase().trim();
        this.applyFilters();
        return this;
    }

    // Filtrage par catégorie
    filterByCategory(category) {
        this.activeFilters.category = category;
        this.applyFilters();
        return this;
    }

    // Filtrage par prix
    filterByPrice(min = 0, max = Infinity) {
        this.activeFilters.price = { min, max };
        this.applyFilters();
        return this;
    }

    // Filtrage par lieu
    filterByLocation(location) {
        this.activeFilters.location = location;
        this.applyFilters();
        return this;
    }

    // Filtrage par date
    filterByDate(dateFilter) {
        this.activeFilters.date = dateFilter;
        this.applyFilters();
        return this;
    }

    // Filtre personnalisé
    addCustomFilter(key, value, filterFunction) {
        this.activeFilters.custom[key] = { value, function: filterFunction };
        this.applyFilters();
        return this;
    }

    // Supprimer un filtre personnalisé
    removeCustomFilter(key) {
        delete this.activeFilters.custom[key];
        this.applyFilters();
        return this;
    }

    // ==================== APPLICATION DES FILTRES ====================

    applyFilters() {
        let filtered = [...this.originalData];

        // Filtre de recherche textuelle
        if (this.activeFilters.search) {
            filtered = filtered.filter(item => this.matchesSearch(item, this.activeFilters.search));
        }

        // Filtre de catégorie
        if (this.activeFilters.category !== 'all') {
            filtered = filtered.filter(item => this.matchesCategory(item, this.activeFilters.category));
        }

        // Filtre de prix
        if (this.activeFilters.price.min > 0 || this.activeFilters.price.max < Infinity) {
            filtered = filtered.filter(item => this.matchesPrice(item, this.activeFilters.price));
        }

        // Filtre de lieu
        if (this.activeFilters.location !== 'all') {
            filtered = filtered.filter(item => this.matchesLocation(item, this.activeFilters.location));
        }

        // Filtre de date
        if (this.activeFilters.date !== 'all') {
            filtered = filtered.filter(item => this.matchesDate(item, this.activeFilters.date));
        }

        // Filtres personnalisés
        Object.values(this.activeFilters.custom).forEach(customFilter => {
            filtered = filtered.filter(customFilter.function);
        });

        this.filteredData = filtered;

        // Appliquer le tri
        this.applySorting();

        // Callback de filtrage
        if (this.onFilter) {
            this.onFilter(this.filteredData);
        }

        return this;
    }

    // ==================== MÉTHODES DE CORRESPONDANCE ====================

    matchesSearch(item, searchTerm) {
        const searchFields = this.getSearchFields(item);
        return searchFields.some(field =>
            field && field.toLowerCase().includes(searchTerm)
        );
    }

    matchesCategory(item, category) {
        return item.category === category;
    }

    matchesPrice(item, priceRange) {
        const price = this.getItemPrice(item);
        if (price === null || price === 0) return priceRange.min === 0;
        return price >= priceRange.min && price <= priceRange.max;
    }

    matchesLocation(item, location) {
        const itemLocation = this.getItemLocation(item);
        return itemLocation.toLowerCase().includes(location.toLowerCase());
    }

    matchesDate(item, dateFilter) {
        const itemDate = this.getItemDate(item);
        if (!itemDate) return true;

        const now = new Date();
        const itemDateTime = new Date(itemDate);

        switch (dateFilter) {
            case 'today':
                return this.isSameDay(itemDateTime, now);
            case 'week':
                return this.isThisWeek(itemDateTime, now);
            case 'month':
                return this.isThisMonth(itemDateTime, now);
            case 'upcoming':
                return itemDateTime >= now;
            case 'past':
                return itemDateTime < now;
            default:
                return true;
        }
    }

    // ==================== TRI ====================

    sortBy(field, order = 'asc') {
        this.sortBy = field;
        this.sortOrder = order;
        this.applySorting();
        return this;
    }

    applySorting() {
        if (this.sortBy === 'default') return;

        this.filteredData.sort((a, b) => {
            let valueA = this.getSortValue(a, this.sortBy);
            let valueB = this.getSortValue(b, this.sortBy);

            // Gestion des valeurs nulles
            if (valueA === null && valueB === null) return 0;
            if (valueA === null) return 1;
            if (valueB === null) return -1;

            let result = 0;

            if (typeof valueA === 'string' && typeof valueB === 'string') {
                result = valueA.localeCompare(valueB, 'fr', { numeric: true });
            } else if (typeof valueA === 'number' && typeof valueB === 'number') {
                result = valueA - valueB;
            } else if (valueA instanceof Date && valueB instanceof Date) {
                result = valueA - valueB;
            } else {
                result = String(valueA).localeCompare(String(valueB));
            }

            return this.sortOrder === 'desc' ? -result : result;
        });

        // Callback de tri
        if (this.onSort) {
            this.onSort(this.filteredData, this.sortBy, this.sortOrder);
        }
    }

    // ==================== MÉTHODES D'EXTRACTION DE DONNÉES ====================

    getSearchFields(item) {
        // À surcharger selon le type d'élément
        const fields = [];

        if (item.name) fields.push(item.name);
        if (item.title) fields.push(item.title);
        if (item.description) fields.push(item.description);
        if (item.location) fields.push(item.location);
        if (item.address) fields.push(item.address);
        if (item.organizer) fields.push(item.organizer);
        if (item.contactName) fields.push(item.contactName);

        return fields;
    }

    getItemPrice(item) {
        return item.price || 0;
    }

    getItemLocation(item) {
        return item.location || item.address || '';
    }

    getItemDate(item) {
        return item.date || item.created_at || null;
    }

    getSortValue(item, field) {
        switch (field) {
            case 'name':
            case 'title':
                return item.name || item.title || '';
            case 'price':
                return this.getItemPrice(item);
            case 'date':
                const date = this.getItemDate(item);
                return date ? new Date(date) : null;
            case 'location':
                return this.getItemLocation(item);
            case 'rating':
                return item.rating || 0;
            case 'views':
                return item.views || 0;
            case 'reviews':
                return item.reviews || 0;
            default:
                return item[field] || '';
        }
    }

    // ==================== UTILITAIRES DATE ====================

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    isThisWeek(date, now) {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche
        endOfWeek.setHours(23, 59, 59, 999);

        return date >= startOfWeek && date <= endOfWeek;
    }

    isThisMonth(date, now) {
        return date.getMonth() === now.getMonth() &&
               date.getFullYear() === now.getFullYear();
    }

    // ==================== RÉINITIALISATION ====================

    resetFilters() {
        this.activeFilters = {
            search: '',
            category: 'all',
            price: { min: 0, max: Infinity },
            location: 'all',
            date: 'all',
            custom: {}
        };
        this.sortBy = 'default';
        this.sortOrder = 'asc';
        this.applyFilters();
        return this;
    }

    // ==================== GETTERS ====================

    getFilteredData() {
        return this.filteredData;
    }

    getFilteredCount() {
        return this.filteredData.length;
    }

    getOriginalCount() {
        return this.originalData.length;
    }

    getActiveFilters() {
        return { ...this.activeFilters };
    }
}

// ==================== FILTRES SPÉCIALISÉS ====================

// Filtre pour les commerces
class BusinessFilterManager extends FilterManager {
    constructor(businesses, container) {
        super(businesses, container);
    }

    getSearchFields(business) {
        return [
            business.name,
            business.description,
            business.address,
            business.category,
            business.hours
        ];
    }

    filterByRating(minRating) {
        return this.addCustomFilter('rating', minRating, (item) => {
            return (item.rating || 0) >= minRating;
        });
    }

    filterByPremium(premiumOnly) {
        if (!premiumOnly) {
            return this.removeCustomFilter('premium');
        }
        return this.addCustomFilter('premium', true, (item) => {
            return item.premium === 'premium';
        });
    }

    filterByOpenNow() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();

        return this.addCustomFilter('open_now', true, (item) => {
            // Logique simplifiée - à améliorer avec de vraies heures d'ouverture
            return currentHour >= 8 && currentHour <= 19;
        });
    }
}

// Filtre pour les événements
class EventFilterManager extends FilterManager {
    constructor(events, container) {
        super(events, container);
    }

    getSearchFields(event) {
        return [
            event.title,
            event.description,
            event.location,
            event.organizer
        ];
    }

    filterByPrice(priceType) {
        switch (priceType) {
            case 'free':
                return this.addCustomFilter('price_type', 'free', (item) => {
                    return item.price.toLowerCase().includes('gratuit');
                });
            case 'paid':
                return this.addCustomFilter('price_type', 'paid', (item) => {
                    return !item.price.toLowerCase().includes('gratuit');
                });
            default:
                return this.removeCustomFilter('price_type');
        }
    }

    filterByRecurring() {
        return this.addCustomFilter('recurring', true, (item) => {
            return item.recurring !== null;
        });
    }
}

// Filtre pour les annonces
class ListingFilterManager extends FilterManager {
    constructor(listings, container) {
        super(listings, container);
    }

    getSearchFields(listing) {
        return [
            listing.title,
            listing.description,
            listing.location,
            listing.contactName
        ];
    }

    filterByType(type) {
        if (type === 'all') {
            return this.removeCustomFilter('type');
        }
        return this.addCustomFilter('type', type, (item) => {
            return item.type === type;
        });
    }

    filterByRecentness(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return this.addCustomFilter('recent', days, (item) => {
            const itemDate = new Date(item.date);
            return itemDate >= cutoffDate;
        });
    }
}

// ==================== FONCTIONS UTILITAIRES GLOBALES ====================

// Fonction de debounce pour optimiser les recherches
function debounceFilter(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Mise en évidence des termes de recherche
function highlightSearchTerm(text, searchTerm) {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background: yellow; padding: 0;">$1</mark>');
}

// Gestion des URL avec filtres
function updateURLWithFilters(filters) {
    const url = new URL(window.location);

    Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
            if (typeof value === 'object') {
                url.searchParams.set(key, JSON.stringify(value));
            } else {
                url.searchParams.set(key, value);
            }
        } else {
            url.searchParams.delete(key);
        }
    });

    history.replaceState(null, '', url);
}

function getFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const filters = {};

    for (const [key, value] of params) {
        try {
            // Essayer de parser comme JSON d'abord
            filters[key] = JSON.parse(value);
        } catch {
            // Sinon garder comme string
            filters[key] = value;
        }
    }

    return filters;
}

// ==================== EXPORT ====================

// Rendre disponible globalement
window.FilterManager = FilterManager;
window.BusinessFilterManager = BusinessFilterManager;
window.EventFilterManager = EventFilterManager;
window.ListingFilterManager = ListingFilterManager;

window.FilterUtils = {
    debounceFilter,
    highlightSearchTerm,
    updateURLWithFilters,
    getFiltersFromURL
};

// ==================== FILTRES PRÉDÉFINIS ====================

// Configuration des filtres rapides
const quickFilters = {
    businesses: {
        'restaurants': { category: 'restaurant', label: '🍽️ Restaurants' },
        'healthcare': { category: 'sante', label: '🏥 Santé' },
        'services': { category: 'artisan', label: '🔧 Artisans' },
        'premium': { premium: true, label: '⭐ Premium' },
        'open_now': { open: true, label: '🕒 Ouvert maintenant' }
    },
    events: {
        'today': { date: 'today', label: '📅 Aujourd\'hui' },
        'this_week': { date: 'week', label: '📆 Cette semaine' },
        'free': { price: 'free', label: '🆓 Gratuit' },
        'culture': { category: 'culture', label: '🎭 Culture' },
        'family': { category: 'famille', label: '👨‍👩‍👧‍👦 Famille' }
    },
    listings: {
        'selling': { type: 'vente', label: '💰 Je vends' },
        'buying': { type: 'cherche', label: '🔍 Je cherche' },
        'giving': { type: 'donne', label: '🎁 Je donne' },
        'recent': { recent: 7, label: '🆕 Récentes' },
        'vehicles': { category: 'vehicules', label: '🚗 Véhicules' }
    }
};

// Fonction pour appliquer un filtre rapide
function applyQuickFilter(filterManager, type, filterId) {
    const config = quickFilters[type][filterId];
    if (!config) return;

    Object.entries(config).forEach(([key, value]) => {
        if (key === 'label') return;

        switch (key) {
            case 'category':
                filterManager.filterByCategory(value);
                break;
            case 'date':
                filterManager.filterByDate(value);
                break;
            case 'price':
                if (type === 'events') {
                    filterManager.filterByPrice(value);
                }
                break;
            case 'type':
                if (type === 'listings') {
                    filterManager.filterByType(value);
                }
                break;
            case 'premium':
                if (type === 'businesses') {
                    filterManager.filterByPremium(value);
                }
                break;
            case 'open':
                if (type === 'businesses') {
                    filterManager.filterByOpenNow();
                }
                break;
            case 'recent':
                if (type === 'listings') {
                    filterManager.filterByRecentness(value);
                }
                break;
        }
    });
}

window.quickFilters = quickFilters;
window.applyQuickFilter = applyQuickFilter;