import { useState, useEffect } from 'react'

export function useAppVersion() {
    const [version, setVersion] = useState<string>('Loading...')

    useEffect(() => {
        async function getVersion() {
            try {
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.getRegistration()

                    if (registration && registration.active) {
                        // Create a message channel to communicate with the service worker
                        const messageChannel = new MessageChannel()

                        // Listen for the response
                        messageChannel.port1.onmessage = (event) => {
                            if (event.data && event.data.version) {
                                // Extract just the timestamp part for cleaner display
                                const fullVersion = event.data.version
                                const match = fullVersion.match(/1\.0\.0-(\d+)/)
                                if (match) {
                                    const timestamp = parseInt(match[1])
                                    const date = new Date(timestamp)
                                    setVersion(`v${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)
                                } else {
                                    setVersion(fullVersion)
                                }
                            }
                        }

                        // Send message to service worker
                        registration.active.postMessage(
                            { type: 'GET_VERSION' },
                            [messageChannel.port2]
                        )
                    } else {
                        // Fallback if service worker is not available
                        setVersion('Dev Mode')
                    }
                } else {
                    setVersion('Not Available')
                }
            } catch (error) {
                console.error('Error getting app version:', error)
                setVersion('Unknown')
            }
        }

        getVersion()
    }, [])

    return version
}
