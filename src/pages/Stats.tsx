import { TrendingUp, Trophy, Calendar, Users, Star, Target, Award } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatDistanceToNow } from 'date-fns'

const Stats = () => {
  const { stats, places } = useStore()

  // Calculate additional stats
  const totalMemories = places.reduce((sum, place) => sum + place.memories.length, 0)
  const placesWithLocation = places.filter(p => p.location?.address).length
  
  const mostCommonTags = places
    .flatMap(p => p.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const topTags = Object.entries(mostCommonTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-gray-600">Your food collection overview</p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-[var(--primary-purple)]" />
            <span className="font-medium text-gray-700">Total Places</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalPlaces}</div>
          <div className="text-sm text-gray-600 mt-1">Saved</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-700">Memories</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalMemories}</div>
          <div className="text-sm text-gray-600 mt-1">Moments</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-700">To Try</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.placesByCategory['want-to-try']}</div>
          <div className="text-sm text-gray-600 mt-1">On list</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">With Address</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{placesWithLocation}</div>
          <div className="text-sm text-gray-600 mt-1">Places</div>
        </div>
      </div>

      {/* Discovery Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-[var(--primary-purple)]" />
          <h2 className="text-xl font-bold text-gray-900">Discovery Stats</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Ronald */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Ronald</div>
                <div className="text-sm text-gray-600">Discoverer</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">{stats.placesByPerson.ronald} places</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Favorites</span>
                <span className="font-medium">{places.filter(p => p.discoveredBy === 'ronald' && p.category === 'favorites').length} places</span>
              </div>
            </div>
          </div>

          {/* Kerry */}
          <div className="bg-white rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👩</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Kerry</div>
                <div className="text-sm text-gray-600">Discoverer</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">{stats.placesByPerson.kerry} places</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Favorites</span>
                <span className="font-medium">{places.filter(p => p.discoveredBy === 'kerry' && p.category === 'favorites').length} places</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤔</span>
              <span className="text-gray-700">Want to Try</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.placesByCategory['want-to-try']}</span>
              <span className="text-sm text-gray-500">
                ({stats.totalPlaces > 0 ? ((stats.placesByCategory['want-to-try'] / stats.totalPlaces) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Been There</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.placesByCategory['been-there']}</span>
              <span className="text-sm text-gray-500">
                ({stats.totalPlaces > 0 ? ((stats.placesByCategory['been-there'] / stats.totalPlaces) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⭐</span>
              <span className="text-gray-700">Favorites</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.placesByCategory.favorites}</span>
              <span className="text-sm text-gray-500">
                ({stats.totalPlaces > 0 ? ((stats.placesByCategory.favorites / stats.totalPlaces) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Tags</h3>
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <div
                key={tag}
                className="px-4 py-2 bg-[var(--bg-secondary)] rounded-full flex items-center space-x-2"
              >
                <span className="font-medium text-gray-900">#{tag}</span>
                <span className="text-sm text-gray-500">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent additions */}
      {stats.recentAdditions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recently Added</h3>
          <div className="space-y-3">
            {stats.recentAdditions.slice(0, 5).map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                    place.category === 'want-to-try' ? 'bg-yellow-500' : 
                    place.category === 'been-there' ? 'bg-green-500' : 
                    'bg-pink-500'
                  }`}>
                    {place.category === 'want-to-try' ? '?' : 
                     place.category === 'been-there' ? '✓' : 
                     '★'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{place.name}</div>
                    <div className="text-sm text-gray-600">
                      By {place.discoveredBy === 'ronald' ? 'Ronald' : 'Kerry'} • {formatDistanceToNow(new Date(place.addedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {place.tags.slice(0, 2).map(tag => `#${tag}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Stats
