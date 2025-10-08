import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ActorCard } from '@/components/cards/ActorCard'
import { Actor, ActorsData } from '@/lib/types'
import fs from 'fs/promises'
import path from 'path'

async function getActors(): Promise<Actor[]> {
  const filePath = path.join(process.cwd(), 'data', 'actors-data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const data: ActorsData = JSON.parse(fileContents)

  // Fusionner toutes les catégories en un seul tableau
  return [
    ...data.commerce,
    ...data.restaurant,
    ...data.artisan,
    ...data.therapeute,
    ...data.service,
    ...data.association,
  ]
}

export default async function ActeursLocauxPage() {
  const actors = await getActors()

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
            {/* Stats */}
            <div className="mb-12 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {actors.length} acteurs locaux référencés
              </p>
            </div>

            {/* Actors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {actors.map((actor, index) => (
                <ActorCard key={index} actor={actor} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
