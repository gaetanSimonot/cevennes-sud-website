import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-900 to-teal-900"></div>
      </div>

      <div className="container-custom relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-white text-3xl">🏔️</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl">Cévennes Sud</h1>
                <p className="text-gray-400 text-lg">Votre communauté locale connectée</p>
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-2xl">
              Découvrez et soutenez les acteurs économiques locaux de notre belle région des Cévennes.
              Ensemble, faisons vivre notre territoire !
            </p>

            <div className="flex items-center text-gray-400 text-lg">
              <span className="mr-3">📍</span>
              <span>Ganges • Saint-Hippolyte-du-Fort • Sud Cévennes</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-8 text-2xl text-white">Navigation</h3>
            <ul className="space-y-4 text-gray-300 text-lg">
              <li>
                <Link href="/" className="hover:text-emerald-400 transition flex items-center group">
                  <span className="mr-3 text-emerald-400 group-hover:scale-110 transition-transform">🏠</span>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/acteurs-locaux" className="hover:text-purple-400 transition flex items-center group">
                  <span className="mr-3 text-purple-400 group-hover:scale-110 transition-transform">🏪</span>
                  Acteurs Locaux
                </Link>
              </li>
              <li>
                <Link href="/evenements" className="hover:text-pink-400 transition flex items-center group">
                  <span className="mr-3 text-pink-400 group-hover:scale-110 transition-transform">🎉</span>
                  Événements
                </Link>
              </li>
              <li>
                <Link href="/echangeons" className="hover:text-blue-400 transition flex items-center group">
                  <span className="mr-3 text-blue-400 group-hover:scale-110 transition-transform">🤝</span>
                  Échangeons
                </Link>
              </li>
              <li>
                <Link href="/parlons-en" className="hover:text-orange-400 transition flex items-center group">
                  <span className="mr-3 text-orange-400 group-hover:scale-110 transition-transform">💬</span>
                  Parlons-en
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-8 text-2xl text-white">Contact</h3>
            <ul className="space-y-4 text-gray-300 text-lg">
              <li className="flex items-center">
                <span className="mr-4 text-emerald-400">📧</span>
                <a href="mailto:contact@cevennesud.fr" className="hover:text-emerald-400 transition">
                  contact@cevennesud.fr
                </a>
              </li>
              <li className="flex items-center">
                <span className="mr-4 text-emerald-400">📞</span>
                <a href="tel:0467733000" className="hover:text-emerald-400 transition">
                  04 67 73 XX XX
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-gray-400 text-lg">
            © 2025 Cévennes Sud. Fait avec ❤️ pour notre belle communauté locale.
          </p>
        </div>
      </div>
    </footer>
  )
}
