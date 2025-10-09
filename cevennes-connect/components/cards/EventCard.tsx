import Image from 'next/image'
import { Event } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'

interface EventCardProps {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  const categoryIcons = {
    marche: '🛍️',
    culture: '🎭',
    sport: '⚽',
    festival: '🎪',
    atelier: '🎨',
    theatre: '🎬',
  }

  const categoryColors = {
    marche: 'from-green-400 to-green-600',
    culture: 'from-purple-400 to-purple-600',
    sport: 'from-blue-400 to-blue-600',
    festival: 'from-pink-400 to-pink-600',
    atelier: 'from-orange-400 to-orange-600',
    theatre: 'from-red-400 to-red-600',
  }

  // Standard events: minimal compact display
  if (!event.premium_level || event.premium_level === 'standard') {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${categoryColors[event.category]} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-lg">{categoryIcons[event.category]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
              {event.title}
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              {event.date && (
                <div className="flex items-center">
                  <span className="mr-1">📅</span>
                  <span>{new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  {event.time && <span className="ml-2">⏰ {event.time}</span>}
                </div>
              )}
              {event.location && (
                <div className="flex items-center line-clamp-1">
                  <span className="mr-1">📍</span>
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Premium and Mega-Premium events: full card display
  const isPremium = event.premium_level === 'premium'
  const isMegaPremium = event.premium_level === 'mega-premium'

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group ${
      isMegaPremium ? 'ring-4 ring-purple-500' : isPremium ? 'ring-2 ring-yellow-400' : ''
    }`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${categoryColors[event.category]} flex items-center justify-center`}>
            <span className="text-white text-6xl">{categoryIcons[event.category]}</span>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge level={event.premium_level} />
        </div>
      </div>

      {/* Content */}
      <div className={isMegaPremium ? 'p-6 bg-gradient-to-br from-purple-50 to-pink-50' : isPremium ? 'p-6 bg-gradient-to-br from-yellow-50 to-white' : 'p-6'}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{categoryIcons[event.category]}</span>
          <span className={`text-sm font-semibold bg-gradient-to-r ${categoryColors[event.category]} bg-clip-text text-transparent`}>
            {event.category.toUpperCase()}
          </span>
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-2 text-sm">
          {event.date && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📅</span>
              <span>{new Date(event.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</span>
            </div>
          )}

          {event.time && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">⏰</span>
              <span>{event.time}</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📍</span>
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {event.price && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">💰</span>
              <span>{event.price}</span>
            </div>
          )}
        </div>

        {(event.contact || event.website) && (
          <div className="flex gap-2 mt-4">
            {event.contact && (
              <a
                href={event.contact.includes('@') ? `mailto:${event.contact}` : `tel:${event.contact}`}
                className="flex-1 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition text-center"
              >
                📞 Contact
              </a>
            )}
            {event.website && (
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition text-center"
              >
                🌐 Site
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
