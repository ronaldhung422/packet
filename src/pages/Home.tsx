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
    { id: 'all' as FilterType, emoji: '🍽️', label: 'All' },
    { id: 'chinese' as FilterType, emoji: '🍜', label: 'Chinese' },
    { id: 'cafe' as FilterType, emoji: '☕', label: 'Cafe' },
    { id: 'dessert' as FilterType, emoji: '🍰', label: 'Dessert' },
    { id: 'japanese' as FilterType, emoji: '🍣', label: 'Japanese' },
    { id: 'western' as FilterType, emoji: '🍝', label: 'Western' },
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
          title="Recently Saved"
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
            title="No collections yet"
            description="Create your first collection to organize restaurants"
          />
        )}
      </div>

      {/* Quick stats */}
      <div className="bg-gray-50 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-packet-purple">{stats.totalPlaces}</div>
            <div className="text-gray-600">Total Places</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-packet-pink">{stats.placesByPerson.ronald}</div>
            <div className="text-gray-600">Ronald Found</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-packet-green">{stats.placesByPerson.kerry}</div>
            <div className="text-gray-600">Kerry Found</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{stats.placesByCategory['want-to-try']}</div>
            <div className="text-gray-600">Want to Try</div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <FAB onClick={() => setShowAddSheet(true)} label="Add Place" />

      {/* Add Place Bottom Sheet */}
      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="Add Place"
      >
        <div className="space-y-3">
          <Link
            to="/add"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-medium">Paste IG/Threads Link</div>
              <div className="text-sm text-gray-500">Auto-fetch restaurant info</div>
            </div>
          </Link>
          
          <Link
            to="/add?source=instagram"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">📷</span>
            <div>
              <div className="font-medium">Import from Instagram</div>
              <div className="text-sm text-gray-500">Choose from saved posts</div>
            </div>
          </Link>
          
          <Link
            to="/add?source=threads"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">🧵</span>
            <div>
              <div className="font-medium">Import from Threads</div>
              <div className="text-sm text-gray-500">Connect Threads account</div>
            </div>
          </Link>
          
          <Link
            to="/add?manual=true"
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all"
            onClick={() => setShowAddSheet(false)}
          >
            <span className="text-2xl">✍️</span>
            <div>
              <div className="font-medium">Manual Entry</div>
              <div className="text-sm text-gray-500">Fill in restaurant details</div>
            </div>
          </Link>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Home