/**
 * Script de migration des données JSON vers Supabase
 *
 * Usage: npx ts-node scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function migrateEvents() {
  console.log('📅 Migrating events...')

  try {
    // Read JSON file
    const eventsPath = path.join(process.cwd(), 'public', 'data', 'events-data.json')
    const eventsJSON = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'))

    console.log(`   Found ${eventsJSON.length} events in JSON`)

    // Transform data (remove id if it's a temp id, let Supabase generate it)
    const eventsToInsert = eventsJSON.map((event: any) => ({
      ...event,
      // Convert date to proper format if needed
      date: event.date,
      // Ensure all required fields have defaults
      description: event.description || '',
      time: event.time || '',
      location: event.location || '',
      address: event.address || '',
      price: event.price || '',
      organizer: event.organizer || '',
      contact: event.contact || '',
      website: event.website || '',
      image: event.image || '',
      lat: event.lat || 43.9339,
      lng: event.lng || 3.7086,
      premium_level: event.premium_level || 'standard'
    }))

    // Insert in batches of 100
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < eventsToInsert.length; i += batchSize) {
      const batch = eventsToInsert.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('events')
        .insert(batch)
        .select()

      if (error) {
        console.error(`   ❌ Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }

      inserted += data.length
      console.log(`   ✅ Inserted ${inserted}/${eventsToInsert.length} events`)
    }

    console.log(`   🎉 Successfully migrated ${inserted} events!\n`)
    return inserted

  } catch (error) {
    console.error('   ❌ Error migrating events:', error)
    throw error
  }
}

async function migrateActors() {
  console.log('👤 Migrating actors...')

  try {
    // Read JSON file
    const actorsPath = path.join(process.cwd(), 'public', 'data', 'actors-data.json')
    const actorsJSON = JSON.parse(fs.readFileSync(actorsPath, 'utf-8'))

    // Flatten all categories
    const allActors: any[] = []
    for (const [category, actors] of Object.entries(actorsJSON)) {
      if (Array.isArray(actors)) {
        actors.forEach((actor: any, index: number) => {
          allActors.push({
            ...actor,
            category: category,
            // Generate stable ID if not present
            id: actor.id || `${category}-${index}`,
            description: actor.description || '',
            address: actor.address || '',
            phone: actor.phone || '',
            email: actor.email || '',
            website: actor.website || '',
            horaires: actor.horaires || actor.hours || actor.opening_hours,
            specialites: actor.specialites || [],
            lat: actor.lat || actor.latitude || 43.9339,
            lng: actor.lng || actor.longitude || 3.7086,
            image: actor.image || actor.logo_url || '',
            rating: actor.rating,
            reviews_count: actor.reviews_count || 0,
            premium_level: actor.premium_level || 'standard'
          })
        })
      }
    }

    console.log(`   Found ${allActors.length} actors in JSON`)

    // Insert in batches of 100
    const batchSize = 100
    let inserted = 0

    for (let i = 0; i < allActors.length; i += batchSize) {
      const batch = allActors.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('actors')
        .insert(batch)
        .select()

      if (error) {
        console.error(`   ❌ Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }

      inserted += data.length
      console.log(`   ✅ Inserted ${inserted}/${allActors.length} actors`)
    }

    console.log(`   🎉 Successfully migrated ${inserted} actors!\n`)
    return inserted

  } catch (error) {
    console.error('   ❌ Error migrating actors:', error)
    throw error
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...')

  try {
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    const { count: actorsCount, error: actorsError } = await supabase
      .from('actors')
      .select('*', { count: 'exact', head: true })

    if (eventsError) throw eventsError
    if (actorsError) throw actorsError

    console.log(`   ✅ Events in Supabase: ${eventsCount}`)
    console.log(`   ✅ Actors in Supabase: ${actorsCount}\n`)

    return { eventsCount, actorsCount }
  } catch (error) {
    console.error('   ❌ Error verifying migration:', error)
    throw error
  }
}

async function main() {
  console.log('\n🚀 Starting migration to Supabase...\n')
  console.log('=' .repeat(50))
  console.log('\n')

  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables!')
    }

    console.log('✅ Environment variables found\n')

    // Migrate events
    const eventsInserted = await migrateEvents()

    // Migrate actors
    const actorsInserted = await migrateActors()

    // Verify
    const { eventsCount, actorsCount } = await verifyMigration()

    // Summary
    console.log('=' .repeat(50))
    console.log('\n🎉 MIGRATION COMPLETE!\n')
    console.log(`   📅 Events: ${eventsInserted} inserted, ${eventsCount} total in DB`)
    console.log(`   👤 Actors: ${actorsInserted} inserted, ${actorsCount} total in DB`)
    console.log('\n' + '='.repeat(50) + '\n')

  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
main()
