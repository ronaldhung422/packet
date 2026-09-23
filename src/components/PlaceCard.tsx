import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin, Calendar, Star, MoreVertical, ExternalLink, Trash2, Plus, Map } from 'lucide-react'
import { Place } from '../types'
import { formatDistanceToNow } from 'date-fns'
import { useStore } from '../store/useStore'
import { AvatarBadge } from './AvatarBadge'

interface PlaceCardProps {
  place: Place
  onEdit?: (place: Place) => void
  onDelete?: (placeId: string) => void
}

const categoryLabels: Record<Place['category'], string> = {
  'want-to-try': '想去',
  'been-there': '去過',
  favorites: '最愛'
}

const PlaceCard = ({ place, onEdit, onDelete }: PlaceCardProps) => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [showMemoryForm, setShowMemoryForm] = useState(false)
  const [memoryText, setMemoryText] = useState('')
  const { setCategory, addMemory, toggleLike, currentUser } = useStore()

  const isLiked = place.likedBy?.includes(currentUser) || false

  const categoryClass = {
    'want-to-try': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'been-there': 'bg-green-100 text-green-800 border-green-200',
    favorites: 'bg-pink-100 text-pink-800 border-pink-200'
  }[place.category]

  // Generate Google Maps URL
  const getGoogleMapsUrl = () => {
    if (!place.location?.address) return null
    const query = encodeURIComponent(`${place.name}, ${place.location.address}`)
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  }

  const handleAddMemory = () => {
    if (!memoryText.trim()) return
    addMemory(place.id, memoryText.trim())
    setMemoryText('')
    setShowMemoryForm(false)
  }

  const handleDelete = () => {
    if (window.confirm(`確定要刪除 ${place.name} 嗎？`)) {
      onDelete?.(place.id)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a, input')) {
      return
    }
    navigate(`/place/${place.id}`)
  }

  const mapsUrl = getGoogleMapsUrl()

  return (
    <article 
      className="card group cursor-pointer hover:shadow-lg transition-shadow" 
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      {place.coverImage && (
        <div className="relative -mx-4 -mt-4 mb-4 h-48 overflow-hidden rounded-t-2xl">
          <img 
            src={place.coverImage} 
            alt={place.name}
            className="h-full w-full object-cover"
          />
          {/* Avatar Badge overlay */}
          <div className="absolute bottom-2 left-2">
            <AvatarBadge user={place.discoveredBy} size="md" />
          </div>
          {/* Like button overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleLike(place.id)
            }}
            className="absolute bottom-2 right-2 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart 
              size={20} 
              className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}
            />
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {!place.coverImage && <AvatarBadge user={place.discoveredBy} size="sm" />}
            <h3 className="text-lg font-semibold text-gray-900 truncate">{place.name}</h3>
          </div>
          {place.description && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{place.description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!place.coverImage && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLike(place.id)
              }}
              className="icon-button"
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <Heart 
                size={18} 
                className={isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'}
              />
            </button>
          )}
          <button onClick={() => setShowMenu(!showMenu)} className="icon-button" aria-label={`Actions for ${place.name}`}>
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
              <button onClick={() => window.open(place.link, '_blank', 'noopener,noreferrer')} className="menu-item">
                <ExternalLink className="h-4 w-4" /> 開啟貼文
              </button>
              {mapsUrl && (
                <button onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')} className="menu-item">
                  <Map className="h-4 w-4" /> Google 地圖
                </button>
              )}
              <button onClick={() => onEdit?.(place)} className="menu-item">編輯詳情</button>
              <button onClick={handleDelete} className="menu-item text-red-600">
                <Trash2 className="h-4 w-4" /> 刪除
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${categoryClass}`}>{categoryLabels[place.category]}</span>
        {place.tags.map(tag => <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">#{tag}</span>)}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-gray-500">
        <div className="flex min-w-0 items-center gap-3">
          {place.location?.address && <span className="flex min-w-0 items-center gap-1 truncate"><MapPin className="h-4 w-4 shrink-0" />{place.location.address}</span>}
          <span className="flex shrink-0 items-center gap-1"><Calendar className="h-4 w-4" />{formatDistanceToNow(new Date(place.addedAt), { addSuffix: true })}</span>
        </div>
        {place.likedBy && place.likedBy.length > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-red-500">
            <Heart className="h-4 w-4 fill-current" />
            {place.likedBy.length}
          </span>
        )}
      </div>

      {place.rating && <div className="mt-2 flex items-center gap-1">{[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-4 w-4 ${i <= place.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}</div>}

      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-3">
        {(['want-to-try', 'been-there', 'favorites'] as Place['category'][]).map(category => (
          <button key={category} onClick={() => setCategory(place.id, category)} className={`rounded-full px-2.5 py-1 text-xs ${place.category === category ? categoryClass : 'bg-gray-100 text-gray-600'}`}>
            {categoryLabels[category]}
          </button>
        ))}
        <button onClick={() => setShowMemoryForm(!showMemoryForm)} className="ml-auto flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
          <Plus className="h-3.5 w-3.5" /> 回憶
        </button>
      </div>

      {showMemoryForm && <div className="mt-3 flex gap-2">
        <input value={memoryText} onChange={e => setMemoryText(e.target.value)} placeholder="感覺如何？" className="input flex-1" autoFocus />
        <button onClick={handleAddMemory} disabled={!memoryText.trim()} className="btn btn-primary px-3">儲存</button>
      </div>}

      {place.memories.length > 0 && <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><Heart className="h-4 w-4 text-packet-pink" /> 回憶 ({place.memories.length})</div>
        <p className="mt-1 text-sm italic text-gray-600">"{place.memories[place.memories.length - 1].text}"</p>
      </div>}
    </article>
  )
}

export default PlaceCard
export { PlaceCard }
