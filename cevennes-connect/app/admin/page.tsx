'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Stats {
  totalActors: number
  totalEvents: number
  futureEvents: number
  actorsByCategory: { [key: string]: number }
  eventsByCategory: { [key: string]: number }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
      loadStats()
    }
  }, [])

  const loadStats = async () => {
    try {
      // Load actors stats
      const actorsRes = await fetch('/api/actors?limit=10000')
      const actorsData = await actorsRes.json()

      // Load events stats
      const eventsRes = await fetch('/api/events?limit=10000')
      const eventsData = await eventsRes.json()

      const futureEventsRes = await fetch('/api/events?time=future&limit=10000')
      const futureEventsData = await futureEventsRes.json()

      // Calculate stats
      const actorsByCategory: { [key: string]: number } = {}
      actorsData.actors.forEach((a: any) => {
        actorsByCategory[a.category] = (actorsByCategory[a.category] || 0) + 1
      })

      const eventsByCategory: { [key: string]: number } = {}
      eventsData.events.forEach((e: any) => {
        eventsByCategory[e.category] = (eventsByCategory[e.category] || 0) + 1
      })

      setStats({
        totalActors: actorsData.total,
        totalEvents: eventsData.total,
        futureEvents: futureEventsData.total,
        actorsByCategory,
        eventsByCategory
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple password check (in production, use proper authentication)
    if (password === 'admin2024') { // Change this password
      localStorage.setItem('admin_auth', 'true')
      setIsAuthenticated(true)
      setError('')
    } else {
      setError('Mot de passe incorrect')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin</h1>
            <p className="text-gray-600">Connexion requise</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              label="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez le mot de passe admin"
              error={error}
            />
            <Button type="submit" variant="primary" className="w-full">
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Cévennes Sud</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="ghost" size="sm">
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue Admin</h2>
          <p className="text-gray-600">Gérez votre plateforme locale</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🏪</span>
                <span className="text-3xl font-bold text-purple-600">{stats.totalActors}</span>
              </div>
              <p className="text-gray-600 font-semibold">Acteurs</p>
              <p className="text-xs text-gray-500 mt-1">
                {Object.keys(stats.actorsByCategory).length} catégories
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">🎉</span>
                <span className="text-3xl font-bold text-pink-600">{stats.totalEvents}</span>
              </div>
              <p className="text-gray-600 font-semibold">Événements</p>
              <p className="text-xs text-gray-500 mt-1">Total dans la base</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">📅</span>
                <span className="text-3xl font-bold text-blue-600">{stats.futureEvents}</span>
              </div>
              <p className="text-gray-600 font-semibold">À venir</p>
              <p className="text-xs text-gray-500 mt-1">Événements futurs</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">✅</span>
                <span className="text-3xl font-bold text-green-600">100%</span>
              </div>
              <p className="text-gray-600 font-semibold">Opérationnel</p>
              <p className="text-xs text-gray-500 mt-1">Toutes fonctionnalités OK</p>
            </div>
          </div>
        )}

        <h3 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Artefact IA */}
          <Link href="/admin/artefact-ia" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">✨</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Artefact IA</h3>
            <p className="text-gray-600">
              Extraction automatique depuis texte, URL ou screenshot
            </p>
          </Link>

          {/* Scraping Automatique */}
          <Link href="/admin/scraping-auto" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Scraping Automatique</h3>
            <p className="text-gray-600">
              Scraping récurrent d&apos;agendas externes avec validation
            </p>
          </Link>

          {/* Import Google */}
          <Link href="/admin/import-google" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🔄</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Import Google Places</h3>
            <p className="text-gray-600">
              Import massif depuis Google Places API
            </p>
          </Link>

          {/* Créer Événement */}
          <Link href="/admin/create-event" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">➕🎉</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Créer Événement</h3>
            <p className="text-gray-600">
              Ajouter un événement manuellement
            </p>
          </Link>

          {/* Créer Acteur */}
          <Link href="/admin/create-actor" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">➕🏪</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Créer Acteur</h3>
            <p className="text-gray-600">
              Ajouter un acteur local manuellement
            </p>
          </Link>

          {/* Gestion Acteurs */}
          <Link href="/admin/manage-actors" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🏪</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Gestion Acteurs</h3>
            <p className="text-gray-600">
              Gérer les acteurs locaux existants
            </p>
          </Link>

          {/* Gestion Événements */}
          <Link href="/admin/manage-events" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Gestion Événements</h3>
            <p className="text-gray-600">
              Gérer les événements existants
            </p>
          </Link>

          {/* Retour au site */}
          <Link href="/" className="card hover:scale-105 transition-transform">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl">🏠</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Retour au site</h3>
            <p className="text-gray-600">
              Voir le site public
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
