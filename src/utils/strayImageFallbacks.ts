/**
 * Helper library for providing fallback placeholder images based on photo URL characteristics
 */

/**
 * Available placeholder images organized by type
 */
const PLACEHOLDER_IMAGES = {
  cats: [
    '/placeholder/placeholder-cat-1.webp',
    '/placeholder/placeholder-cat-2.webp',
    '/placeholder/placeholder-cat-3.webp',
    '/placeholder/placeholder-cat-4.webp',
    '/placeholder/placeholder-cat-5.webp',
    '/placeholder/placeholder-cat-6.webp',
  ],
  dogs: [
    '/placeholder/placeholder-dog-7.webp',
    '/placeholder/placeholder-dog-8.webp',
    '/placeholder/placeholder-dog-9.webp',
    '/placeholder/placeholder-dog-10.webp',
    '/placeholder/placeholder-dog-11.webp',
  ],
} as const

/**
 * Gets a fallback placeholder image based on the stray type or photo URL characteristics
 * @param photoUrl - The original photo URL to analyze
 * @param strayType - Optional stray type ('cats' | 'dogs') to directly specify the placeholder type
 * @returns Path to the appropriate placeholder image
 */
export function getPlaceholderImage(
  photoUrl: string,
  strayType?: 'cats' | 'dogs'
): string {
  if (!photoUrl || typeof photoUrl !== 'string') {
    return PLACEHOLDER_IMAGES.cats[0] // Default fallback
  }

  // If stray type is provided, use it directly
  if (strayType) {
    return PLACEHOLDER_IMAGES[strayType][0]
  }

  const lastChar = photoUrl.slice(-1)

  // If the last character is a digit, use it to select a placeholder
  if (/\d/.test(lastChar)) {
    const digit = parseInt(lastChar, 10)

    // Map digits to placeholders:
    // 0-5: cat placeholders (1-6, with 0 mapping to 6)
    // 6-9: dog placeholders (7-11, with 6 mapping to 7)
    if (digit >= 0 && digit <= 5) {
      const index = digit === 0 ? 5 : digit - 1 // 0->5, 1->0, 2->1, etc.
      return PLACEHOLDER_IMAGES.cats[index]
    } else if (digit >= 6 && digit <= 9) {
      const index = digit - 6 // 6->0, 7->1, 8->2, 9->3
      return PLACEHOLDER_IMAGES.dogs[index]
    }
  }

  // For non-digit characters or edge cases, use a default based on URL content
  // Check if URL contains 'cat' or 'dog' keywords for smarter fallback
  const urlLower = photoUrl.toLowerCase()
  if (urlLower.includes('cat')) {
    return PLACEHOLDER_IMAGES.cats[0]
  } else if (urlLower.includes('dog')) {
    return PLACEHOLDER_IMAGES.dogs[0]
  }

  // Final fallback to first cat placeholder
  return PLACEHOLDER_IMAGES.cats[0]
}

/**
 * Gets a random placeholder image for a specific type
 * @param type - The type of placeholder to get ('cats' | 'dogs')
 * @returns Random placeholder image path
 */
export function getRandomPlaceholderImage(type: 'cats' | 'dogs'): string {
  const images = PLACEHOLDER_IMAGES[type]
  const randomIndex = Math.floor(Math.random() * images.length)
  return images[randomIndex]
}
