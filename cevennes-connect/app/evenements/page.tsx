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
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past' | 'weekend' | 'week' | 'month'>('all')
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null)

  // Helper functions for date filters
  const getWeekendDates = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek
    const saturday = new Date(now)
    saturday.setDate(now.getDate() + daysUntilSaturday)
    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)
    return { start: saturday, end: sunday }
  }

  const getWeekDates = () => {
    const now = new Date()
    const end = new Date(now)
    end.setDate(now.getDate() + 7)
    return { start: now, end }
  }

  const getMonthDates = () => {
    const now = new Date()
    const end = new Date(now)
    end.setDate(now.getDate() + 30)
    return { start: now, end }
  }

  useEffect(() => {
    // Load events from Supabase API
    fetch('/api/events?limit=10000')
      .then(res => res.json())
      .then((data) => {
        const eventsData = data.events || []
        // Sort by date (most recent first)
        const sorted = eventsData.sort((a: Event, b: Event) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setEvents(sorted)
        setFilteredEvents(sorted)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des événements:', error)
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

    // Filter by time
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (timeFilter === 'upcoming') {
      result = result.filter(event => new Date(event.date) >= now)
    } else if (timeFilter === 'past') {
      result = result.filter(event => new Date(event.date) < now)
    } else if (timeFilter === 'weekend') {
      const { start, end } = getWeekendDates()
      result = result.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= start && eventDate <= end
      })
    } else if (timeFilter === 'week') {
      const { start, end } = getWeekDates()
      result = result.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= start && eventDate <= end
      })
    } else if (timeFilter === 'month') {
      const { start, end } = getMonthDates()
      result = result.filter(event => {
        const eventDate = new Date(event.date)
        return eventDate >= start && eventDate <= end
      })
    }

    // Filter by custom date range
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
            <div className="mb-12 space-y-6">
              {/* Primary: Search + View Toggle */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar - Most important */}
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="🔍 Que cherchez-vous ?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-lg h-14 font-medium"
                  />
                </div>

                {/* View Toggle - High priority */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all text-base
                      ${viewMode === 'cards'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300'}
                    `}
                  >
                    📋 <span className="hidden sm:inline">Liste</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all text-base
                      ${viewMode === 'map'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300'}
                    `}
                  >
                    🗺️ <span className="hidden sm:inline">Carte</span>
                  </button>
                </div>
              </div>

              {/* Secondary: Time shortcuts - Medium priority */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-gray-700">📅 QUAND ?</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setTimeFilter('weekend')
                      setStartDate('')
                      setEndDate('')
                    }}
                    className={`
                      px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${timeFilter === 'weekend'
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}
                    `}
                  >
                    🎉 Ce week-end
                  </button>
                  <button
                    onClick={() => {
                      setTimeFilter('week')
                      setStartDate('')
                      setEndDate('')
                    }}
                    className={`
                      px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${timeFilter === 'week'
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}
                    `}
                  >
                    📆 Cette semaine
                  </button>
                  <button
                    onClick={() => {
                      setTimeFilter('month')
                      setStartDate('')
                      setEndDate('')
                    }}
                    className={`
                      px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${timeFilter === 'month'
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100'}
                    `}
                  >
                    🗓️ Ce mois-ci
                  </button>
                  <button
                    onClick={() => {
                      setTimeFilter('all')
                      setStartDate('')
                      setEndDate('')
                    }}
                    className={`
                      px-4 py-2 rounded-lg font-semibold text-sm transition-all
                      ${timeFilter === 'all'
                        ? 'bg-gray-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    Tous
                  </button>

                  {/* Custom date range */}
                  <div className="flex gap-2 ml-auto">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        setTimeFilter('all')
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        setTimeFilter('all')
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tertiary: Categories - Lower priority */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-gray-600">CATÉGORIES</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-medium transition-all
                        ${activeCategory === cat.key
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
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

                  {/* Sort events: mega-premium > premium > standard */}
                  {filteredEvents
                    .sort((a, b) => {
                      // Sort by premium level first
                      const premiumOrder: Record<string, number> = {
                        'mega-premium': 3,
                        'premium': 2,
                        'standard': 1
                      }
                      const aLevel = premiumOrder[a.premium_level || 'standard'] || 1
                      const bLevel = premiumOrder[b.premium_level || 'standard'] || 1
                      if (aLevel !== bLevel) return bLevel - aLevel

                      // Then by date (upcoming first)
                      return new Date(a.date).getTime() - new Date(b.date).getTime()
                    })
                    .map((event) => {
                      const isPast = new Date(event.date) < new Date()
                      const categoryInfo = categories.find(c => c.key === event.category)
                      const premiumLevel = event.premium_level || 'standard'
                      const isStandard = premiumLevel === 'standard'

                      return (
                        <div
                          key={event.id}
                          className={`
                            bg-white rounded-2xl transition-all cursor-pointer
                            ${hoveredEventId === event.id ? 'ring-2 ring-pink-500 shadow-xl scale-[1.02]' : ''}
                            ${isPast ? 'opacity-60' : ''}
                            ${premiumLevel === 'mega-premium'
                              ? 'ring-4 ring-purple-500 shadow-2xl p-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white'
                              : premiumLevel === 'premium'
                              ? 'ring-2 ring-yellow-400 shadow-xl p-5 bg-gradient-to-br from-yellow-50 to-white'
                              : 'shadow-sm p-3 hover:shadow-md'}
                          `}
                          onMouseEnter={() => setHoveredEventId(event.id ?? null)}
                          onMouseLeave={() => setHoveredEventId(null)}
                        >
                          {/* Premium badge */}
                          {premiumLevel === 'mega-premium' && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                                💎 MEGA PREMIUM
                              </span>
                            </div>
                          )}
                          {premiumLevel === 'premium' && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1.5 text-sm font-bold rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md">
                                ⭐ PREMIUM
                              </span>
                            </div>
                          )}

                          {/* Image - Only for premium */}
                          {!isStandard && (event.image_url || event.image) && (
                            <div className={`w-full mb-3 rounded-xl overflow-hidden ${premiumLevel === 'mega-premium' ? 'h-48' : 'h-32'}`}>
                              <img
                                src={event.image_url || event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+non+disponible'
                                }}
                              />
                            </div>
                          )}

                          {/* Title */}
                          <h4 className={`font-bold text-gray-900 mb-2 ${isStandard ? 'text-base line-clamp-1' : 'text-lg line-clamp-2'}`}>
                            {event.title}
                          </h4>

                          {/* Date and location - Compact for standard */}
                          {isStandard ? (
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span>📅 {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                {isPast && <span className="text-xs text-gray-400">(Passé)</span>}
                              </div>
                              {event.location && (
                                <div className="truncate">📍 {event.location}</div>
                              )}
                            </div>
                          ) : (
                            <>
                              {/* Date and category - Full for premium */}
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

                              {/* Description - Only mega-premium */}
                              {premiumLevel === 'mega-premium' && event.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}

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

                              {/* Organizer - Only mega-premium */}
                              {premiumLevel === 'mega-premium' && event.organizer && (
                                <p className="text-xs text-gray-500 mt-2">
                                  👥 {event.organizer}
                                </p>
                              )}
                            </>
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
