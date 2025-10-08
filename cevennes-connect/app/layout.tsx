import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Cévennes Connect | Plateforme Locale',
  description: 'Plateforme locale pour le Sud Cévennes - Annuaire, Événements et Petites Annonces',
  keywords: 'Cévennes, Ganges, annuaire local, événements, petites annonces',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
