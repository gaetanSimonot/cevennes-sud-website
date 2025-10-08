'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ActorCard } from '@/components/cards/ActorCard'
import { GoogleMap } from '@/components/maps/GoogleMap'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Actor, ActorCategory, ActorsData } from '@/lib/types'
import { sortByPremiumLevel, filterBySearch } from '@/lib/utils'

export default function ActeursLocauxPage() {
  const [actors, setActors] = useState<Actor[]>([])
  const [filteredActors, setFilteredActors] = useState<Actor[]>([])
  const [activeCategory, setActiveCategory] = useState<ActorCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards')

  useEffect(() => {
    // Load actors from JSON
    fetch('/data/actors-data.json')
      .then(res => res.json())
      .then((data: ActorsData) => {
        const allActors = [
          ...data.commerce,
          ...data.restaurant,
          ...data.artisan,
          ...data.therapeute,
          ...data.service,
          ...data.association,
        ]
        setActors(allActors)
        setFilteredActors(sortByPremiumLevel(allActors))
      })
  }, [])

  useEffect(() => {
    let result = actors

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(actor => actor.category === activeCategory)
    }

    // Filter by search
    if (searchTerm) {
      result = filterBySearch(result, searchTerm)
    }

    setFilteredActors(sortByPremiumLevel(result))
  }, [activeCategory, searchTerm, actors])

  const categories: { key: ActorCategory | 'all'; label: string; icon: string }[] = [
    { key: 'all', label: 'Tous', icon: '🏪' },
    { key: 'commerce', label: 'Commerces', icon: '🏪' },
    { key: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { key: 'artisan', label: 'Artisans', icon: '🔨' },
    { key: 'therapeute', label: 'Thérapeutes', icon: '💆' },
    { key: 'service', label: 'Services', icon: '💼' },
    { key: 'association', label: 'Associations', icon: '👥' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header theme="purple" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white py-20">
          <div className="container-custom text-center">
            <div className="floating mb-6">
              <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🏪</span>
              </div>
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-6xl mb-6">
              Acteurs Locaux
            </h1>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Découvrez les professionnels, commerces, artisans, thérapeutes et restaurants de Ganges et ses environs
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
                    placeholder="Rechercher un professionnel, commerce, service..."
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
                    📋 Cartes
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
                {filteredActors.length} {filteredActors.length > 1 ? 'acteurs' : 'acteur'} {activeCategory !== 'all' && `(${categories.find(c => c.key === activeCategory)?.label})`}
              </p>
            </div>

            {/* Content */}
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredActors.map((actor, index) => (
                  <ActorCard key={index} actor={actor} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <GoogleMap actors={filteredActors} className="h-[600px]" />
              </div>
            )}

            {filteredActors.length === 0 && (
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
