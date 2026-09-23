import { NavLink } from 'react-router-dom'
import { Home, Map, PlusCircle, List, BarChart2, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import i18n from '../i18n'

const Navigation = () => {
  const { language } = useLanguage()
  
  const navItems = useMemo(() => [
    {
      path: '/',
      label: i18n.t('navigation.home', language),
      icon: Home
    },
    {
      path: '/places',
      label: i18n.t('navigation.places', language),
      icon: List
    },
    {
      path: '/add',
      label: i18n.t('navigation.add', language),
      icon: PlusCircle
    },
    {
      path: '/map',
      label: i18n.t('navigation.map', language),
      icon: Map
    },
    {
      path: '/stats',
      label: i18n.t('navigation.stats', language),
      icon: BarChart2
    },
    {
      path: '/pair',
      label: i18n.t('navigation.pair', language),
      icon: Users
    }
  ], [language])

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-3 px-2 flex-1 transition-colors ${
                    isActive
                      ? 'text-packet-purple'
                      : 'text-gray-500 hover:text-gray-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                      <Icon className="w-6 h-6" />
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-packet-purple rounded-full" />
                      )}
                    </div>
                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>
      
      {/* iPhone home indicator spacer */}
      <div className="h-4 bg-white" />
    </nav>
  )
}

export default Navigation