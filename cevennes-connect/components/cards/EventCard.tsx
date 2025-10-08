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
    marche: 'text-green-600',
    culture: 'text-purple-600',
    sport: 'text-blue-600',
    festival: 'text-pink-600',
    atelier: 'text-orange-600',
    theatre: 'text-red-600',
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          {event.premium_level && <Badge level={event.premium_level} />}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{categoryIcons[event.category]}</span>
          <span className={`text-sm font-semibold ${categoryColors[event.category]}`}>
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

        {(event.phone || event.website) && (
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
