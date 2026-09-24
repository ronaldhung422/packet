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
          defaultDescription: 'Start by adding your first restaurant',
          defaultAction: 'Add First Place',
          color: 'text-packet-purple',
          bgColor: 'bg-purple-50',
          tips: [
            { emoji: '📱', title: 'Copy from Instagram', desc: 'Tap share, copy link' },
            { emoji: '🔗', title: 'Paste here', desc: 'App extracts info automatically' },
            { emoji: '📝', title: 'Add manually', desc: 'Type name if extraction fails' }
          ]
        }
      case 'map':
        return {
          icon: MapPin,
          defaultTitle: 'No locations yet',
          defaultDescription: 'Add places with locations to see them on the map',
          defaultAction: 'Add Place',
          color: 'text-packet-green',
          bgColor: 'bg-green-50',
          tips: [
            { emoji: '📍', title: 'Add locations', desc: 'Include addresses when saving' },
            { emoji: '🗺️', title: 'View nearby', desc: 'Find places when you\'re out' },
            { emoji: '📌', title: 'Save for later', desc: 'Plan your next adventure' }
          ]
        }
      case 'memories':
        return {
          icon: Heart,
          defaultTitle: 'No memories yet',
          defaultDescription: 'Start adding memories to your favorite places',
          defaultAction: 'Browse Places',
          color: 'text-packet-pink',
          bgColor: 'bg-pink-50',
          tips: []
        }
      case 'pairing':
        return {
          icon: Users,
          defaultTitle: 'Not paired yet',
          defaultDescription: 'Pair with your partner to share your food discoveries',
          defaultAction: 'Pair Now',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          tips: [
            { emoji: '👫', title: 'Shared collection', desc: 'Both see all saved places' },
            { emoji: '🏆', title: 'Friendly competition', desc: 'See who finds more gems' },
            { emoji: '💝', title: 'Food memories', desc: 'Build your shared food diary' }
          ]
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
      {config.tips.length > 0 && (
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Quick Tips</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            {config.tips.map((tip, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">{tip.emoji} {tip.title}</div>
                <div>{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default EmptyState
