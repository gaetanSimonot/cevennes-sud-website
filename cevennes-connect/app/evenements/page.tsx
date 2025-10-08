'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { EventCard } from '@/components/cards/EventCard'
import { GoogleMap } from '@/components/maps/GoogleMap'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Event, EventCategory } from '@/lib/types'
import { filterBySearch } from '@/lib/utils'

export default function EvenementsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null)

  useEffect(() => {
    // Load events from JSON
    fetch('/data/events-data.json')
      .then(res => res.json())
      .then((data: Event[]) => {
        // Sort by date (most recent first)
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setEvents(sorted)
        setFilteredEvents(sorted)
      })
  }, [])

  useEffect(() => {
    let result = events

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(event => event.category === activeCategory)
    }

    // Filter by search
    if (searchTerm) {
      result = filterBySearch(result, searchTerm)
    }

    // Filter by time (upcoming/past)
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset to start of day

    if (timeFilter === 'upcoming') {
      result = result.filter(event => new Date(event.date) >= now)
    } else if (timeFilter === 'past') {
      result = result.filter(event => new Date(event.date) < now)
    }

    // Filter by date range
    if (startDate) {
      result = result.filter(event => new Date(event.date) >= new Date(startDate))
    }
    if (endDate) {
      result = result.filter(event => new Date(event.date) <= new Date(endDate))
    }

    setFilteredEvents(result)
  }, [activeCategory, searchTerm, events, timeFilter, startDate, endDate])

  const categories: { key: EventCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Tous', icon: '🎉' },
    { key: 'marche', label: 'Marchés', icon: '🛍️' },
    { key: 'culture', label: 'Culture', icon: '🎭' },
    { key: 'sport', label: 'Sport', icon: '⚽' },
    { key: 'festival', label: 'Festivals', icon: '🎪' },
    { key: 'atelier', label: 'Ateliers', icon: '🎨' },
    { key: 'theatre', label: 'Théâtre', icon: '🎬' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header theme="pink" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-500 via-pink-600 to-purple-600 text-white py-20">
          <div className="container-custom text-center">
            <div className="floating mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🎉</span>
              </div>
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-6xl mb-6">
              Événements Locaux
            </h1>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Marchés, festivals, ateliers, spectacles... Ne manquez plus aucun événement local !
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            {/* Search and Filters */}
            <div className="mb-12">
              {/* Top bar: Search + Date filters + View toggle */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Search Bar */}
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Rechercher un événement..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-lg"
                  />
                </div>

                {/* Date range inputs */}
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      setTimeFilter('all')
                    }}
                    placeholder="Date début"
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value)
                      setTimeFilter('all')
                    }}
                    placeholder="Date fin"
                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'cards' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('cards')}
                  >
                    📋 Liste
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'primary' : 'secondary'}
                    onClick={() => setViewMode('map')}
                  >
                    🗺️ Carte
                  </Button>
                </div>
              </div>

              {/* Quick filters + Category filters */}
              <div className="flex flex-wrap gap-3">
                {/* Time quick filters */}
                <Button
                  variant={timeFilter === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setTimeFilter('all')
                    setStartDate('')
                    setEndDate('')
                  }}
                >
                  Tous
                </Button>
                <Button
                  variant={timeFilter === 'upcoming' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setTimeFilter('upcoming')
                    setStartDate('')
                    setEndDate('')
                  }}
                >
                  📅 À venir
                </Button>
                <Button
                  variant={timeFilter === 'past' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    setTimeFilter('past')
                    setStartDate('')
                    setEndDate('')
                  }}
                >
                  📆 Passés
                </Button>

                {/* Separator */}
                <div className="w-px bg-gray-300 mx-2"></div>

                {/* Category Filters */}
                {categories.map(cat => (
                  <Button
                    key={cat.key}
                    variant={activeCategory === cat.key ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setActiveCategory(cat.key)}
                  >
                    {cat.icon} {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="mb-8 text-center">
              <p className="text-xl font-bold text-gray-900">
                {filteredEvents.length} {filteredEvents.length > 1 ? 'événements' : 'événement'} {activeCategory !== 'all' && `(${categories.find(c => c.key === activeCategory)?.label})`}
              </p>
            </div>

            {/* Content */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 rounded-3xl overflow-hidden shadow-2xl">
                  <GoogleMap
                    events={filteredEvents}
                    className="h-[600px]"
                    highlightedEventId={hoveredEventId}
                  />
                </div>

                {/* Events List Sidebar */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  <div className="sticky top-0 bg-gray-50 pb-3 z-10">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      📍 {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
                    </h3>
                  </div>

                  {/* Sort events: premium first */}
                  {filteredEvents
                    .sort((a, b) => {
                      // Premium events first
                      const aPremium = a.featured ? 1 : 0
                      const bPremium = b.featured ? 1 : 0
                      if (aPremium !== bPremium) return bPremium - aPremium

                      // Then by date (upcoming first)
                      return new Date(a.date).getTime() - new Date(b.date).getTime()
                    })
                    .map((event) => {
                      const isPast = new Date(event.date) < new Date()
                      const categoryInfo = categories.find(c => c.key === event.category)

                      return (
                        <div
                          key={event.id}
                          className={`
                            bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all cursor-pointer
                            ${hoveredEventId === event.id ? 'ring-2 ring-pink-500 shadow-xl scale-[1.02]' : ''}
                            ${event.featured ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-white' : ''}
                            ${isPast ? 'opacity-60' : ''}
                          `}
                          onMouseEnter={() => setHoveredEventId(event.id)}
                          onMouseLeave={() => setHoveredEventId(null)}
                        >
                          {/* Premium badge */}
                          {event.featured && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                                ⭐ PREMIUM
                              </span>
                            </div>
                          )}

                          {/* Image */}
                          {event.image_url && (
                            <div className="w-full h-32 mb-3 rounded-xl overflow-hidden">
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+non+disponible'
                                }}
                              />
                            </div>
                          )}

                          {/* Title */}
                          <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">
                            {event.title}
                          </h4>

                          {/* Date and category */}
                          <div className="flex items-center gap-2 mb-2 text-sm">
                            <span className="flex items-center gap-1 text-gray-600">
                              📅 {new Date(event.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short'
                              })}
                              {isPast && ' (Passé)'}
                            </span>
                            <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                              {categoryInfo?.icon} {categoryInfo?.label}
                            </span>
                          </div>

                          {/* Location */}
                          {event.location && (
                            <p className="text-sm text-gray-600 truncate">
                              📍 {event.location}
                            </p>
                          )}

                          {/* Price */}
                          {event.price && (
                            <p className="text-sm text-gray-500 mt-1">
                              💰 {event.price}
                            </p>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            )}

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucun résultat trouvé</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
