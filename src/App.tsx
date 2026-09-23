import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Home from './pages/Home'
import AddPlace from './pages/AddPlace'
import Places from './pages/Places'
import PlaceDetail from './pages/PlaceDetail'
import CollectionDetail from './pages/CollectionDetail'
import MapView from './pages/MapView'
import Stats from './pages/Stats'
import Pairing from './pages/Pairing'
import Settings from './pages/Settings'
import { useStore } from './store/useStore'
import { initializePWA, getDisplayMode } from './utils/serviceWorker'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const { initializeApp } = useStore()

  useEffect(() => {
    // Initialize app state
    initializeApp()

    // Initialize PWA features
    initializePWA().then(() => {
      console.log('PWA initialization complete')
    })

    // Check if app is installed
    console.log('Display mode:', getDisplayMode())

    // Listen for install prompt availability
    const handleInstallAvailable = () => {
      setShowInstallPrompt(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallPrompt(false)
    }

    document.addEventListener('pwa-install-available', handleInstallAvailable)
    document.addEventListener('pwa-installed', handleAppInstalled)

    // Handle offline/online status
    const handleOnline = () => {
      console.log('App is online')
      // Trigger sync here
    }

    const handleOffline = () => {
      console.log('App is offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for deferred prompt on mount
    // @ts-ignore
    if (window.deferredPrompt) {
      setShowInstallPrompt(true)
    }

    return () => {
      document.removeEventListener('pwa-install-available', handleInstallAvailable)
      document.removeEventListener('pwa-installed', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [initializeApp])

  const handleInstall = () => {
    // @ts-ignore - BeforeInstallPromptEvent is not in TypeScript types
    if (window.deferredPrompt) {
      // @ts-ignore
      window.deferredPrompt.prompt()
      // @ts-ignore
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted PWA installation')
        } else {
          console.log('User dismissed PWA installation')
        }
        // @ts-ignore
        window.deferredPrompt = null
        setShowInstallPrompt(false)
      })
    }
  }

  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 2000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="add" element={<AddPlace />} />
              <Route path="places" element={<Places />} />
              <Route path="place/:id" element={<PlaceDetail />} />
              <Route path="collection/:id" element={<CollectionDetail />} />
              <Route path="map" element={<MapView />} />
              <Route path="stats" element={<Stats />} />
              <Route path="pair" element={<Pairing />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>

        {/* PWA Install Prompt */}
        {showInstallPrompt && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-packet-purple to-packet-pink rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🍜</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Install Packet</p>
                  <p className="text-sm text-gray-600">Add to home screen for quick access</p>
                </div>
              </div>
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-packet-purple text-white rounded-lg font-medium hover:bg-packet-purple-dark transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
    </LanguageProvider>
  )
}

export default App