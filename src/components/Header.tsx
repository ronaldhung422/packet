import { Link } from 'react-router-dom'
import { Menu, Bell, Settings } from 'lucide-react'
import { useStore } from '../store/useStore'

const Header = () => {
  const { stats } = useStore()

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and stats */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-packet-purple to-packet-pink rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">🍜</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Packet</h1>
                <p className="text-xs text-gray-600">Food discoveries</p>
              </div>
            </Link>
            
            {/* Quick stats */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-packet-purple">{stats.totalPlaces}</div>
                <div className="text-xs text-gray-600">places</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-packet-pink">
                  {Math.max(stats.placesByPerson.ronald, stats.placesByPerson.kerry)}
                </div>
                <div className="text-xs text-gray-600">leading</div>
              </div>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            {/* Sync indicator */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${navigator.onLine ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {navigator.onLine ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </button>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-700" />
            </Link>

            {/* Mobile menu */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Mobile quick stats */}
        <div className="md:hidden mt-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-packet-purple">{stats.totalPlaces}</div>
              <div className="text-xs text-gray-600">Total places</div>
            </div>
            <div className="flex-1 text-center border-x border-gray-200">
              <div className="text-lg font-bold text-packet-pink">{stats.placesByPerson.ronald}</div>
              <div className="text-xs text-gray-600">Ronald</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-lg font-bold text-packet-green">{stats.placesByPerson.kerry}</div>
              <div className="text-xs text-gray-600">Kerry</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header