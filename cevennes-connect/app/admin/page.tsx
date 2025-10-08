'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth')
    if (auth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

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
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue Admin</h2>
          <p className="text-gray-600">Gérez votre plateforme locale</p>
        </div>

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
