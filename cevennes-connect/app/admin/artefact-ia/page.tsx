'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, TextArea } from '@/components/ui/Input'

export default function ArtefactIAPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'url' | 'image'>('text')
  const [content, setContent] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // TODO: Implement OpenAI extraction
    setTimeout(() => {
      setIsAnalyzing(false)
      setExtractedData({
        title: 'Événement extrait par IA',
        description: 'Description générée automatiquement',
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm">← Retour</Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Artefact IA</h1>
              <p className="text-sm text-gray-500">Extraction automatique d&apos;informations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-custom py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-4 mb-8">
            <Button
              variant={activeTab === 'text' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('text')}
            >
              📝 Texte
            </Button>
            <Button
              variant={activeTab === 'url' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('url')}
            >
              🔗 URL
            </Button>
            <Button
              variant={activeTab === 'image' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('image')}
            >
              🖼️ Screenshot
            </Button>
          </div>

          {/* Content Input */}
          <div className="card mb-8">
            {activeTab === 'text' && (
              <TextArea
                label="Collez votre texte ici"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Collez le texte contenant les informations d'événement..."
              />
            )}

            {activeTab === 'url' && (
              <Input
                label="URL de la page"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://..."
              />
            )}

            {activeTab === 'image' && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Upload Screenshot</p>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <span className="text-6xl mb-4 block">📸</span>
                  <p className="text-gray-600">Glissez une image ici ou cliquez pour sélectionner</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              variant="primary"
              className="mt-4"
              disabled={!content || isAnalyzing}
            >
              {isAnalyzing ? 'Analyse en cours...' : '✨ Analyser avec IA'}
            </Button>
          </div>

          {/* Extracted Data */}
          {extractedData && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Données extraites</h3>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
              <Button variant="primary" className="mt-4">
                📤 Publier sur GitHub
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
