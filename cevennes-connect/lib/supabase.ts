import { createClient } from '@supabase/supabase-js'

// Client-side Supabase (with anon key - safe for browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side Supabase (with service role key - bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Types
export interface Event {
  id?: number
  title: string
  category: 'festival' | 'marche' | 'culture' | 'sport' | 'atelier' | 'theatre'
  description: string
  date: string
  time: string
  location: string
  address: string
  price: string
  organizer: string
  contact: string
  website: string
  image: string
  lat: number
  lng: number
  premium_level?: 'standard' | 'premium' | 'mega-premium'
  created_at?: string
  updated_at?: string
}

export interface Actor {
  id?: string
  name: string
  category: 'commerce' | 'restaurant' | 'artisan' | 'therapeute' | 'service' | 'association'
  description: string
  address: string
  phone: string
  email: string
  website: string
  horaires?: string
  specialites?: string[]
  lat: number
  lng: number
  image: string
  rating?: number
  reviews_count?: number
  premium_level?: 'standard' | 'premium' | 'mega-premium'
  created_at?: string
  updated_at?: string
}

// Events CRUD
export const eventsDB = {
  // Get all events with filters
  async getAll(filters?: {
    category?: string
    time?: 'all' | 'past' | 'future'
    search?: string
    page?: number
    limit?: number
  }) {
    let query = supabaseAdmin.from('events').select('*', { count: 'exact' })

    // Category filter
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    // Time filter
    if (filters?.time && filters.time !== 'all') {
      const today = new Date().toISOString().split('T')[0]
      if (filters.time === 'future') {
        query = query.gte('date', today)
      } else if (filters.time === 'past') {
        query = query.lt('date', today)
      }
    }

    // Search filter
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('date', { ascending: true })

    const { data, error, count } = await query

    if (error) throw error

    return {
      events: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  },

  // Get one event
  async getOne(id: number) {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create event
  async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert([event])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update event
  async update(id: number, updates: Partial<Event>) {
    const { data, error } = await supabaseAdmin
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete event
  async delete(id: number) {
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Bulk delete
  async bulkDelete(ids: number[]) {
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .in('id', ids)

    if (error) throw error
    return ids.length
  }
}

// Actors CRUD
export const actorsDB = {
  // Get all actors with filters
  async getAll(filters?: {
    category?: string
    search?: string
    page?: number
    limit?: number
  }) {
    let query = supabaseAdmin.from('actors').select('*', { count: 'exact' })

    // Category filter
    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }

    // Search filter
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
    }

    // Pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order('name', { ascending: true })

    const { data, error, count } = await query

    if (error) throw error

    return {
      actors: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  },

  // Get one actor
  async getOne(id: string) {
    const { data, error } = await supabaseAdmin
      .from('actors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Create actor
  async create(actor: Omit<Actor, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseAdmin
      .from('actors')
      .insert([actor])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update actor
  async update(id: string, updates: Partial<Actor>) {
    const { data, error } = await supabaseAdmin
      .from('actors')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete actor
  async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('actors')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Bulk delete
  async bulkDelete(ids: string[]) {
    const { error } = await supabaseAdmin
      .from('actors')
      .delete()
      .in('id', ids)

    if (error) throw error
    return ids.length
  }
}
