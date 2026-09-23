import { Link } from 'react-router-dom'
import { UtensilsCrossed, MapPin, Heart, Users } from 'lucide-react'

interface EmptyStateProps {
  type: 'places' | 'map' | 'memories' | 'pairing'
  title?: string
  description?: string
  actionLabel?: string
  actionPath?: string
}

const EmptyState = ({ 
  type, 
  title, 
  description, 
  actionLabel, 
  actionPath = '/add' 
}: EmptyStateProps) => {
  const getConfig = () => {
    switch (type) {
      case 'places':
        return {
          icon: UtensilsCrossed,
          defaultTitle: 'No places yet',
          defaultDescription: 'Start by adding your first restaurant from Instagram or Threads',
          defaultAction: 'Add First Place',
          color: 'text-packet-purple',
          bgColor: 'bg-purple-50'
        }
      case 'map':
        return {
          icon: MapPin,
          defaultTitle: 'No locations yet',
          defaultDescription: 'Add places with locations to see them on the map',
          defaultAction: 'Add Place',
          color: 'text-packet-green',
          bgColor: 'bg-green-50'
        }
      case 'memories':
        return {
          icon: Heart,
          defaultTitle: 'No memories yet',
          defaultDescription: 'Add memories to your visited places to create your food diary',
          defaultAction: 'Browse Places',
          color: 'text-packet-pink',
          bgColor: 'bg-pink-50'
        }
      case 'pairing':
        return {
          icon: Users,
          defaultTitle: 'Not paired yet',
          defaultDescription: 'Pair with your partner to share your food discoveries',
          defaultAction: 'Pair Now',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <div className="text-center py-12 px-4">
      <div className={`inline-flex p-6 rounded-2xl ${config.bgColor} mb-6`}>
        <Icon className={`w-12 h-12 ${config.color}`} />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title || config.defaultTitle}
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {description || config.defaultDescription}
      </p>

      {actionLabel !== null && (
        <Link
          to={actionPath}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-packet-purple text-white rounded-lg font-medium hover:bg-packet-purple-dark transition-colors"
        >
          <span>{actionLabel || config.defaultAction}</span>
        </Link>
      )}

      {/* Tips based on type */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Quick tips:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          {type === 'places' && (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📱 Copy from Instagram</div>
                <div>Tap share → Copy link</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">🔗 Paste here</div>
                <div>App extracts restaurant info</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📝 Add manually</div>
                <div>Type name if extraction fails</div>
              </div>
            </>
          )}
          
          {type === 'map' && (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📍 Add locations</div>
                <div>Include addresses when saving</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">🗺️ View nearby</div>
                <div>Find places when you're out</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📌 Save for later</div>
                <div>Plan your next food adventure</div>
              </div>
            </>
          )}
          
          {type === 'pairing' && (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">👫 Shared collection</div>
                <div>Both see all saved places</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">🏆 Friendly competition</div>
                <div>See who finds more gems</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">💝 Food memories</div>
                <div>Build your shared food diary</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmptyState