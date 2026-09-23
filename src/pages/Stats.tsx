import { TrendingUp, Trophy, Calendar, Users, Star, Target, Award } from 'lucide-react'
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

  const ronaldScore = stats.placesByPerson.ronald + (places.filter(p => p.addedBy === 'ronald' && p.category === 'favorites').length * 2)
  const kerryScore = stats.placesByPerson.kerry + (places.filter(p => p.addedBy === 'kerry' && p.category === 'favorites').length * 2)
  
  const leader = ronaldScore > kerryScore ? 'Ronald' : kerryScore > ronaldScore ? 'Kerry' : 'Tie'
  const scoreDifference = Math.abs(ronaldScore - kerryScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t.foodDiscoveryStats[language]}</h1>
        <p className="text-gray-600">{language === 'zh-TW' ? '你們一起的美食旅程' : 'Your journey together, visualized'}</p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-packet-purple" />
            <span className="font-medium text-gray-700">{t.totalPlaces[language]}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalPlaces}</div>
          <div className="text-sm text-gray-600 mt-1">{language === 'zh-TW' ? '美食探索' : 'Food discoveries'}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-medium text-gray-700">{language === 'zh-TW' ? '回憶' : 'Memories'}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalMemories}</div>
          <div className="text-sm text-gray-600 mt-1">{language === 'zh-TW' ? '共同時刻' : 'Shared moments'}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-green-500" />
            <span className="font-medium text-gray-700">{language === 'zh-TW' ? '想嘗試' : 'To Try'}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.placesByCategory['want-to-try']}</div>
          <div className="text-sm text-gray-600 mt-1">{language === 'zh-TW' ? '在清單上' : 'On the list'}</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-gray-700">{language === 'zh-TW' ? '平均評分' : 'Avg Rating'}</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="text-sm text-gray-600 mt-1">{language === 'zh-TW' ? '滿分 5 分' : 'Out of 5'}</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'zh-TW' ? '美食探索排行榜' : 'Food Discovery Leaderboard'}
            </h2>
          </div>
          <div className="text-sm text-gray-600">
            {language === 'zh-TW' ? '分數 = 地點 + (最愛 × 2)' : 'Score = Places + (Favorites × 2)'}
          </div>
        </div>

        <div className="space-y-4">
          {/* Ronald */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👨‍💻</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Ronald</div>
                <div className="text-sm text-gray-600">
                  {stats.placesByPerson.ronald} {language === 'zh-TW' ? '地點' : 'places'} • {places.filter(p => p.addedBy === 'ronald' && p.category === 'favorites').length} {language === 'zh-TW' ? '最愛' : 'favorites'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{ronaldScore}</div>
              <div className="text-sm text-gray-600">{language === 'zh-TW' ? '分' : 'points'}</div>
            </div>
          </div>

          {/* Kerry */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👩‍💻</span>
              </div>
              <div>
                <div className="font-bold text-gray-900">Kerry</div>
                <div className="text-sm text-gray-600">
                  {stats.placesByPerson.kerry} {language === 'zh-TW' ? '地點' : 'places'} • {places.filter(p => p.addedBy === 'kerry' && p.category === 'favorites').length} {language === 'zh-TW' ? '最愛' : 'favorites'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-600">{kerryScore}</div>
              <div className="text-sm text-gray-600">{language === 'zh-TW' ? '分' : 'points'}</div>
            </div>
          </div>

          {/* Winner */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
              {leader === 'Tie' ? (
                <>
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-900">
                    {language === 'zh-TW' ? '平手！' : "It's a tie!"}
                  </span>
                </>
              ) : (
                <>
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-gray-900">
                    {language === 'zh-TW' 
                      ? `${leader} 領先 ${scoreDifference} ${scoreDifference === 1 ? '分' : '分'}！`
                      : `${leader} is winning by ${scoreDifference} ${scoreDifference === 1 ? 'point' : 'points'}!`
                    }
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t.categories[language]}</h3>
          <div className="space-y-4">
            {[
              { category: t.wantToTry[language], count: stats.placesByCategory['want-to-try'], color: 'bg-yellow-500', percentage: stats.totalPlaces > 0 ? (stats.placesByCategory['want-to-try'] / stats.totalPlaces) * 100 : 0 },
              { category: t.beenThere[language], count: stats.placesByCategory['been-there'], color: 'bg-green-500', percentage: stats.totalPlaces > 0 ? (stats.placesByCategory['been-there'] / stats.totalPlaces) * 100 : 0 },
              { category: t.favorites[language], count: stats.placesByCategory.favorites, color: 'bg-pink-500', percentage: stats.totalPlaces > 0 ? (stats.placesByCategory.favorites / stats.totalPlaces) * 100 : 0 }
            ].map((item) => (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-medium text-gray-700">{item.category}</span>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {item.count} ({item.percentage.toFixed(0)}%)
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top tags */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{language === 'zh-TW' ? '熱門標籤' : 'Top Tags'}</h3>
          <div className="space-y-3">
            {topTags.map(([tag, count]) => {
              const percentage = (count / stats.totalPlaces) * 100
              return (
                <div key={tag} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">#{tag}</span>
                    <div className="text-gray-900 font-medium">
                      {count} ({percentage.toFixed(0)}%)
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-packet-purple rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {topTags.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {language === 'zh-TW' ? '還沒有標籤。為你的地點新增標籤！' : 'No tags yet. Add tags to your places!'}
            </div>
          )}
        </div>
      </div>

      {/* Recent additions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t.recentlyAdded[language]}</h3>
        {stats.recentAdditions.length > 0 ? (
          <div className="space-y-3">
            {stats.recentAdditions.slice(0, 5).map((place) => (
              <div key={place.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    place.category === 'want-to-try' ? 'bg-yellow-100 text-yellow-800' :
                    place.category === 'been-there' ? 'bg-green-100 text-green-800' :
                    'bg-pink-100 text-pink-800'
                  }`}>
                    {place.category === 'want-to-try' ? '?' : 
                     place.category === 'been-there' ? '✓' : 
                     '★'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{place.name}</div>
                    <div className="text-sm text-gray-600">
                      {language === 'zh-TW' ? '新增者：' : 'Added by '}{place.addedBy === 'ronald' ? 'Ronald' : 'Kerry'} • {formatDistanceToNow(new Date(place.addedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {place.tags.slice(0, 2).map(tag => `#${tag}`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {language === 'zh-TW' ? '還沒有地點。開始新增吧！' : 'No places yet. Start adding!'}
          </div>
        )}
      </div>

      {/* Fun facts */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{language === 'zh-TW' ? '趣味數據' : 'Fun Facts'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {stats.totalPlaces === 0 ? '0' : Math.round(stats.totalPlaces / 30)}
            </div>
            <div className="text-gray-600">{language === 'zh-TW' ? '每月平均地點數' : 'Average places per month'}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {leader === 'Tie' ? '50/50' : leader === 'Ronald' ? `${Math.round((ronaldScore / (ronaldScore + kerryScore)) * 100)}%` : `${Math.round((kerryScore / (ronaldScore + kerryScore)) * 100)}%`}
            </div>
            <div className="text-gray-600">{language === 'zh-TW' ? '目前領先者佔比' : "Current leader's share"}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {stats.placesByCategory['want-to-try']}
            </div>
            <div className="text-gray-600">{language === 'zh-TW' ? '等待探索的冒險' : 'Adventures waiting'}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex space-x-4">
        <button className="flex-1 btn btn-primary">
          <TrendingUp className="w-5 h-5 mr-2" />
          {language === 'zh-TW' ? '檢視詳細統計' : 'View Detailed Stats'}
        </button>
        <button className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200">
          <Users className="w-5 h-5 mr-2" />
          {language === 'zh-TW' ? '與伴侶比較' : 'Compare with Partner'}
        </button>
      </div>
    </div>
  )
}

export default Stats