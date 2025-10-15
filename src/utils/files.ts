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
