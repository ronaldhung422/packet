import { Link } from 'react-router-dom'
import { UtensilsCrossed, MapPin, Heart, Users } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { translations as t } from '../i18n'

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
  const { language } = useLanguage()
  
  const getConfig = () => {
    switch (type) {
      case 'places':
        return {
          icon: UtensilsCrossed,
          defaultTitle: t.noPlacesYetEmpty[language],
          defaultDescription: t.startByAdding[language],
          defaultAction: t.emptyStateAddFirstPlace[language],
          color: 'text-packet-purple',
          bgColor: 'bg-purple-50'
        }
      case 'map':
        return {
          icon: MapPin,
          defaultTitle: t.noLocationsYet[language],
          defaultDescription: t.addPlacesWithLocations[language],
          defaultAction: t.addPlace[language],
          color: 'text-packet-green',
          bgColor: 'bg-green-50'
        }
      case 'memories':
        return {
          icon: Heart,
          defaultTitle: t.noMemoriesYet[language],
          defaultDescription: t.addMemoriesToPlaces[language],
          defaultAction: t.browsePlaces[language],
          color: 'text-packet-pink',
          bgColor: 'bg-pink-50'
        }
      case 'pairing':
        return {
          icon: Users,
          defaultTitle: t.notPairedYetEmpty[language],
          defaultDescription: t.pairWithPartnerToShare[language],
          defaultAction: t.pairNowAction[language],
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
        <h4 className="text-sm font-medium text-gray-700 mb-4">{t.quickTips[language]}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          {type === 'places' && (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📱 {t.copyFromInstagram[language]}</div>
                <div>{t.tapShareCopyLink[language]}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">🔗 {t.pasteHere[language]}</div>
                <div>{t.appExtractsInfo[language]}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📝 {t.addManually[language]}</div>
                <div>{t.typeNameIfFails[language]}</div>
              </div>
            </>
          )}
          
          {type === 'map' && (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📍 {t.addLocations[language]}</div>
                <div>{t.includeAddresses[language]}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">🗺️ {t.viewNearby[language]}</div>
                <div>{t.findPlacesWhenOut[language]}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">📌 {t.saveForLater[language]}</div>
                <div>{t.planNextAdventure[language]}</div>
              </div>
            </>
          )}
          
          {type === 'pairing' && (
            <>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">👫 {t.sharedCollection[language]}</div>
                <div>{t.bothSeeAllPlaces[language]}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">🏆 {t.friendlyCompetition[language]}</div>
                <div>{t.seeWhoFindsMore[language]}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-1">💝 {t.foodMemoriesShared[language]}</div>
                <div>{t.buildSharedDiary[language]}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmptyState