import { Calendar, Users, Star, Target, MapPin } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatDistanceToNow } from 'date-fns'
import { useLanguage } from '../contexts/LanguageContext'
import { translations as t } from '../i18n'

const Stats = () => {
  const { stats, places } = useStore()
  const { language } = useLanguage()

  // Calculate additional stats
  const totalMemories = places.reduce((sum, place) => sum + place.memories.length, 0)
  const averageRating = places.filter(p => p.rating).length > 0 
    ? places.filter(p => p.rating).reduce((sum, place) => sum + (place.rating || 0), 0) / places.filter(p => p.rating).length
    : 0
  
  const mostCommonTags = places
    .flatMap(p => p.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const topTags = Object.entries(mostCommonTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const placesWithLocation = places.filter(p => p.location?.address).length

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">統計</h1>
        <p className="text-gray-600">你們的美食收藏總覽</p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-[var(--primary-purple)]" />
            <span className="font-medium text-gray-700">總地點</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalPlaces}</div>
          <div className="text-sm text-gray-600 mt-1">已收藏</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-700">回憶</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalMemories}</div>
          <div className="text-sm text-gray-600 mt-1">個時刻</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-700">想去試試</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.placesByCategory['want-to-try']}</div>
          <div className="text-sm text-gray-600 mt-1">在清單上</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">有地址</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{placesWithLocation}</div>
          <div className="text-sm text-gray-600 mt-1">個地點</div>
        </div>
      </div>

      {/* Discovery Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Users className="w-6 h-6 text-[var(--primary-purple)]" />
          <h2 className="text-xl font-bold text-gray-900">發現統計</h2>
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
                <div className="text-sm text-gray-600">發現者</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">總共</span>
                <span className="font-medium">{stats.placesByPerson.ronald} 間</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">最愛</span>
                <span className="font-medium">{places.filter(p => p.discoveredBy === 'ronald' && p.category === 'favorites').length} 間</span>
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
                <div className="text-sm text-gray-600">發現者</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">總共</span>
                <span className="font-medium">{stats.placesByPerson.kerry} 間</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">最愛</span>
                <span className="font-medium">{places.filter(p => p.discoveredBy === 'kerry' && p.category === 'favorites').length} 間</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">分類統計</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤔</span>
              <span className="text-gray-700">想去試試</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.placesByCategory['want-to-try']}</span>
              <span className="text-sm text-gray-500">
                ({((stats.placesByCategory['want-to-try'] / stats.totalPlaces) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">去過了</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.placesByCategory['been-there']}</span>
              <span className="text-sm text-gray-500">
                ({((stats.placesByCategory['been-there'] / stats.totalPlaces) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⭐</span>
              <span className="text-gray-700">最愛</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">{stats.placesByCategory.favorites}</span>
              <span className="text-sm text-gray-500">
                ({((stats.placesByCategory.favorites / stats.totalPlaces) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top tags */}
      {topTags.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">熱門標籤</h3>
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
          <h3 className="text-lg font-bold text-gray-900 mb-4">最近新增</h3>
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
                      由 {place.discoveredBy === 'ronald' ? 'Ronald' : 'Kerry'} 發現 • {formatDistanceToNow(new Date(place.addedAt), { addSuffix: true, locale: require('date-fns/locale/zh-TW') })}
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
