import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Grid, List, SortAsc, SortDesc } from 'lucide-react'
import PlaceCard from '../components/PlaceCard'
import EmptyState from '../components/EmptyState'
import CategoryFilter from '../components/CategoryFilter'
import { useStore } from '../store/useStore'

const Places = () => {
  const navigate = useNavigate()
  const { places, deletePlace } = useStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'want-to-try' | 'been-there' | 'favorites'>('all')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Filter and sort places
  const filteredAndSortedPlaces = useMemo(() => {
    let result = [...places]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(place =>
        place.name.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query) ||
        place.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(place => place.category === activeCategory)
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'category':
          const categoryOrder = { 'want-to-try': 0, 'been-there': 1, favorites: 2 }
          comparison = categoryOrder[a.category] - categoryOrder[b.category]
          break
      }

      return sortOrder === 'desc' ? comparison : -comparison
    })

    return result
  }, [places, searchQuery, activeCategory, sortBy, sortOrder])

  // Calculate counts for each category
  const categoryCounts = useMemo(() => ({
    all: places.length,
    'want-to-try': places.filter(p => p.category === 'want-to-try').length,
    'been-there': places.filter(p => p.category === 'been-there').length,
    favorites: places.filter(p => p.category === 'favorites').length
  }), [places])

  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Places</h1>
          <p className="text-gray-600">{places.length} places saved</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places, tags, or descriptions..."
            className="input pl-12"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category filter */}
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          showCounts
          counts={categoryCounts}
        />

        {/* Sort controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSortBy('date')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sortBy === 'date'
                    ? 'bg-packet-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Date
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sortBy === 'name'
                    ? 'bg-packet-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('category')}
                className={`px-3 py-1 rounded-full text-sm ${
                  sortBy === 'category'
                    ? 'bg-packet-purple text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Category
              </button>
            </div>
          </div>
          
          <button
            onClick={handleSortToggle}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            {sortOrder === 'desc' ? (
              <SortDesc className="w-4 h-4" />
            ) : (
              <SortAsc className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}
            </span>
          </button>
        </div>
      </div>

      {/* Places list */}
      {filteredAndSortedPlaces.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
          {filteredAndSortedPlaces.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              onEdit={(place) => {
                navigate(`/add?edit=${place.id}`)
              }}
              onDelete={deletePlace}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type="places"
          title={searchQuery ? "No matches found" : undefined}
          description={
            searchQuery 
              ? `No places match "${searchQuery}". Try a different search.`
              : undefined
          }
          actionLabel={searchQuery ? undefined : "Add First Place"}
          actionPath={searchQuery ? undefined : "/add"}
        />
      )}

      {/* Stats summary */}
      {filteredAndSortedPlaces.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-packet-purple">{filteredAndSortedPlaces.length}</div>
              <div className="text-gray-600">Showing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-packet-pink">
                {filteredAndSortedPlaces.filter(p => p.category === 'want-to-try').length}
              </div>
              <div className="text-gray-600">To try</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-packet-green">
                {filteredAndSortedPlaces.filter(p => p.category === 'been-there').length}
              </div>
              <div className="text-gray-600">Visited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAndSortedPlaces.filter(p => p.category === 'favorites').length}
              </div>
              <div className="text-gray-600">Favorites</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Places