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
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyCSJRp7NCeKSPiKnezVyJiJFg5dqhbWnyw'

export function GoogleMap({
  actors = [],
  events = [],
  center = { lat: 43.9339, lng: 3.7086 }, // Ganges
  zoom = 11,
  className = '',
  highlightedEventId = null
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
  }, [actors, events])

  const initMap = () => {
    if (!mapRef.current || !window.google) return

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      styles: [
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#a8dce3' }, { lightness: 17 }] },
        { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] },
        { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#e8f5e9' }] },
        { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }, { lightness: 17 }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 18 }] },
        { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#dedede' }, { lightness: 21 }] }
      ],
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true
    })

    googleMapRef.current = map
    updateMarkers()
  }

  const updateMarkers = () => {
    if (!googleMapRef.current || !window.google) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add actor markers
    actors.forEach(actor => {
      if (!actor.lat || !actor.lng) return

      const marker = new google.maps.Marker({
        position: { lat: actor.lat, lng: actor.lng },
        map: googleMapRef.current!,
        title: actor.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getCategoryColor(actor.category),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="max-width: 300px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${actor.name}</h3>
            <p style="color: #666; margin-bottom: 8px;">${actor.description}</p>
            ${actor.address ? `<p style="font-size: 14px; color: #888;"><strong>📍</strong> ${actor.address}</p>` : ''}
            ${actor.phone ? `<p style="font-size: 14px; color: #888;"><strong>📞</strong> ${actor.phone}</p>` : ''}
            ${actor.website ? `<p style="font-size: 14px;"><a href="${actor.website}" target="_blank" style="color: #3b82f6;">🌐 Site web</a></p>` : ''}
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
