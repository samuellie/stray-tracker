/**
 * Maps raw errors to user-facing, actionable messages.
 * Falls back to the provided message when nothing more specific applies.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): { title: string; description?: string } {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      title: 'You appear to be offline',
      description: 'Check your connection and try again.',
    }
  }

  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : ''

  if (/unauthorized|not authenticated|401/i.test(message)) {
    return {
      title: 'Your session has expired',
      description: 'Please sign in again to continue.',
    }
  }

  if (/fetch|network|load failed/i.test(message)) {
    return {
      title: 'Could not reach the server',
      description: 'Check your connection and try again in a moment.',
    }
  }

  if (message) {
    return { title: fallback, description: message }
  }

  return { title: fallback }
}
