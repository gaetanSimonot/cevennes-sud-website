'use client'

import { useState, useRef, useEffect } from 'react'
import { EventCategory } from '@/lib/types'

interface FilterBubblesProps {
  onTimeFilterChange: (filter: 'now' | 'today' | 'weekend' | 'month' | 'all') => void
  onCategoryChange: (category: EventCategory | 'all') => void
  currentTimeFilter: 'now' | 'today' | 'weekend' | 'month' | 'all'
  currentCategory: EventCategory | 'all'
  children?: React.ReactNode
}

// Configuration centralisée des bulles
const BUBBLE_CONFIG = {
  size: {
    bubble: { width: 320, height: 320 },
    carousel: { width: 210, height: 130, top: '48%' } // Augmenté height de 110 à 130, remonté top de 54% à 48%
  },
  text: {
    current: { base: 'text-3xl', scale: 'scale-125' },
    small: { size: 'text-[31px]', scale: 'scale-125' }, // pour MAINTENANT, AUJOURD'HUI (26px + 20% = 31px)
    medium: { size: 'text-[35px]', scale: 'scale-125' }, // pour CE WEEK-END (29px + 20% = 35px)
    faded: 'text-sm'
  },
  gap: { mobile: 'gap-6', desktop: 'gap-8' }
}

