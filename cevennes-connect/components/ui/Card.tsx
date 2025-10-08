import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-6 shadow-lg
        ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
