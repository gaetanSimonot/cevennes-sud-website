import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header theme="emerald" />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white py-24 flex-1">
        <div className="container-custom text-center">
          <div className="floating mb-6">
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-5xl">🌄</span>
            </div>
          </div>
          <h1 className="font-display font-bold text-5xl lg:text-6xl mb-6">
            Bienvenue sur Cévennes Connect
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            Votre plateforme locale pour découvrir les professionnels, événements et services
            du Sud Cévennes (25km autour de Ganges)
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/acteurs-locaux" className="btn-primary">
              Annuaire Local
            </Link>
            <Link href="/evenements" className="btn-secondary bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
              Événements
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Nos Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <Link href="/acteurs-locaux" className="card hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">🏪</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Acteurs Locaux
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Découvrez les commerces, restaurants, artisans et thérapeutes de votre région.
              </p>
            </Link>

            {/* Service 2 */}
            <Link href="/evenements" className="card hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Événements
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ne manquez plus aucun événement local : marchés, festivals, ateliers et plus.
              </p>
            </Link>

            {/* Service 3 */}
            <Link href="/echangeons" className="card hover:scale-105 transition-transform">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Échangeons
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Petites annonces, troc, covoiturage... Partagez et échangez localement.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
