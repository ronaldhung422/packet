import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import { useStore } from '../store/useStore'

const Layout = () => {
  const { appState } = useStore()

  return (
    <div className="min-h-screen flex flex-col safe-area-top safe-area-bottom">
      {/* Status bar spacer for iOS */}
      <div className="h-0 bg-packet-purple" />
      
      <Header />
      
      <main className="flex-1 overflow-y-auto pb-16"> {/* pb-16 for bottom nav */}
        <div className="container mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
      
      <Navigation />
      
      {/* Sync status indicator */}
      {appState.offlineChanges > 0 && (
        <div className="fixed bottom-16 right-4 z-40">
          <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
            {appState.offlineChanges} unsynced
          </div>
        </div>
      )}
      
      {/* Pairing status indicator */}
      {appState.isPaired && (
        <div className="fixed top-16 right-4 z-40">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Paired with {appState.partnerName === 'ronald' ? 'Ronald' : 'Kerry'}
          </div>
        </div>
      )}
    </div>
  )
}

export default Layout