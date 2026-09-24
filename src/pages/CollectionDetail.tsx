import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MoreVertical, Edit2, Trash2, GripVertical } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/useStore'
import PlaceCard from '../components/PlaceCard'
import { FAB } from '../components/FAB'
import { BottomSheet } from '../components/BottomSheet'
import EmptyState from '../components/EmptyState'

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { collections, places, deleteCollection, updateCollection, addPlaceToCollection, removePlaceFromCollection } = useStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showEditSheet, setShowEditSheet] = useState(false)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showMoveSheet, setShowMoveSheet] = useState(false)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmoji, setEditEmoji] = useState('')
  const [draggedPlace, setDraggedPlace] = useState<string | null>(null)

  const collection = collections.find(c => c.id === id)
  const collectionPlaces = places.filter(p => p.collectionIds?.includes(id || ''))

  if (!collection) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Collection not found</h1>
        <button
          onClick={() => navigate('/')}
          className="text-[var(--primary-purple)] hover:underline"
        >
          Back to Home
        </button>
      </div>
    )
  }

  const handleEdit = () => {
    setEditName(collection.name)
    setEditEmoji(collection.emoji)
    setShowEditSheet(true)
    setShowMenu(false)
  }

  const handleSaveEdit = () => {
    if (editName.trim() && editEmoji.trim()) {
      updateCollection(collection.id, {
        name: editName.trim(),
        emoji: editEmoji.trim()
      })
      setShowEditSheet(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${collection.name}"? Places will not be deleted.`)) {
      deleteCollection(collection.id)
      navigate('/')
    }
  }

  const handleMoveToCollection = (targetCollectionId: string) => {
    if (selectedPlaceId) {
      removePlaceFromCollection(selectedPlaceId, collection.id)
      addPlaceToCollection(selectedPlaceId, targetCollectionId)
      setShowMoveSheet(false)
      setSelectedPlaceId(null)
    }
  }

  const handleDragStart = (placeId: string) => {
    setDraggedPlace(placeId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetCollectionId: string) => {
    e.preventDefault()
    if (draggedPlace && targetCollectionId !== collection.id) {
      removePlaceFromCollection(draggedPlace, collection.id)
      addPlaceToCollection(draggedPlace, targetCollectionId)
      setDraggedPlace(null)
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-4xl">{collection.emoji}</div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Menu"
          >
            <MoreVertical size={24} />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  onClick={handleEdit}
                  className="menu-item"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="menu-item text-red-600"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Places count */}
      <p className="text-gray-600">
        {collectionPlaces.length} {collectionPlaces.length === 1 ? 'place' : 'places'}
      </p>

      {/* Places Grid with Drag & Drop */}
      {collectionPlaces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collectionPlaces.map(place => (
            <div
              key={place.id}
              draggable
              onDragStart={() => handleDragStart(place.id)}
              onDragOver={handleDragOver}
              className="relative group cursor-move"
            >
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setSelectedPlaceId(place.id)
                    setShowMoveSheet(true)
                  }}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  title="Move to another collection"
                >
                  <GripVertical size={16} />
                </button>
              </div>
              <PlaceCard place={place} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          type="places"
          title="No places in this collection yet"
          description="Add restaurants to this collection"
        />
      )}

      {/* Drag Drop Zones for other collections */}
      {draggedPlace && collections.filter(c => c.id !== collection.id).length > 0 && (
        <div className="fixed bottom-24 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Drag to another collection:</p>
          <div className="flex gap-2 overflow-x-auto">
            {collections.filter(c => c.id !== collection.id).map(c => (
              <div
                key={c.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, c.id)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all whitespace-nowrap"
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="font-medium">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <FAB onClick={() => setShowAddSheet(true)} label="Add Place" />

      {/* Edit Collection Sheet */}
      <BottomSheet
        isOpen={showEditSheet}
        onClose={() => setShowEditSheet(false)}
        title="Edit Collection"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input w-full"
              placeholder="Collection name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emoji
            </label>
            <input
              type="text"
              value={editEmoji}
              onChange={(e) => setEditEmoji(e.target.value)}
              className="input w-full"
              placeholder="🍜"
              maxLength={2}
            />
          </div>
          
          <button
            onClick={handleSaveEdit}
            className="btn btn-primary w-full"
            disabled={!editName.trim() || !editEmoji.trim()}
          >
            Save
          </button>
        </div>
      </BottomSheet>

      {/* Move to Collection Sheet */}
      <BottomSheet
        isOpen={showMoveSheet}
        onClose={() => {
          setShowMoveSheet(false)
          setSelectedPlaceId(null)
        }}
        title="Move to Collection"
      >
        <div className="space-y-2">
          {collections.filter(c => c.id !== collection.id).map(c => (
            <button
              key={c.id}
              onClick={() => handleMoveToCollection(c.id)}
              className="flex items-center gap-3 w-full p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all text-left"
            >
              <span className="text-2xl">{c.emoji}</span>
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-500">
                  {places.filter(p => p.collectionIds?.includes(c.id)).length} places
                </div>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Add Place Sheet */}
      <BottomSheet
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        title="Add Place to Collection"
      >
        <div className="space-y-3">
          <button
            onClick={() => {
              navigate('/add')
              setShowAddSheet(false)
            }}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all w-full text-left"
          >
            <span className="text-2xl">📋</span>
            <div>
              <div className="font-medium">Paste IG/Threads Link</div>
              <div className="text-sm text-gray-500">Auto-fetch restaurant info</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              navigate('/add?manual=true')
              setShowAddSheet(false)
            }}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[var(--primary-purple)] hover:bg-[var(--bg-secondary)] transition-all w-full text-left"
          >
            <span className="text-2xl">✍️</span>
            <div>
              <div className="font-medium">Manual Entry</div>
              <div className="text-sm text-gray-500">Fill in restaurant details</div>
            </div>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
