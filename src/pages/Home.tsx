import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle, MapPin, Star, TrendingUp, Clock } from 'lucide-react'
import PlaceCard from '../components/PlaceCard'
import EmptyState from '../components/EmptyState'
import { FilterChips } from '../components/FilterChips'
import { PlaceCarousel } from '../components/PlaceCarousel'
import { CollectionCard } from '../components/CollectionCard'
import { FAB } from '../components/FAB'
import { BottomSheet } from '../components/BottomSheet'
import { useStore } from '../store/useStore'
import { FilterType } from '../types'

const Home = () => {
  const { places, stats, collections } = useStore()
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
  const [showAddSheet, setShowAddSheet] = useState(false)
  
  const recentPlaces = places.slice(0, 8)
  
  const filters = [
    { id: 'all' as FilterType, emoji: '🍽️', label: '全部' },
    { id: 'chinese' as FilterType, emoji: '🍜', label: '中餐' },
    { id: 'cafe' as FilterType, emoji: '☕', label: '咖啡' },
    { id: 'dessert' as FilterType, emoji: '🍰', label: '甜點' },
    { id: 'japanese' as FilterType, emoji: '🍣', label: '日式' },
    { id: 'western' as FilterType, emoji: '🍝', label: '西餐' },
  ]

  const getPlacesForCollection = (collectionId: string) => {
    return places.filter(p => p.collectionIds?.includes(collectionId))
  }

  const getCoverImageForCollection = (collectionId: string) => {
    const collectionPlaces = getPlacesForCollection(collectionId)
    return collectionPlaces[0]?.coverImage
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Filter Chips */}
      <FilterChips 
        filters={filters}
        selected={selectedFilter}
        onSelect={setSelectedFilter}
      />

      {/* Recent Saved Carousel */}
      {recentPlaces.length > 0 && (
        <PlaceCarousel 
          places={recentPlaces}
          title="最近 Saved"
        />
      )}

      {/* Collections Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Collections</h2>
        {collections.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                placesCount={getPlacesForCollection(collection.id).length}
                coverImage={getCoverImageForCollection(collection.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            type="places" 
            title="尚未有收藏夾"
            description="建立你的第一個收藏夾開始整理餐廳！"
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

      {/* FAB */}
      <FAB onClick={() => setShowAddSheet(true)} label="新增餐廳" />

      {/* Add Place Bottom Sheet */}
      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="新增餐廳"
      >
        <div className="space-y-3">
          <Link
            to="/add"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-medium">貼上 IG/Threads Link</div>
              <div className="text-sm text-gray-500">自動抓取餐廳資訊</div>
            </div>
          </Link>
          
          <Link
            to="/add?source=instagram"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">📷</span>
            <div>
              <div className="font-medium">從 Instagram 匯入</div>
              <div className="text-sm text-gray-500">選擇已儲存的貼文</div>
            </div>
          </Link>
          
          <Link
            to="/add?source=threads"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">🧵</span>
            <div>
              <div className="font-medium">從 Threads 匯入</div>
              <div className="text-sm text-gray-500">連結 Threads 帳號</div>
            </div>
          </Link>
          
          <Link
            to="/add?manual=true"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">✍️</span>
            <div>
              <div className="font-medium">手動輸入</div>
              <div className="text-sm text-gray-500">自己填寫餐廳資訊</div>
            </div>
          </Link>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Home