export const checkPWAInstall = async (): Promise<boolean> => {
  // Check if the app is already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return false
  }

  // Check if on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
  
  if (isIOS) {
    // iOS doesn't support beforeinstallprompt event
    // We can show custom instructions instead
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone === true)
    return !isInStandaloneMode
  }

  // For Android/other browsers
  // @ts-ignore - BeforeInstallPromptEvent is not in TypeScript types
  const isPromptEventSupported = 'onbeforeinstallprompt' in window
  
  if (isPromptEventSupported) {
    // @ts-ignore
    return window.deferredPrompt !== undefined
  }

  return false
}

export const showIOSInstallInstructions = (): void => {
  alert('To install Packet on your iPhone:\n\n1. Tap the Share button (📤)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add" in the top right\n\nEnjoy quick access to your food discoveries!')
}

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      
      console.log('Service Worker registered:', registration)
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.')
              // You can show an update notification here
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

export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.update()
      return true
    } catch (error) {
      console.error('Failed to check for updates:', error)
      return false
    }
  }
  return false
}

export const clearServiceWorkerCache = async (): Promise<void> => {
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

export const getAppStatus = (): {
  isInstalled: boolean
  isOnline: boolean
  storageAvailable: boolean
  serviceWorkerActive: boolean
} => {
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches
  const isOnline = navigator.onLine
  
  let storageAvailable = false
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    storageAvailable = true
  } catch {
    storageAvailable = false
  }
  
  const serviceWorkerActive = 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null
  
  return {
    isInstalled,
    isOnline,
    storageAvailable,
    serviceWorkerActive
  }
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }
  return false
}

export const sendLocalNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options
    })
  }
}

// Handle app installation
export const setupInstallPrompt = (): void => {
  // @ts-ignore - BeforeInstallPromptEvent is not in TypeScript types
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault()
    // Stash the event so it can be triggered later
    // @ts-ignore
    window.deferredPrompt = e
    console.log('Install prompt available')
  })
}

// Handle app launched from homescreen
export const handleAppLaunch = (): void => {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('Launched from homescreen')
    // You can track analytics or show welcome message for installed app
  }
}