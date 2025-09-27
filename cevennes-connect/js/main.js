// Cévennes Connect - Script principal
// Navigation, animations et fonctions communes

document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initAnimations();
    initCommonFunctions();
});

// ==================== NAVIGATION ====================

function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Fermer le menu mobile en cliquant sur un lien
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Fermer le menu mobile en cliquant à l'extérieur
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ==================== ANIMATIONS ====================

function initAnimations() {
    // Animation d'apparition au scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observer tous les éléments avec la classe 'card'
    document.querySelectorAll('.card, .feature-card, .event-card, .listing-card').forEach(card => {
        observer.observe(card);
    });
}

// ==================== FONCTIONS COMMUNES ====================

function initCommonFunctions() {
    // Smooth scroll pour les liens d'ancre
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Gestion des tooltips
    initTooltips();

    // Gestion des formulaires
    initForms();
}

// ==================== UTILITAIRES GLOBALES ====================

// Afficher/masquer le loading
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// Notifications toast
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-white);
        color: var(--color-text-dark);
        padding: 15px 20px;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-hover);
        border-left: 4px solid var(--color-${type === 'success' ? 'accent' : type === 'error' ? 'secondary' : 'primary'});
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        font-family: 'Inter', sans-serif;
    `;

    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2rem;">${icon}</span>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Supprimer le toast après la durée spécifiée
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Animations CSS pour les toasts
if (!document.querySelector('#toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ==================== GESTION DES MODALES ====================

// Fonctions génériques pour les modales
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Empêcher le scroll de la page
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurer le scroll
    }
}

// Fermer les modales avec Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// ==================== GESTION DES TOOLTIPS ====================

function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--color-text-dark);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.8rem;
                z-index: 2000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
                white-space: nowrap;
            `;

            document.body.appendChild(tooltip);

            const rect = this.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            tooltip.style.left = `${rect.left + (rect.width - tooltipRect.width) / 2}px`;
            tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;

            // Animation d'apparition
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
            });

            this._tooltip = tooltip;
        });

        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.style.opacity = '0';
                setTimeout(() => {
                    if (this._tooltip && this._tooltip.parentNode) {
                        this._tooltip.parentNode.removeChild(this._tooltip);
                    }
                    delete this._tooltip;
                }, 200);
            }
        });
    });
}

// ==================== GESTION DES FORMULAIRES ====================

function initForms() {
    // Validation en temps réel
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isValid = field.checkValidity();

    // Supprimer les messages d'erreur existants
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    field.classList.remove('error', 'success');

    if (!isValid || value === '') {
        field.classList.add('error');

        // Ajouter un message d'erreur
        const errorMsg = document.createElement('div');
        errorMsg.className = 'field-error';
        errorMsg.style.cssText = `
            color: #e74c3c;
            font-size: 0.8rem;
            margin-top: 4px;
        `;

        if (field.type === 'email') {
            errorMsg.textContent = 'Veuillez entrer une adresse email valide';
        } else if (field.type === 'tel') {
            errorMsg.textContent = 'Veuillez entrer un numéro de téléphone valide';
        } else {
            errorMsg.textContent = 'Ce champ est obligatoire';
        }

        field.parentNode.appendChild(errorMsg);
    } else {
        field.classList.add('success');
    }

    return isValid && value !== '';
}

// ==================== UTILITAIRES DE FORMATAGE ====================

// Format de téléphone français
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4.$5');
    }
    return phone;
}

// Format de prix
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Format de date française
function formatDateFR(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// ==================== GÉOLOCALISATION ====================

// Obtenir la position de l'utilisateur
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('La géolocalisation n\'est pas supportée par ce navigateur');
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            error => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject('Géolocalisation refusée par l\'utilisateur');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject('Position non disponible');
                        break;
                    case error.TIMEOUT:
                        reject('Délai de géolocalisation dépassé');
                        break;
                    default:
                        reject('Erreur de géolocalisation inconnue');
                        break;
                }
            },
            options
        );
    });
}

// Calculer la distance entre deux points
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

// ==================== STORAGE LOCAL ====================

// Sauvegarder des données localement
function saveToStorage(key, data) {
    try {
        localStorage.setItem(`cevennes_connect_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        return false;
    }
}

// Récupérer des données locales
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(`cevennes_connect_${key}`);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Erreur de récupération:', error);
        return defaultValue;
    }
}

// Supprimer des données locales
function removeFromStorage(key) {
    try {
        localStorage.removeItem(`cevennes_connect_${key}`);
        return true;
    } catch (error) {
        console.error('Erreur de suppression:', error);
        return false;
    }
}

// ==================== FAVORIS ET PRÉFÉRENCES ====================

// Système de favoris
function addToFavorites(type, id) {
    const favorites = getFromStorage('favorites', {});
    if (!favorites[type]) {
        favorites[type] = [];
    }

    if (!favorites[type].includes(id)) {
        favorites[type].push(id);
        saveToStorage('favorites', favorites);
        showToast('Ajouté aux favoris', 'success');
        return true;
    }
    return false;
}

function removeFromFavorites(type, id) {
    const favorites = getFromStorage('favorites', {});
    if (favorites[type]) {
        favorites[type] = favorites[type].filter(fId => fId !== id);
        saveToStorage('favorites', favorites);
        showToast('Retiré des favoris', 'info');
        return true;
    }
    return false;
}

function isFavorite(type, id) {
    const favorites = getFromStorage('favorites', {});
    return favorites[type] && favorites[type].includes(id);
}

// ==================== ANALYTICS SIMPLES ====================

// Suivre les interactions utilisateur (version basique)
function trackEvent(category, action, label = null) {
    const eventData = {
        timestamp: new Date().toISOString(),
        category,
        action,
        label,
        page: window.location.pathname
    };

    // Sauvegarder localement (dans une vraie app, on enverrait ça à un serveur)
    const events = getFromStorage('analytics', []);
    events.push(eventData);

    // Garder seulement les 100 derniers événements
    if (events.length > 100) {
        events.shift();
    }

    saveToStorage('analytics', events);
}

// ==================== GESTION DES ERREURS ====================

// Gestionnaire d'erreur global
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);

    // En mode développement, afficher l'erreur à l'utilisateur
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showToast(`Erreur: ${e.message}`, 'error', 5000);
    }
});

// Gestionnaire pour les promesses rejetées
window.addEventListener('unhandledrejection', function(e) {
    console.error('Promesse rejetée:', e.reason);

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showToast(`Erreur async: ${e.reason}`, 'error', 5000);
    }
});

// ==================== PERFORMANCE ====================

// Lazy loading pour les images
function initLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Débounce pour optimiser les recherches
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle pour optimiser les events de scroll
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ==================== INITIALISATION GLOBALE ====================

// Fonction appelée quand tout est prêt
function initApp() {
    // Initialiser le lazy loading
    initLazyLoading();

    // Marquer l'app comme prête
    document.body.classList.add('app-ready');

    // Masquer le loading initial
    hideLoading();

    console.log('🏔️ Cévennes Connect initialisé');
}

// Attendre que tout soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ==================== EXPORT GLOBAL ====================

// Rendre les fonctions utilitaires disponibles globalement
window.CevennesConnect = {
    showToast,
    openModal,
    closeModal,
    getUserLocation,
    calculateDistance,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    trackEvent,
    formatPhoneNumber,
    formatCurrency,
    formatDateFR,
    debounce,
    throttle
};