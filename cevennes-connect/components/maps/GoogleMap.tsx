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

  const createActorMarkerIcon = (actor: Actor) => {
    const premiumLevel = actor.premium_level || 'standard'
    const color = getCategoryColor(actor.category)

    // Standard: petit point discret
    if (premiumLevel === 'standard') {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: color,
        fillOpacity: 0.7,
        strokeColor: '#ffffff',
        strokeWeight: 1
      }
    }

    // Premium: marker plus visible
    if (premiumLevel === 'premium') {
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#fbbf24',
        strokeWeight: 3
      }
    }

    // Mega-premium: custom HTML marker (pancarte)
    return null // Will use custom overlay
  }

  const createMegaPremiumOverlay = (actor: Actor, isHighlighted: boolean) => {
    const content = document.createElement('div')
    content.style.cssText = `
      position: absolute;
      transform: translate(-50%, -50%);
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: ${isHighlighted ? 2000 : 1000};
      animation: pulse 2s ease-in-out infinite;
    `

    const size = isHighlighted ? 70 : 50

    content.innerHTML = `
      <style>
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <!-- Glow effect -->
        <div style="
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(15px);
        "></div>

        <!-- Star icon -->
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(251, 191, 36, 0.8), 0 4px 20px rgba(0,0,0,0.3);
          border: 3px solid #fff;
        ">
          <span style="font-size: ${size * 0.6}px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">⭐</span>
        </div>

        <!-- Diamond badge -->
        <div style="
          position: absolute;
          top: -8px;
          right: -8px;
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          border: 2px solid white;
        ">
          <span style="font-size: 16px;">💎</span>
        </div>
      </div>
    `

    content.addEventListener('mouseenter', () => {
      content.style.transform = 'translate(-50%, -50%) scale(1.2)'
      content.style.zIndex = '2000'
    })

    content.addEventListener('mouseleave', () => {
      content.style.transform = 'translate(-50%, -50%) scale(1)'
      content.style.zIndex = isHighlighted ? '2000' : '1000'
    })

    return content
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

      // Mega-premium: custom overlay
      if (premiumLevel === 'mega-premium') {
        const isHighlighted = highlightedActorId === actor.id
        const overlay = new google.maps.OverlayView()

        overlay.onAdd = function() {
          const panes = this.getPanes()
          const content = createMegaPremiumOverlay(actor, isHighlighted)

          panes!.overlayMouseTarget.appendChild(content)

          content.addEventListener('click', () => {
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="max-width: 300px;">
                  ${actor.image ? `<img src="${actor.image}" style="width: 100%; height: 120px; object-fit: cover; margin-bottom: 12px; border-radius: 8px;" />` : ''}
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 24px;">💎</span>
                    <h3 style="font-weight: bold; margin: 0; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${actor.name}</h3>
                  </div>
                  <p style="color: #666; margin-bottom: 12px; line-height: 1.5;">${actor.description}</p>
                  ${actor.address ? `<p style="font-size: 14px; color: #888; margin-bottom: 8px;"><strong>📍</strong> ${actor.address}</p>` : ''}
                  ${actor.phone ? `<p style="font-size: 14px; color: #888; margin-bottom: 8px;"><strong>📞</strong> ${actor.phone}</p>` : ''}
                  ${actor.email ? `<p style="font-size: 14px; color: #888; margin-bottom: 8px;"><strong>✉️</strong> ${actor.email}</p>` : ''}
                  ${actor.website ? `<p style="font-size: 14px;"><a href="${actor.website}" target="_blank" style="color: #a855f7; text-decoration: none; font-weight: 600;">🌐 Visiter le site</a></p>` : ''}
                </div>
              `
            })
            infoWindow.setPosition({ lat: actor.lat!, lng: actor.lng! })
            infoWindow.open(googleMapRef.current!)
          })

          // Store content for cleanup
          ;(overlay as any).content = content
        }

        overlay.draw = function() {
          const projection = this.getProjection()
          const position = projection.fromLatLngToDivPixel(new google.maps.LatLng(actor.lat!, actor.lng!))
          const content = (this as any).content
          if (content && position) {
            content.style.left = position.x + 'px'
            content.style.top = position.y + 'px'
          }
        }

        overlay.onRemove = function() {
          const content = (this as any).content
          if (content && content.parentNode) {
            content.parentNode.removeChild(content)
          }
        }

        overlay.setMap(googleMapRef.current)
        markersRef.current.push(overlay as any)
        return
      }

      // Standard et Premium: markers classiques
      const icon = createActorMarkerIcon(actor)
      const marker = new google.maps.Marker({
        position: { lat: actor.lat, lng: actor.lng },
        map: googleMapRef.current!,
        title: actor.name,
        icon: icon!,
        zIndex: premiumLevel === 'premium' ? 100 : 50
      })

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="max-width: 300px;">
            ${premiumLevel === 'premium' ? '<div style="background: linear-gradient(90deg, #fbbf24, #f59e0b); padding: 4px 12px; margin: -8px -8px 12px -8px; border-radius: 4px 4px 0 0;"><span style="color: white; font-size: 12px; font-weight: bold;">⭐ PREMIUM</span></div>' : ''}
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
