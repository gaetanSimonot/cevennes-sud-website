import Image from 'next/image'
import { Actor } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'

interface ActorCardProps {
  actor: Actor
}

export function ActorCard({ actor }: ActorCardProps) {
  const categoryIcons = {
    commerce: '🏪',
    restaurant: '🍽️',
    artisan: '🔨',
    therapeute: '💆',
    service: '💼',
    association: '👥',
  }

  const categoryColors = {
    commerce: 'from-blue-500 to-blue-600',
    restaurant: 'from-orange-500 to-red-600',
    artisan: 'from-yellow-500 to-orange-600',
    therapeute: 'from-green-500 to-emerald-600',
    service: 'from-purple-500 to-indigo-600',
    association: 'from-pink-500 to-rose-600',
  }

  // Standard: nom uniquement
  if (!actor.premium_level || actor.premium_level === 'standard') {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200">
        <div className="flex items-center">
          <div className={`w-8 h-8 bg-gradient-to-br ${categoryColors[actor.category]} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
            <span className="text-white text-sm">{categoryIcons[actor.category]}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{actor.name}</h3>
            <p className="text-xs text-gray-500">{actor.category}</p>
          </div>
        </div>
      </div>
    )
  }

  // Premium et Mega-Premium: carte complète
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={actor.image}
          alt={actor.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <Badge level={actor.premium_level} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{categoryIcons[actor.category]}</span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[actor.category]}`}>
            {actor.category}
          </span>
        </div>

        <h3 className="font-bold text-xl text-gray-900 mb-3">
          {actor.name}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {actor.description}
        </p>

        <div className="space-y-2 text-sm">
          {actor.address && (
            <div className="flex items-start text-gray-600">
              <span className="mr-2 mt-0.5">📍</span>
              <span className="line-clamp-2">{actor.address}</span>
            </div>
          )}

          {actor.phone && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📞</span>
              <span>{actor.phone}</span>
            </div>
          )}

          {actor.horaires && (
            <div className="flex items-start text-gray-600">
              <span className="mr-2 mt-0.5">🕐</span>
              <span className="line-clamp-2">{actor.horaires}</span>
            </div>
          )}

          {actor.rating && (
            <div className="flex items-center text-gray-600">
              <span className="mr-2">⭐</span>
              <span>{actor.rating.toFixed(1)} ({actor.reviews_count} avis)</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {actor.phone && (
            <a
              href={`tel:${actor.phone}`}
              className="flex-1 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-200 transition text-center"
            >
              📞 Appeler
            </a>
          )}
          {actor.website && (
            <a
              href={actor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition text-center"
            >
              🌐 Site
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
