// Types for Actors (Acteurs Locaux)
export type ActorCategory = 'commerce' | 'restaurant' | 'artisan' | 'therapeute' | 'service' | 'association'
export type PremiumLevel = 'standard' | 'premium' | 'mega-premium'

export interface Actor {
  name: string
  category: ActorCategory
  description: string
  address: string
  phone: string
  email: string
  website: string
  horaires: string
  specialites: string[]
  lat: number
  lng: number
  image: string
  rating?: number
  reviews_count?: number
  premium_level?: PremiumLevel
}

export interface ActorsData {
  commerce: Actor[]
  restaurant: Actor[]
  artisan: Actor[]
  therapeute: Actor[]
  service: Actor[]
  association: Actor[]
}

// Types for Events (Événements)
export type EventCategory = 'marche' | 'culture' | 'sport' | 'festival' | 'atelier' | 'theatre'

export interface Event {
  id: number
  title: string
  category: EventCategory
  description: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
  location: string
  address: string
  price: string
  organizer: string
  contact: string
  website: string
  image: string
  image_url?: string
  lat: number
  lng: number
  latitude?: number
  longitude?: number
  contact_email?: string
  contact_phone?: string
  premium_level?: PremiumLevel
  featured?: boolean // For premium/highlighted events
}

// API Response types
export interface GitHubCommitRequest {
  filePath: string
  content: string
  commitMessage: string
}

export interface OpenAIRequest {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  model?: string
  max_tokens?: number
  temperature?: number
}

export interface GeocodeRequest {
  address: string
}
