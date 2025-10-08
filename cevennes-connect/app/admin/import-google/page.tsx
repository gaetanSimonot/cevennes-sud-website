'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function ImportGooglePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">← Retour</Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Import Google Places</h1>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="card max-w-2xl mx-auto text-center">
          <span className="text-6xl mb-4 block">🔄</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Import Google Places
          </h2>
          <p className="text-gray-600 mb-8">
            Fonctionnalité en cours de développement
          </p>
        </div>
      </main>
    </div>
  )
}
