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

    setFilteredEvents(result)
  }, [activeCategory, searchTerm, events])

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
              <div className="flex flex-col lg:flex-row gap-6 mb-6">
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

              {/* Category Filters */}
              <div className="flex flex-wrap gap-3">
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
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <GoogleMap events={filteredEvents} className="h-[600px]" />
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
