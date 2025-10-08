import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { EventCard } from '@/components/cards/EventCard'
import { Event } from '@/lib/types'
import fs from 'fs/promises'
import path from 'path'

async function getEvents(): Promise<Event[]> {
  const filePath = path.join(process.cwd(), 'data', 'events-data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  const events: Event[] = JSON.parse(fileContents)

  // Trier par date (plus récent en premier)
  return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default async function EvenementsPage() {
  const events = await getEvents()

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
            {/* Stats */}
            <div className="mb-12 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {events.length} événements à venir
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
