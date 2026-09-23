import { Link } from 'react-router-dom'
import { PlusCircle, MapPin, Star, TrendingUp, Clock } from 'lucide-react'
import PlaceCard from '../components/PlaceCard'
import EmptyState from '../components/EmptyState'
import { useStore } from '../store/useStore'

const Home = () => {
  const { places, stats } = useStore()
  const recentPlaces = places.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          歡迎使用 Packet！🍜
        </h1>
        <p className="text-gray-600">
          和另一半一起收藏 Instagram 和 Threads 上的餐廳
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/add"
          className="bg-gradient-to-r from-packet-purple to-packet-pink text-white p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-lg transition-shadow"
        >
          <PlusCircle className="w-8 h-8 mb-2" />
          <span className="font-medium">新增地點</span>
        </Link>
        
        <Link
          to="/map"
          className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md transition-shadow"
        >
          <MapPin className="w-8 h-8 mb-2 text-packet-green" />
          <span className="font-medium text-gray-700">地圖檢視</span>
        </Link>
        
        <Link
          to="/places"
          className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md transition-shadow"
        >
          <Star className="w-8 h-8 mb-2 text-packet-yellow" />
          <span className="font-medium text-gray-700">所有地點</span>
          <span className="text-sm text-gray-500 mt-1">{stats.totalPlaces} 個</span>
        </Link>
        
        <Link
          to="/stats"
          className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center justify-center hover:shadow-md transition-shadow"
        >
          <TrendingUp className="w-8 h-8 mb-2 text-blue-600" />
          <span className="font-medium text-gray-700">統計</span>
          <span className="text-sm text-gray-500 mt-1">查看數據</span>
        </Link>
      </div>

      {/* Recent places */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-900">最近新增</h2>
          </div>
          <Link
            to="/places"
            className="text-packet-purple hover:text-packet-purple-dark font-medium"
          >
            查看全部 →
          </Link>
        </div>

        {recentPlaces.length > 0 ? (
          <div className="space-y-4">
            {recentPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        ) : (
          <EmptyState 
            type="places" 
            title="尚未有地點"
            description="新增你的第一家餐廳開始使用！"
            actionLabel="新增第一個地點"
          />
        )}
      </div>

      {/* Quick stats */}
      <div className="bg-gray-50 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">快速統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-packet-purple">{stats.totalPlaces}</div>
            <div className="text-gray-600">總地點數</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-packet-pink">{stats.placesByPerson.ronald}</div>
            <div className="text-gray-600">Ronald 發現</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-packet-green">{stats.placesByPerson.kerry}</div>
            <div className="text-gray-600">Kerry 發現</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.placesByCategory['want-to-try']}</div>
            <div className="text-gray-600">想去試試</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">💡 如何使用 Packet</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="font-medium text-gray-900">1. 複製連結</div>
            <div className="text-gray-600 text-sm">
              從 Instagram 或 Threads 的分享選單複製貼文連結
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">2. 貼到這裡</div>
            <div className="text-gray-600 text-sm">
              應用程式會自動抓取餐廳名稱和資訊
            </div>
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-900">3. 儲存並分享</div>
            <div className="text-gray-600 text-sm">
              你和另一半都能看到所有儲存的地點
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home