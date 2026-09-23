import { useState } from 'react'
import { MapPin, Filter, Info, X, ExternalLink } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { useStore } from '../store/useStore'

const MapView = () => {
  const { places } = useStore()
  
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'want-to-try' | 'been-there' | 'favorites'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const placesWithLocations = places
    .filter(place => place.location?.address)
    .map(place => ({
      ...place,
      address: place.location?.address || 'Address not available'
    }))

  // Filter places by category
  const filteredPlaces = selectedCategory === 'all' 
    ? placesWithLocations
    : placesWithLocations.filter(place => place.category === selectedCategory)

  // Generate Google Maps URL for a place
  const getGoogleMapsUrl = (address: string, name: string) => {
    const query = encodeURIComponent(`${name}, ${address}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">地圖檢視</h1>
          <p className="text-gray-600">
            {filteredPlaces.length} 個地點
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          title="篩選"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Category filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">依類別篩選</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 hover:bg-gray-100 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['all', 'want-to-try', 'been-there', 'favorites'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-packet-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' && '全部'}
                {category === 'want-to-try' && '想去'}
                {category === 'been-there' && '去過'}
                {category === 'favorites' && '最愛'}
                <span className="ml-2 text-sm opacity-80">
                  ({placesWithLocations.filter(p => category === 'all' || p.category === category).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Places Grid with Google Maps links */}
      {filteredPlaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{place.name}</h3>
                  <div className="flex items-start space-x-2 mt-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{place.address}</p>
                  </div>
                </div>
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${
                  place.category === 'want-to-try' ? 'bg-yellow-500' :
                  place.category === 'been-there' ? 'bg-green-500' :
                  'bg-pink-500'
                }`}>
                  {place.category === 'want-to-try' ? '?' : 
                   place.category === 'been-there' ? '✓' : 
                   '★'}
                </div>
              </div>
              
              {place.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {place.tags.slice(0, 5).map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  由 {place.addedBy === 'ronald' ? 'Ronald' : 'Kerry'} 新增
                </div>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={place.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span>查看貼文</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  
                  <span className="text-gray-300">|</span>
                  
                  <a
                    href={getGoogleMapsUrl(place.address, place.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-3 py-1.5 bg-packet-purple text-white text-sm rounded-lg hover:bg-packet-purple-dark transition-colors"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>在地圖上查看</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          type="map"
          title="目前沒有地點"
          description="新增有地址資訊的地點，就能在這裡看到"
          actionLabel="新增地點"
          actionPath="/add"
        />
      )}

      {/* Tips */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">使用說明</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 點擊「在地圖上查看」會在 Google Maps 開啟該地點</li>
              <li>• 使用篩選器依類別檢視特定地點</li>
              <li>• 新增地點時記得加入地址資訊</li>
              <li>• 在 Google Maps 可以取得導航、街景等功能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView