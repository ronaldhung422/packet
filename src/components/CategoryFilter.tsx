import { Filter } from 'lucide-react'

interface CategoryFilterProps {
  activeCategory: 'all' | 'want-to-try' | 'been-there' | 'favorites'
  onCategoryChange: (category: 'all' | 'want-to-try' | 'been-there' | 'favorites') => void
  showCounts?: boolean
  counts?: {
    all: number
    'want-to-try': number
    'been-there': number
    favorites: number
  }
}

const CategoryFilter = ({ 
  activeCategory, 
  onCategoryChange, 
  showCounts = true,
  counts = { all: 0, 'want-to-try': 0, 'been-there': 0, favorites: 0 }
}: CategoryFilterProps) => {
  const categories = [
    {
      id: 'all' as const,
      label: 'All Places',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      activeColor: 'bg-gray-800 text-white',
      icon: '📋'
    },
    {
      id: 'want-to-try' as const,
      label: 'Want to Try',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      activeColor: 'bg-yellow-500 text-white',
      icon: '🤔'
    },
    {
      id: 'been-there' as const,
      label: 'Been There',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      activeColor: 'bg-green-500 text-white',
      icon: '✅'
    },
    {
      id: 'favorites' as const,
      label: 'Favorites',
      color: 'text-pink-700',
      bgColor: 'bg-pink-100',
      activeColor: 'bg-pink-500 text-white',
      icon: '⭐'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-700">Filter by category</h3>
        </div>
        
        {showCounts && (
          <div className="text-sm text-gray-600">
            {counts.all} total • {counts['want-to-try']} to try • {counts['been-there']} visited • {counts.favorites} favorites
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isActive = activeCategory === category.id
          const count = counts[category.id]
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? category.activeColor
                  : `${category.bgColor} ${category.color} hover:opacity-90`
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="font-medium">{category.label}</span>
              {showCounts && count > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive
                    ? 'bg-white/20'
                    : `${category.bgColor} ${category.color}`
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Quick stats */}
      {showCounts && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-200">
          {categories.map((category) => {
            const count = counts[category.id]
            const percentage = counts.all > 0 ? Math.round((count / counts.all) * 100) : 0
            
            return (
              <div key={category.id} className="text-center">
                <div className={`text-2xl font-bold mb-1 ${category.color}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-600">{category.label}</div>
                {percentage > 0 && (
                  <div className="mt-1">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${category.bgColor} rounded-full`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CategoryFilter