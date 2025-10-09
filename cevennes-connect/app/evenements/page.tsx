'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { GoogleMap, GoogleMapRef } from '@/components/maps/GoogleMap'
import { FilterBubbles } from '@/components/FilterBubbles'
import { Event, EventCategory } from '@/lib/types'

export default function EvenementsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all')
  const [timeFilter, setTimeFilter] = useState<'now' | 'today' | 'weekend' | 'month' | 'all'>('all')
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mobileDrawerHeight, setMobileDrawerHeight] = useState(256) // 256px = h-64
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<'split' | 'list'>('split')
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'list'>('map')
  const desktopMapRef = useRef<GoogleMapRef>(null)
  const mobileMapRef = useRef<GoogleMapRef>(null)
  const desktopListRef = useRef<HTMLDivElement>(null)
  const mobileListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load events from Supabase API
    fetch('/api/events?limit=10000')
      .then(res => res.json())
      .then((data) => {
        const eventsData = data.events || []
        setEvents(eventsData)
        setFilteredEvents(eventsData)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des événements:', error)
      })
  }, [])

  // Auto-adjust drawer height when mobile view mode changes
  useEffect(() => {
    if (mobileViewMode === 'list') {
      // Expand drawer to near full screen
      setMobileDrawerHeight(window.innerHeight * 0.85)
    } else {
      // Minimize drawer to show map
      setMobileDrawerHeight(120)
    }
  }, [mobileViewMode])

  useEffect(() => {
    let result = events

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(event => event.category === activeCategory)
    }

    // Filter by time
    const now = new Date()

    if (timeFilter === 'now') {
      // Events in next 3 hours
      const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000)
      result = result.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= threeHoursLater
      })
    } else if (timeFilter === 'today') {
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59)
      result = result.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= endOfDay
      })
    } else if (timeFilter === 'weekend') {
      const dayOfWeek = now.getDay()
      const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek
      const saturday = new Date(now)
      saturday.setDate(now.getDate() + daysUntilSaturday)
      saturday.setHours(0, 0, 0, 0)
      const sunday = new Date(saturday)
      sunday.setDate(saturday.getDate() + 1)
      sunday.setHours(23, 59, 59)
      result = result.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= saturday && eventDate <= sunday
      })
    } else if (timeFilter === 'month') {
      const endOfMonth = new Date(now)
      endOfMonth.setDate(now.getDate() + 30)
      result = result.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= now && eventDate <= endOfMonth
      })
    }

    setFilteredEvents(result)
  }, [activeCategory, timeFilter, events])

  // Scroll to selected event (only within list container, not page)
  useEffect(() => {
    if (selectedEventId) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(`event-${selectedEventId}`)
        const listContainer = desktopListRef.current || mobileListRef.current

        if (element && listContainer) {
          // Calculate position relative to container
          const elementRect = element.getBoundingClientRect()
          const containerRect = listContainer.getBoundingClientRect()

          // Current scroll position
          const currentScroll = listContainer.scrollTop

          // Element position relative to container's visible area
          const elementTopRelativeToContainer = elementRect.top - containerRect.top

          // Calculate scroll to center the element
          const targetScroll = currentScroll + elementTopRelativeToContainer - (containerRect.height / 2) + (elementRect.height / 2)

          // Scroll only the list container
          listContainer.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          })
        }
      }, 150)
    }
  }, [selectedEventId])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const isEventSoon = (date: string) => {
    const eventDate = new Date(date)
    const now = new Date()
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000)
    return eventDate >= now && eventDate <= threeHoursLater
  }

  const categories: { key: EventCategory | 'all'; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'Tous', icon: '🎉', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { key: 'festival', label: 'Musique', icon: '🎵', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { key: 'culture', label: 'Culture', icon: '🎨', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { key: 'theatre', label: 'Théâtre', icon: '🎭', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { key: 'sport', label: 'Sport', icon: '⚽', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { key: 'atelier', label: 'Atelier', icon: '🎨', color: 'bg-orange-100 text-orange-700 hover:bg-orange-200' },
    { key: 'marche', label: 'Marché', icon: '🛍️', color: 'bg-teal-100 text-teal-700 hover:bg-teal-200' },
  ]

  const timeFilters = [
    { key: 'all' as const, label: 'Tous', icon: '∞' },
    { key: 'now' as const, label: 'Maintenant', icon: '🔥' },
    { key: 'today' as const, label: 'Aujourd\'hui', icon: '📅' },
    { key: 'weekend' as const, label: 'Ce WE', icon: '🎊' },
    { key: 'month' as const, label: 'Ce mois', icon: '📆' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header theme="cyan" />

      {/* Banner with Filters - Desktop */}
      <section className="hidden md:block bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 text-white py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-8">
            {/* Category Filters Column (left of "Que faire" bubble) */}
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`
                    px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                    ${activeCategory === cat.key
                      ? 'bg-white text-cyan-700 shadow-md'
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30'}
                  `}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* FilterBubbles with content between */}
            <FilterBubbles
              onTimeFilterChange={setTimeFilter}
              onCategoryChange={setActiveCategory}
              currentTimeFilter={timeFilter}
              currentCategory={activeCategory}
            >
              {/* View Mode + Stats - Between bubbles */}
              <div className="flex flex-col items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`
                      px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                      ${viewMode === 'split'
                        ? 'bg-white text-cyan-700 shadow-md'
                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30'}
                    `}
                  >
                    🗺️ Carte + Liste
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`
                      px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                      ${viewMode === 'list'
                        ? 'bg-white text-cyan-700 shadow-md'
                        : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30'}
                    `}
                  >
                    📋 Liste
                  </button>
                </div>

                {/* Stats Counter */}
                <p className="text-sm font-bold text-white">
                  {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                </p>
              </div>
            </FilterBubbles>

            {/* Time Filters Column (right of "Quand donc" bubble) */}
            <div className="flex flex-col gap-1.5">
              {timeFilters.map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setTimeFilter(filter.key)}
                  className={`
                    px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                    ${timeFilter === filter.key
                      ? 'bg-white text-cyan-700 shadow-md'
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/30'}
                  `}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Removed duplicate mobile filters */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm hidden">
        <div className="px-3 py-2">
          {/* Time Filters - Compact */}
          <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-hide">
            {timeFilters.map(filter => (
              <button
                key={filter.key}
                onClick={() => setTimeFilter(filter.key)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0
                  ${timeFilter === filter.key
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700'}
                `}
              >
                {filter.icon} {filter.label}
              </button>
            ))}
          </div>

          {/* Category Pills - Compact */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0
                  ${activeCategory === cat.key
                    ? 'ring-2 ring-pink-500 ' + cat.color
                    : cat.color}
                `}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 py-6">
        <div className="container mx-auto px-6">
          {/* DESKTOP: Split View (Carte + Liste) */}
          {viewMode === 'split' && (
          <div className="hidden md:grid md:grid-cols-2 gap-6 h-[calc(100vh-16rem)]">
            {/* Left: Map */}
            <div className="relative h-full rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200">
              <GoogleMap
                ref={desktopMapRef}
                events={filteredEvents}
                center={userLocation || { lat: 43.9339, lng: 3.7086 }}
                zoom={userLocation ? 14 : 11}
                className="h-full"
                selectedEventId={selectedEventId}
                onMarkerClick={(eventId) => setSelectedEventId(eventId)}
              />
            </div>

            {/* Right: List */}
            <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
              <div ref={desktopListRef} className="overflow-y-auto h-full p-6 space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg">Aucun événement trouvé</p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  id={`event-${event.id}`}
                  onClick={() => {
                    if (event.id) {
                      setSelectedEventId(event.id)
                      desktopMapRef.current?.centerOnEvent(event.id)
                    }
                  }}
                  className={`
                    group cursor-pointer bg-white rounded-xl border-2 transition-all duration-200
                    ${selectedEventId === event.id
                      ? 'border-cyan-400 shadow-xl ring-2 ring-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50'
                      : 'border-gray-200 hover:border-cyan-200 hover:shadow-md'}
                  `}
                >
                  <div className="flex gap-4 p-4">
                    {/* Image miniature */}
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className={`font-bold text-lg line-clamp-2 flex-1 transition-colors ${
                          selectedEventId === event.id ? 'text-cyan-700' : 'text-gray-900'
                        }`}>
                          {event.title}
                        </h3>

                        {/* Badges */}
                        <div className="flex gap-1 flex-shrink-0">
                          {isEventSoon(event.date) && (
                            <span className="text-xl" title="Bientôt!">🔥</span>
                          )}
                          {event.premium_level === 'mega-premium' && (
                            <span className="text-xl" title="Premium">⭐</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{new Date(event.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}</span>
                          {event.time && <span>• {event.time}</span>}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}

                        {event.price && (
                          <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span>{event.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Category badge */}
                      <div className="mt-2">
                        <span className={`
                          inline-block px-3 py-1 rounded-full text-xs font-semibold
                          ${categories.find(c => c.key === event.category)?.color}
                        `}>
                          {categories.find(c => c.key === event.category)?.icon} {event.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
              </div>
            </div>
          </div>
          )}

          {/* DESKTOP: List Only View */}
          {viewMode === 'list' && (
          <div className="hidden md:block">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg">Aucun événement trouvé</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    className={`
                      bg-white rounded-xl border-2 transition-all duration-200 overflow-hidden
                      ${selectedEventId === event.id
                        ? 'border-cyan-400 shadow-xl ring-2 ring-cyan-100'
                        : 'border-gray-200 hover:border-cyan-200 hover:shadow-md'}
                    `}
                  >
                    {/* Image */}
                    {event.image && (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    )}

                    <div className="p-4">
                      {/* Title and badges */}
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="font-bold text-lg line-clamp-2 flex-1">
                          {event.title}
                        </h3>
                        <div className="flex gap-1 flex-shrink-0">
                          {isEventSoon(event.date) && (
                            <span className="text-xl" title="Bientôt!">🔥</span>
                          )}
                          {event.premium_level === 'mega-premium' && (
                            <span className="text-xl" title="Premium">⭐</span>
                          )}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{new Date(event.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}</span>
                          {event.time && <span>• {event.time}</span>}
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                        )}

                        {event.price && (
                          <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span>{event.price}</span>
                          </div>
                        )}
                      </div>

                      {/* Category badge */}
                      <div className="mb-3">
                        <span className={`
                          inline-block px-3 py-1 rounded-full text-xs font-semibold
                          ${categories.find(c => c.key === event.category)?.color}
                        `}>
                          {categories.find(c => c.key === event.category)?.icon} {event.category}
                        </span>
                      </div>

                      {/* View on map button */}
                      <button
                        onClick={() => {
                          if (event.id) {
                            setSelectedEventId(event.id)
                            setViewMode('split')
                            // Small delay to ensure map is mounted
                            setTimeout(() => {
                              desktopMapRef.current?.centerOnEvent(event.id!)
                            }, 100)
                          }
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
                      >
                        🗺️ Voir sur la carte
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>

        {/* MOBILE: Map + Bottom Drawer */}
        <div className="md:hidden h-screen flex flex-col bg-gray-50">
          {/* Clean Filter Banner */}
          <div className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 shadow-xl">
            <div className="px-3" style={{ paddingTop: '12px', paddingBottom: '4px' }}>
              {/* FilterBubbles - with negative margins to compensate for scale */}
              <div className="flex justify-center -my-[72px]">
                <div className="scale-50 origin-center">
                  <FilterBubbles
                    onTimeFilterChange={setTimeFilter}
                    onCategoryChange={setActiveCategory}
                    currentTimeFilter={timeFilter}
                    currentCategory={activeCategory}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-1.5">
                {/* Time Filters */}
                <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                  <div className="flex gap-1.5">
                    {timeFilters.map(filter => (
                      <button
                        key={filter.key}
                        onClick={() => setTimeFilter(filter.key)}
                        className={`
                          px-2.5 py-1 rounded text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0
                          ${timeFilter === filter.key
                            ? 'bg-white text-cyan-700 shadow-md'
                            : 'bg-white/10 backdrop-blur-sm text-white border border-white/30'}
                        `}
                      >
                        {filter.icon} {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filters */}
                <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
                  <div className="flex gap-1.5">
                    {categories.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`
                          px-2.5 py-1 rounded text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0
                          ${activeCategory === cat.key
                            ? 'bg-white text-cyan-700 shadow-md'
                            : 'bg-white/10 backdrop-blur-sm text-white border border-white/30'}
                        `}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map - Full background from banner */}
          <div className="fixed top-16 left-0 right-0 bottom-0 z-0">
            <GoogleMap
              ref={mobileMapRef}
              events={filteredEvents}
              center={userLocation || { lat: 43.9339, lng: 3.7086 }}
              zoom={userLocation ? 14 : 11}
              className="h-full"
              selectedEventId={selectedEventId}
              onMarkerClick={(eventId) => setSelectedEventId(eventId)}
              disableAutoInfoWindow={true}
            />

            {/* Event Counter - Top of map */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-30">
              <p className="text-xs font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Geolocation Button */}
            <button
              onClick={getUserLocation}
              className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg z-30"
              title="Ma position"
            >
              📍
            </button>
          </div>

          {/* Bottom Drawer - Draggable */}
          <div
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50"
            style={{
              height: `${mobileDrawerHeight}px`,
              transition: isDragging ? 'none' : 'height 0.3s ease'
            }}
          >
            {/* Draggable Handle */}
            <div
              className="py-3 cursor-grab active:cursor-grabbing flex justify-center touch-none"
              onMouseDown={(e) => {
                setIsDragging(true)
                const startY = e.clientY
                const startHeight = mobileDrawerHeight

                const handleMouseMove = (e: MouseEvent) => {
                  const diff = startY - e.clientY
                  const newHeight = Math.min(Math.max(80, startHeight + diff), window.innerHeight * 0.85)
                  setMobileDrawerHeight(newHeight)
                }

                const handleMouseUp = () => {
                  setIsDragging(false)
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }

                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
              onTouchStart={(e) => {
                setIsDragging(true)
                const startY = e.touches[0].clientY
                const startHeight = mobileDrawerHeight

                const handleTouchMove = (e: TouchEvent) => {
                  const diff = startY - e.touches[0].clientY
                  const newHeight = Math.min(Math.max(80, startHeight + diff), window.innerHeight * 0.85)
                  setMobileDrawerHeight(newHeight)
                }

                const handleTouchEnd = () => {
                  setIsDragging(false)
                  document.removeEventListener('touchmove', handleTouchMove)
                  document.removeEventListener('touchend', handleTouchEnd)
                }

                document.addEventListener('touchmove', handleTouchMove)
                document.addEventListener('touchend', handleTouchEnd)
              }}
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header with view mode toggle */}
            <div className="px-4 pb-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">
                {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
              </h2>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMobileViewMode('map')}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
                    ${mobileViewMode === 'map'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  <img src="/icon-map.svg" alt="Carte" className="w-4 h-4" />
                  Carte
                </button>
                <button
                  onClick={() => setMobileViewMode('list')}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
                    ${mobileViewMode === 'list'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  <img src="/icon-list.svg" alt="Liste" className="w-4 h-4" />
                  Liste
                </button>
              </div>
            </div>

            {/* List */}
            <div ref={mobileListRef} className="overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 80px)' }}>
              {filteredEvents.map((event) => {
                const isExpanded = selectedEventId === event.id
                return (
                  <div
                    key={event.id}
                    id={`event-${event.id}`}
                    onClick={() => {
                      if (event.id) {
                        // Toggle: if already selected, deselect
                        setSelectedEventId(isExpanded ? null : event.id)
                        if (!isExpanded) {
                          mobileMapRef.current?.centerOnEvent(event.id)
                        }
                      }
                    }}
                    className={`
                      bg-white rounded-xl shadow-sm cursor-pointer transition-all border-2
                      ${isExpanded
                        ? 'border-cyan-400 shadow-xl ring-2 ring-cyan-100 bg-gradient-to-br from-cyan-50 to-teal-50'
                        : 'border-gray-200 hover:border-cyan-200 hover:shadow-md'}
                    `}
                  >
                    {/* Compact View */}
                    <div className="flex gap-3 p-3">
                      {event.image && (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm mb-1 transition-colors ${
                          isExpanded ? 'text-cyan-700' : 'text-gray-900'
                        } ${!isExpanded ? 'line-clamp-2' : ''}`}>
                          {event.title}
                        </h3>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })} {event.time && `• ${event.time}`}</div>
                          {!isExpanded && event.location && <div className="line-clamp-1">📍 {event.location}</div>}
                        </div>
                      </div>

                      {/* Expand indicator */}
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <span className="text-xl">▼</span>
                        ) : (
                          <span className="text-xl">▶</span>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-0 space-y-2 text-sm text-gray-600">
                        {event.location && (
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0">📍</span>
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.price && (
                          <div className="flex items-center gap-2">
                            <span>💰</span>
                            <span>{event.price}</span>
                          </div>
                        )}
                        {event.description && (
                          <div className="pt-2 border-t border-gray-200">
                            <p className="text-gray-700">{event.description}</p>
                          </div>
                        )}
                        {/* Category badge */}
                        <div className="pt-2">
                          <span className={`
                            inline-block px-3 py-1 rounded-full text-xs font-semibold
                            ${categories.find(c => c.key === event.category)?.color}
                          `}>
                            {categories.find(c => c.key === event.category)?.icon} {event.category}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer - hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}
