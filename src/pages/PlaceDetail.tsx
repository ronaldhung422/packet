import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MapPin, Calendar, Star, Heart, Tag, Edit, Trash2, Map as MapIcon } from 'lucide-react'
import { useStore } from '../store/useStore'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { places, deletePlace, setCategory, addMemory } = useStore()
  const place = places.find(p => p.id === id)
  
  const [showMemoryForm, setShowMemoryForm] = useState(false)
  const [memoryText, setMemoryText] = useState('')

  if (!place) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">找不到此地點</p>
        <Link to="/places" className="text-packet-purple hover:text-packet-purple-dark">
          返回地點列表
        </Link>
      </div>
    )
  }

  const categoryLabels: Record<typeof place.category, string> = {
    'want-to-try': '想去試試',
    'been-there': '去過了',
    favorites: '最愛'
  }

  const categoryClass = {
    'want-to-try': 'bg-yellow-100 text-yellow-800',
    'been-there': 'bg-green-100 text-green-800',
    favorites: 'bg-pink-100 text-pink-800'
  }[place.category]

  const getGoogleMapsUrl = () => {
    if (!place.location?.address) return null
    const query = encodeURIComponent(`${place.name}, ${place.location.address}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  const handleDelete = () => {
    if (window.confirm(`確定要刪除 ${place.name} 嗎？`)) {
      deletePlace(place.id)
      navigate('/places')
    }
  }

  const handleAddMemory = () => {
    if (!memoryText.trim()) return
    addMemory(place.id, memoryText.trim())
    setMemoryText('')
    setShowMemoryForm(false)
  }

  const mapsUrl = getGoogleMapsUrl()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回</span>
        </button>
        
        <div className="flex items-center space-x-2">
          <Link
            to={`/add?edit=${place.id}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="編輯"
          >
            <Edit className="w-5 h-5 text-gray-700" />
          </Link>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="刪除"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="card">
        {/* Title and category */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{place.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryClass}`}>
            {categoryLabels[place.category]}
          </span>
        </div>

        {/* Description */}
        {place.description && (
          <p className="text-gray-700 mb-4">{place.description}</p>
        )}

        {/* Tags */}
        {place.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {place.tags.map(tag => (
              <span key={tag} className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="space-y-3 text-gray-600 mb-6">
          {place.location?.address && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{place.location.address}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span>新增於 {formatDistanceToNow(new Date(place.addedAt), { addSuffix: true })}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={place.discoveredBy === 'ronald' ? 'text-blue-600' : 'text-pink-600'}>
              由 {place.discoveredBy === 'ronald' ? 'Ronald' : 'Kerry'} 新增
            </span>
          </div>
        </div>

        {/* Rating */}
        {place.rating && (
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-gray-700">評分：</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i <= place.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {place.notes && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">備註</h3>
            <p className="text-gray-700">{place.notes}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => window.open(place.link, '_blank', 'noopener,noreferrer')}
            className="flex items-center space-x-2 px-4 py-2 bg-packet-purple text-white rounded-lg hover:bg-packet-purple-dark transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>查看原貼文</span>
          </button>
          
          {mapsUrl && (
            <button
              onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <MapIcon className="w-4 h-4" />
              <span>Google 地圖</span>
            </button>
          )}
        </div>

        {/* Category switcher */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">更改狀態：</h3>
          <div className="flex gap-2">
            {(['want-to-try', 'been-there', 'favorites'] as const).map(category => (
              <button
                key={category}
                onClick={() => setCategory(place.id, category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  place.category === category
                    ? categoryClass
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        {/* Memories section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-packet-pink" />
              <span>回憶 ({place.memories.length})</span>
            </h3>
            <button
              onClick={() => setShowMemoryForm(!showMemoryForm)}
              className="px-3 py-1 bg-packet-purple text-white rounded-lg text-sm hover:bg-packet-purple-dark transition-colors"
            >
              新增回憶
            </button>
          </div>

          {/* Add memory form */}
          {showMemoryForm && (
            <div className="mb-4 flex gap-2">
              <input
                value={memoryText}
                onChange={e => setMemoryText(e.target.value)}
                placeholder="這次的體驗如何？"
                className="input flex-1"
                autoFocus
              />
              <button
                onClick={handleAddMemory}
                disabled={!memoryText.trim()}
                className="btn btn-primary px-4"
              >
                儲存
              </button>
              <button
                onClick={() => {
                  setShowMemoryForm(false)
                  setMemoryText('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          )}

          {/* Memories list */}
          {place.memories.length > 0 ? (
            <div className="space-y-3">
              {place.memories.map((memory, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 italic">"{memory.text}"</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {formatDistanceToNow(new Date(memory.date), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              還沒有回憶。造訪這個地點後，新增你的第一個回憶！
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaceDetail
