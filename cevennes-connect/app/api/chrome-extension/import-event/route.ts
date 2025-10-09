import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const event = await request.json()

    console.log('📥 Événement reçu de l\'extension Chrome:', event.title)

    // Insérer directement dans Supabase
    const { data, error } = await supabase
      .from('events')
      .insert([{
        title: event.title,
        category: event.category || 'culture',
        description: event.description || '',
        date: event.date,
        time: event.time || '14:00',
        end_time: event.endTime || event.end_time,
        location: event.location || '',
        address: event.address || '',
        lat: event.lat ? parseFloat(event.lat) : null,
        lng: event.lng ? parseFloat(event.lng) : null,
        image: event.image || '',
        price: event.price || '',
        organizer: event.organizer || '',
        contact: event.contact || '',
        website: event.website || event.sourceUrl || '',
        is_premium: false,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      console.error('❌ Erreur Supabase:', error)
      return NextResponse.json({
        error: 'Failed to insert event',
        details: error.message
      }, { status: 500 })
    }

    console.log('✅ Événement inséré dans Supabase:', data[0].id)

    return NextResponse.json({
      success: true,
      eventId: data[0].id,
      message: 'Événement publié avec succès !'
    })

  } catch (error: any) {
    console.error('❌ Erreur:', error)
    return NextResponse.json({
      error: 'Failed to process event',
      details: error.message
    }, { status: 500 })
  }
}
