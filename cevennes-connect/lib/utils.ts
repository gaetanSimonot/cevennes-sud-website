import { Actor, Event } from './types'

/**
 * Format date to French locale
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Clean text for JSON (remove special characters)
 */
export function cleanTextForJSON(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape quotes
    .trim()
}

/**
 * Detect if an actor/event already exists
 */
export function detectDuplicate<T extends Actor | Event>(
  items: T[],
  newItem: T,
  comparisonFields: (keyof T)[]
): T | null {
  return items.find(item => {
    return comparisonFields.every(field => {
      const itemValue = String(item[field]).toLowerCase().trim()
      const newItemValue = String(newItem[field]).toLowerCase().trim()
      return itemValue === newItemValue
    })
  }) || null
}

/**
 * Generate unique ID from timestamp
 */
export function generateId(): number {
  return Date.now()
}

/**
 * Sort actors by premium level
 */
export function sortByPremiumLevel(actors: Actor[]): Actor[] {
  const levelOrder = { 'mega-premium': 0, 'premium': 1, 'standard': 2 }
  return [...actors].sort((a, b) => {
    const levelA = levelOrder[a.premium_level || 'standard']
    const levelB = levelOrder[b.premium_level || 'standard']
    return levelA - levelB
  })
}

/**
 * Filter items by search term
 */
export function filterBySearch<T extends { name?: string; title?: string; description: string }>(
  items: T[],
  searchTerm: string
): T[] {
  if (!searchTerm) return items

  const term = searchTerm.toLowerCase()
  return items.filter(item => {
    const name = 'name' in item ? item.name : 'title' in item ? item.title : ''
    return (
      (name || '').toLowerCase().includes(term) ||
      item.description.toLowerCase().includes(term)
    )
  })
}
