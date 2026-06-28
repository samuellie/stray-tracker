// Extract key from URL for API calls
export const getThumbnailKey = (url: string) => {
  const pathname = new URL(url).pathname
  return pathname.replace(/\/([^\/]+)$/, (match, filename) => {
    return '/' + filename.replace(/(\.[^.]*)?$/, '_thumbnail$1')
  })
}

// Extract key from URL for API calls
export const getKey = (url: string) => {
  const pathname = new URL(url).pathname
  return pathname
}

// Returns '' when no url is available so <Img> falls through to its unloader/placeholder
export const getSightingThumbnailUrl = (url?: string) => {
  if (url) return `/api/files/animal-photos/${getThumbnailKey(url)}`
  return ''
}

export const getSightingFullImageUrl = (url?: string) => {
  if (url) return `/api/files/animal-photos/${getKey(url)}`
  return ''
}
