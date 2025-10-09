'use client'

import Link from 'next/link'
import { useState } from 'react'

interface HeaderProps {
  theme?: 'emerald' | 'purple' | 'pink' | 'blue' | 'orange' | 'cyan'
}

export function Header({ theme = 'emerald' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const themeColors = {
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-indigo-600',
    pink: 'from-pink-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    orange: 'from-orange-500 to-red-600',
    cyan: 'from-cyan-500 to-teal-600',
  }

  const hoverColors = {
    emerald: 'hover:text-emerald-600',
    purple: 'hover:text-purple-600',
    pink: 'hover:text-pink-600',
    blue: 'hover:text-blue-600',
    orange: 'hover:text-orange-600',
    cyan: 'hover:text-cyan-600',
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${themeColors[theme]} rounded-2xl flex items-center justify-center shadow-lg`}>
              <span className="text-white text-2xl">🏔️</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">Cévennes Sud</h1>
              <p className="text-sm text-gray-500">Votre communauté connectée</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`text-gray-700 ${hoverColors['emerald']} transition text-lg`}>
              Accueil
            </Link>
            <Link href="/acteurs-locaux" className={`text-gray-700 ${hoverColors['purple']} transition text-lg`}>
              Acteurs Locaux
            </Link>
            <Link href="/evenements" className={`text-gray-700 ${hoverColors['pink']} transition text-lg`}>
              Événements
            </Link>
            <Link href="/echangeons" className={`text-gray-700 ${hoverColors['blue']} transition text-lg`}>
              Échangeons
            </Link>
            <Link href="/parlons-en" className={`text-gray-700 ${hoverColors['orange']} transition text-lg`}>
              Parlons-en
            </Link>

            {/* Utile Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-gray-900 transition text-lg flex items-center">
                Utile
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="p-2">
                  <Link href="/covoiturage" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition">
                    <span className="mr-3">🚗</span>
                    <span className="text-gray-700 font-medium">Covoiturage</span>
                  </Link>
                  <Link href="/troc-tout" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition">
                    <span className="mr-3">🔄</span>
                    <span className="text-gray-700 font-medium">Troc & Services</span>
                  </Link>
                  <Link href="/carte" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition">
                    <span className="mr-3">🗺️</span>
                    <span className="text-gray-700 font-medium">Carte Interactive</span>
                  </Link>
                  <Link href="/boite-idees" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition">
                    <span className="mr-3">💡</span>
                    <span className="text-gray-700 font-medium">Boîte à Idées</span>
                  </Link>
                  <Link href="/itineraires-rando" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition">
                    <span className="mr-3">🥾</span>
                    <span className="text-gray-700 font-medium">Randonnées</span>
                  </Link>
                  <Link href="/panneau-village" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition">
                    <span className="mr-3">📢</span>
                    <span className="text-gray-700 font-medium">Panneau Village</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white border-t border-gray-100">
            <div className="px-4 py-2 space-y-1">
              <Link href="/" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Accueil
              </Link>
              <Link href="/acteurs-locaux" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Acteurs Locaux
              </Link>
              <Link href="/evenements" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Événements
              </Link>
              <Link href="/echangeons" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Petites Annonces
              </Link>
              <Link href="/parlons-en" className="block py-2 text-gray-700" onClick={() => setMobileMenuOpen(false)}>
                Parlons-en
              </Link>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <p className="text-sm font-semibold text-gray-500 px-2 mb-2">Utile</p>
                <Link href="/covoiturage" className="block py-2 text-gray-700 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  Covoiturage
                </Link>
                <Link href="/troc-tout" className="block py-2 text-gray-700 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  Troc & Services
                </Link>
                <Link href="/carte" className="block py-2 text-gray-700 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  Carte Interactive
                </Link>
                <Link href="/boite-idees" className="block py-2 text-gray-700 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  Boîte à Idées
                </Link>
                <Link href="/itineraires-rando" className="block py-2 text-gray-700 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  Randonnées
                </Link>
                <Link href="/panneau-village" className="block py-2 text-gray-700 pl-4" onClick={() => setMobileMenuOpen(false)}>
                  Panneau Village
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
