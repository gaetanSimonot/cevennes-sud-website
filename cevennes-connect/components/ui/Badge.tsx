import React from 'react'
import { PremiumLevel } from '@/lib/types'

interface BadgeProps {
  level: PremiumLevel
  children?: React.ReactNode
}

export function Badge({ level, children }: BadgeProps) {
  const classes = {
    standard: 'bg-gray-100 text-gray-700',
    premium: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
    'mega-premium': 'bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white animate-pulse',
  }

  const labels = {
    standard: 'Standard',
    premium: '⭐ Premium',
    'mega-premium': '🌟 Mega Premium',
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${classes[level]}`}>
      {children || labels[level]}
    </span>
  )
}