export function FilterBubbles({
  onTimeFilterChange,
  onCategoryChange,
  currentTimeFilter,
  currentCategory,
  children
}: FilterBubblesProps) {
  // Time filter options
  const timeOptions: Array<{ key: 'now' | 'today' | 'weekend' | 'month' | 'all', label: string }> = [
    { key: 'now', label: 'MAINTENANT' },
    { key: 'today', label: "AUJOURD'HUI" },
    { key: 'weekend', label: 'CE WEEK-END' },
    { key: 'month', label: 'CE MOIS' },
    { key: 'all', label: 'TOUS' },
  ]

  // Category options
  const categoryOptions: Array<{ key: EventCategory | 'all', label: string }> = [
    { key: 'all', label: 'TOUS' },
    { key: 'festival', label: 'MUSIQUE' },
    { key: 'culture', label: 'CULTURE' },
    { key: 'theatre', label: 'THÉÂTRE' },
    { key: 'sport', label: 'SPORT' },
    { key: 'atelier', label: 'ATELIER' },
    { key: 'marche', label: 'MARCHÉ' },
  ]

  // Helper function to get text size class
  const getTextSizeClass = (key: string) => {
    if (key === 'now') return 'text-[23px]' // MAINTENANT (26px - 10% = 23px)
    if (key === 'today') return 'text-[20px]' // AUJOURD'HUI
    if (key === 'weekend') return 'text-[24px]' // CE WEEK-END
    if (key === 'month') return 'text-[40px]' // CE MOIS
    return 'text-[48px]' // TOUS
  }

  const [timeIndex, setTimeIndex] = useState(() =>
    timeOptions.findIndex(opt => opt.key === currentTimeFilter)
  )
  const [categoryIndex, setCategoryIndex] = useState(() =>
    categoryOptions.findIndex(opt => opt.key === currentCategory)
  )

  // Sync indices when props change
  useEffect(() => {
    const newTimeIndex = timeOptions.findIndex(opt => opt.key === currentTimeFilter)
    if (newTimeIndex !== -1) setTimeIndex(newTimeIndex)
  }, [currentTimeFilter])

  useEffect(() => {
    const newCategoryIndex = categoryOptions.findIndex(opt => opt.key === currentCategory)
    if (newCategoryIndex !== -1) setCategoryIndex(newCategoryIndex)
  }, [currentCategory])

  // Touch handling for swipe
  const timeStartX = useRef(0)
  const categoryStartX = useRef(0)

  const handleTimeNext = () => {
    const newIndex = (timeIndex + 1) % timeOptions.length
    setTimeIndex(newIndex)
    onTimeFilterChange(timeOptions[newIndex].key)
  }

  const handleTimePrev = () => {
    const newIndex = (timeIndex - 1 + timeOptions.length) % timeOptions.length
    setTimeIndex(newIndex)
    onTimeFilterChange(timeOptions[newIndex].key)
  }

  const handleCategoryNext = () => {
    const newIndex = (categoryIndex + 1) % categoryOptions.length
    setCategoryIndex(newIndex)
    onCategoryChange(categoryOptions[newIndex].key)
  }

  const handleCategoryPrev = () => {
    const newIndex = (categoryIndex - 1 + categoryOptions.length) % categoryOptions.length
    setCategoryIndex(newIndex)
    onCategoryChange(categoryOptions[newIndex].key)
  }

  // Touch handlers
  const handleTimeTouchStart = (e: React.TouchEvent) => {
    timeStartX.current = e.touches[0].clientX
  }

  const handleTimeTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const diff = timeStartX.current - endX
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleTimeNext()
      else handleTimePrev()
    }
  }

  const handleCategoryTouchStart = (e: React.TouchEvent) => {
    categoryStartX.current = e.touches[0].clientX
  }

  const handleCategoryTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const diff = categoryStartX.current - endX
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleCategoryNext()
      else handleCategoryPrev()
    }
  }

  return (
    <div className={`flex flex-row items-center justify-center ${BUBBLE_CONFIG.gap.mobile} md:${BUBBLE_CONFIG.gap.desktop}`}>
      {/* Bubble: Que faire? */}
      <div className="relative" style={{ width: BUBBLE_CONFIG.size.bubble.width, height: BUBBLE_CONFIG.size.bubble.height }}>
        {/* Your PNG Background */}
        <img
          src="/bubble-quefaire.png"
          alt="Que faire"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Carousel content - positioned in white oval */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-full cursor-pointer select-none"
          style={{
            top: BUBBLE_CONFIG.size.carousel.top,
            width: BUBBLE_CONFIG.size.carousel.width,
            height: BUBBLE_CONFIG.size.carousel.height
          }}
          onClick={handleCategoryNext}
          onTouchStart={handleCategoryTouchStart}
          onTouchEnd={handleCategoryTouchEnd}
        >
          {/* Scrolling list */}
          <div className="flex flex-col items-center justify-center h-full relative">
            {/* Previous item (faded) */}
            <div className="text-center opacity-20 transition-all duration-300">
              <p className={`font-black ${BUBBLE_CONFIG.text.faded} text-gray-600 uppercase tracking-tight leading-relaxed whitespace-nowrap`}>
                {categoryOptions[(categoryIndex - 1 + categoryOptions.length) % categoryOptions.length].label}
              </p>
            </div>

            {/* Current item (full opacity) */}
            <div className={`text-center py-2 scale-125 relative z-10`}>
              <p className="font-black text-[38px] text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-600 uppercase tracking-tight drop-shadow-sm leading-relaxed whitespace-nowrap">
                {categoryOptions[categoryIndex].label}
              </p>
            </div>

            {/* Next item (faded) */}
            <div className="text-center opacity-20 transition-all duration-300">
              <p className={`font-black ${BUBBLE_CONFIG.text.faded} text-gray-600 uppercase tracking-tight leading-relaxed whitespace-nowrap`}>
                {categoryOptions[(categoryIndex + 1) % categoryOptions.length].label}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content between bubbles (desktop only) */}
      {children && <div className="hidden md:block">{children}</div>}

      {/* Bubble: Quand? donc */}
      <div className="relative" style={{ width: BUBBLE_CONFIG.size.bubble.width, height: BUBBLE_CONFIG.size.bubble.height }}>
        {/* Your PNG Background */}
        <img
          src="/bubble-quand.png"
          alt="Quand donc"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Carousel content - positioned in white oval */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden rounded-full cursor-pointer select-none"
          style={{
            top: BUBBLE_CONFIG.size.carousel.top,
            width: BUBBLE_CONFIG.size.carousel.width,
            height: BUBBLE_CONFIG.size.carousel.height
          }}
          onClick={handleTimeNext}
          onTouchStart={handleTimeTouchStart}
          onTouchEnd={handleTimeTouchEnd}
        >
          {/* Scrolling list */}
          <div className="flex flex-col items-center justify-center h-full relative">
            {/* Previous item (faded) */}
            <div className="text-center opacity-20 transition-all duration-300">
              <p className={`font-black ${BUBBLE_CONFIG.text.faded} text-gray-600 uppercase tracking-tight leading-relaxed whitespace-nowrap`}>
                {timeOptions[(timeIndex - 1 + timeOptions.length) % timeOptions.length].label}
              </p>
            </div>

            {/* Current item (full opacity) */}
            <div className={`text-center py-2 ${BUBBLE_CONFIG.text.current.scale} relative z-10`}>
              <p className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 uppercase tracking-tight drop-shadow-sm leading-relaxed whitespace-nowrap ${
                getTextSizeClass(timeOptions[timeIndex].key)
              }`}>
                {timeOptions[timeIndex].label}
              </p>
            </div>

            {/* Next item (faded) */}
            <div className="text-center opacity-20 transition-all duration-300">
              <p className={`font-black ${BUBBLE_CONFIG.text.faded} text-gray-600 uppercase tracking-tight leading-relaxed whitespace-nowrap`}>
                {timeOptions[(timeIndex + 1) % timeOptions.length].label}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
