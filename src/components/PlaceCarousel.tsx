import { Place } from '../types'
import { PlaceCard } from './PlaceCard'
import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PlaceCarouselProps {
  places: Place[]
  title: string
}

export function PlaceCarousel({ places, title }: PlaceCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [places])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  if (places.length === 0) return null

  return (
    <div className="place-carousel-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {places.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="carousel-nav-button"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="carousel-nav-button"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      <div
        ref={scrollRef}
        className="place-carousel"
        onScroll={checkScroll}
      >
        {places.map((place) => (
          <div key={place.id} className="place-carousel-item">
            <PlaceCard place={place} />
          </div>
        ))}
      </div>
    </div>
  )
}
