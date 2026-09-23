import { PlaceCollection } from '../types'
import { useNavigate } from 'react-router-dom'

interface CollectionCardProps {
  collection: PlaceCollection
  placesCount: number
  coverImage?: string
}

export function CollectionCard({ collection, placesCount, coverImage }: CollectionCardProps) {
  const navigate = useNavigate()

  return (
    <div
      className="collection-card"
      onClick={() => navigate(`/collection/${collection.id}`)}
    >
      <div className="collection-card-cover">
        {coverImage ? (
          <img src={coverImage} alt={collection.name} />
        ) : (
          <div className="collection-card-emoji">
            {collection.emoji}
          </div>
        )}
      </div>
      <div className="collection-card-content">
        <h3 className="collection-card-title">{collection.name}</h3>
        <p className="collection-card-count">
          {placesCount} {placesCount === 1 ? 'place' : 'places'}
        </p>
      </div>
    </div>
  )
}
