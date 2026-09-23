// Service Worker registration and management

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })

      console.log('Service Worker registered with scope:', registration.scope)

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.')
              // Show update notification to user
              showUpdateNotification()
            }
          })
        }
      })

      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.unregister()
      console.log('Service Worker unregistered')
      return true
    } catch (error) {
      console.error('Service Worker unregistration failed:', error)
      return false
    }
  }
  return false
}

export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
      console.log('Service Worker update check complete')
      return true
    } catch (error) {
      console.error('Failed to check for updates:', error)
      return false
    }
  }
  return false
}

export const clearCache = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('All caches cleared')
    } catch (error) {
      console.error('Failed to clear caches:', error)
    }
  }
}

export const getServiceWorkerState = async (): Promise<{
  isControlled: boolean
  state: string | null
  scriptURL: string | null
}> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    const worker = registration.active || registration.installing || registration.waiting
    
    return {
      isControlled: !!navigator.serviceWorker.controller,
      state: worker?.state || null,
      scriptURL: worker?.scriptURL || null
    }
  }
  
  return {
    isControlled: false,
    state: null,
    scriptURL: null
  }
}

export const sendMessageToServiceWorker = async (message: any): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage(message)
    } catch (error) {
      console.error('Failed to send message to Service Worker:', error)
    }
  }
}

export const requestBackgroundSync = async (tag: string): Promise<boolean> => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      // @ts-ignore - SyncManager is not in TypeScript types
      await registration.sync.register(tag)
      console.log('Background sync registered:', tag)
      return true
    } catch (error) {
      console.error('Background sync registration failed:', error)
      return false
    }
  }
  
  console.log('Background sync not supported')
  return false
}

export const requestPeriodicSync = async (tag: string, minInterval: number): Promise<boolean> => {
  if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      // @ts-ignore - PeriodicSyncManager is not in TypeScript types
      await registration.periodicSync.register(tag, {
        minInterval: minInterval * 24 * 60 * 60 * 1000 // Convert days to milliseconds
      })
      console.log('Periodic sync registered:', tag)
      return true
    } catch (error) {
      console.error('Periodic sync registration failed:', error)
      return false
    }
  }
  
  console.log('Periodic sync not supported')
  return false
}

// Helper function to show update notification
function showUpdateNotification(): void {
  // Create a simple notification in the UI
  const notification = document.createElement('div')
  notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
  notification.innerHTML = `
    <div class="flex items-center space-x-2">
      <span>New update available!</span>
      <button onclick="location.reload()" class="px-2 py-1 bg-white text-blue-500 rounded text-sm font-medium">
        Refresh
      </button>
    </div>
  `
  
  document.body.appendChild(notification)
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 10000)
}

// Check if the app is running in standalone mode (installed as PWA)
export const isStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
}

// Get display mode
export const getDisplayMode = (): string => {
  if (isStandalone()) {
    return 'standalone'
  } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen'
  } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui'
  } else if (window.matchMedia('(display-mode: browser)').matches) {
    return 'browser'
  }
  return 'unknown'
}

// Initialize service worker and PWA features
export const initializePWA = async (): Promise<void> => {
  console.log('Initializing PWA features...')
  
  // Register service worker
  await registerServiceWorker()
  
  // Check display mode
  const displayMode = getDisplayMode()
  console.log('Display mode:', displayMode)
  
  // Handle app launch from homescreen
  if (isStandalone()) {
    console.log('App launched from homescreen')
    // You can track analytics or show special welcome message here
  }
  
  // Set up beforeinstallprompt handler
  // @ts-ignore - BeforeInstallPromptEvent is not in TypeScript types
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault()
    // Stash the event so it can be triggered later
    // @ts-ignore
    window.deferredPrompt = e
    console.log('Before install prompt event captured')
    
    // Notify UI that install is available
    document.dispatchEvent(new CustomEvent('pwa-install-available'))
  })
  
  // Handle app installed event
  window.addEventListener('appinstalled', () => {
    console.log('App was installed')
    // Clear the deferredPrompt so it can be garbage collected
    // @ts-ignore
    window.deferredPrompt = null
    // Notify UI that app was installed
    document.dispatchEvent(new CustomEvent('pwa-installed'))
  })
}