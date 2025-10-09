'use client'

import { useEffect, useRef } from 'react'
import { Actor, Event } from '@/lib/types'

interface GoogleMapProps {
  actors?: Actor[]
  events?: Event[]
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
  highlightedEventId?: number | null
  highlightedActorId?: string | null
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCSJRp7NCeKSPiKnezVyJiJFg5dqhbWnyw'

export function GoogleMap({
  actors = [],
  events = [],
  center = { lat: 43.9339, lng: 3.7086 }, // Ganges
  zoom = 11,
  className = '',
  highlightedEventId = null,
  highlightedActorId = null
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        initMap()
      }
    } else {
      initMap()
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null))
      markersRef.current = []
    }
  }, [])

  useEffect(() => {
    if (googleMapRef.current) {
      updateMarkers()
    }
  }, [actors, events, highlightedActorId, highlightedEventId])

  const initMap = () => {
    if (!mapRef.current || !window.google) return

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        // Cache tous les POI (commerces, restaurants, etc.)
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        // Cache les business labels
        {
          featureType: 'poi.business',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        // Cache les transits
        {
          featureType: 'transit',
          elementType: 'all',
          stylers: [{ visibility: 'off' }]
        },
        // Style minimaliste pour l'eau
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#c9e7f2' }]
        },
        // Landscape nature
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [{ color: '#e8f5e9' }]
        },
        // Routes principales
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { weight: 1 }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }]
        },
        // Routes locales plus discrètes
        {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }]
        },
        // Labels de routes minimalistes
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca3af' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#ffffff' }, { weight: 2 }]
        }
      ],
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
      }
    })

    googleMapRef.current = map
    updateMarkers()
  }

  const createActorMarkerIcon = (actor: Actor) => {
    const premiumLevel = actor.premium_level || 'standard'
    const color = getCategoryColor(actor.category)

    // Standard: petit point discret
    if (premiumLevel === 'standard') {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: color,
        fillOpacity: 0.8,
        strokeColor: '#ffffff',
        strokeWeight: 1.5
      }
    }

    // Premium: point moyen avec border jaune
    if (premiumLevel === 'premium') {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#fbbf24',
        strokeWeight: 3
      }
    }

    // Mega-premium: gros point avec border purple
    if (premiumLevel === 'mega-premium') {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#a855f7',
        strokeWeight: 4
      }
    }

    return null
  }

  const createTooltip = (actor: Actor) => {
    return `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 250px;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        ${actor.image ? `
          <img src="${actor.image}"
               style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
               onerror="this.style.display='none'"
          />
        ` : ''}
        <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #1f2937;">
          ${actor.name}
        </h3>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.4;">
          ${actor.description || ''}
        </p>
        ${actor.phone ? `
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">
            📞 ${actor.phone}
          </p>
        ` : ''}
      </div>
    `
  }

  const updateMarkers = () => {
    if (!googleMapRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add actor markers
    actors.forEach(actor => {
      if (!actor.lat || !actor.lng) return

      const premiumLevel = actor.premium_level || 'standard'
      const icon = createActorMarkerIcon(actor)

      const marker = new google.maps.Marker({
        position: { lat: actor.lat, lng: actor.lng },
        map: googleMapRef.current!,
        title: actor.name,
        icon: icon!,
        zIndex: premiumLevel === 'mega-premium' ? 200 : premiumLevel === 'premium' ? 100 : 50
      })

      // Tooltip (hover) - Only for premium and mega-premium
      if (premiumLevel === 'premium' || premiumLevel === 'mega-premium') {
        const tooltip = new google.maps.InfoWindow({
          content: createTooltip(actor)
        })

        marker.addListener('mouseover', () => {
          tooltip.open(googleMapRef.current!, marker)
        })

        marker.addListener('mouseout', () => {
          tooltip.close()
        })
      }

      // InfoWindow (click) - For all
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="max-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
            ${actor.image ? `<img src="${actor.image}" style="width: 100%; height: 120px; object-fit: cover; margin-bottom: 12px; border-radius: 8px;" onerror="this.style.display='none'" />` : ''}
            ${premiumLevel === 'mega-premium' ? '<div style="display: inline-block; background: linear-gradient(135deg, #a855f7, #ec4899); color: white; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 12px;">MEGA PREMIUM</div>' : ''}
            ${premiumLevel === 'premium' ? '<div style="display: inline-block; background: linear-gradient(90deg, #fbbf24, #f59e0b); color: white; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; margin-bottom: 12px;">PREMIUM</div>' : ''}
            <h3 style="font-weight: 600; margin: 8px 0; font-size: 16px; color: #1f2937;">${actor.name}</h3>
            <p style="color: #6b7280; margin-bottom: 12px; line-height: 1.5; font-size: 14px;">${actor.description || ''}</p>
            ${actor.address ? `<p style="font-size: 13px; color: #9ca3af; margin: 6px 0;"><strong>📍</strong> ${actor.address}</p>` : ''}
            ${actor.phone ? `<p style="font-size: 13px; color: #9ca3af; margin: 6px 0;"><strong>📞</strong> ${actor.phone}</p>` : ''}
            ${actor.email ? `<p style="font-size: 13px; color: #9ca3af; margin: 6px 0;"><strong>✉️</strong> ${actor.email}</p>` : ''}
            ${actor.website ? `<p style="font-size: 13px; margin-top: 8px;"><a href="${actor.website}" target="_blank" style="color: #3b82f6; text-decoration: none; font-weight: 500;">🌐 Visiter le site</a></p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current!, marker)
      })

      markersRef.current.push(marker)
    })

    // Add event markers
    events.forEach(event => {
      if (!event.lat || !event.lng) return

      const marker = new google.maps.Marker({
        position: { lat: event.lat, lng: event.lng },
        map: googleMapRef.current!,
        title: event.title,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getEventCategoryColor(event.category),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="max-width: 300px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${event.title}</h3>
            <p style="color: #666; margin-bottom: 8px;">${event.description}</p>
            ${event.date ? `<p style="font-size: 14px; color: #888;"><strong>📅</strong> ${new Date(event.date).toLocaleDateString('fr-FR')}</p>` : ''}
            ${event.location ? `<p style="font-size: 14px; color: #888;"><strong>📍</strong> ${event.location}</p>` : ''}
            ${event.price ? `<p style="font-size: 14px; color: #888;"><strong>💰</strong> ${event.price}</p>` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current!, marker)
      })

      markersRef.current.push(marker)
    })
  }

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      commerce: '#3b82f6',
      restaurant: '#f97316',
      artisan: '#eab308',
      therapeute: '#22c55e',
      service: '#a855f7',
      association: '#ec4899'
    }
    return colors[category] || '#6b7280'
  }

  const getEventCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      marche: '#22c55e',
      culture: '#a855f7',
      sport: '#3b82f6',
      festival: '#ec4899',
      atelier: '#f97316',
      theatre: '#ef4444'
    }
    return colors[category] || '#6b7280'
  }

  return (
    <div ref={mapRef} className={`w-full ${className}`} style={{ minHeight: '500px' }} />
  )
}
