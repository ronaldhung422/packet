import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  showHandle?: boolean
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showHandle = true 
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    currentY.current = e.touches[0].clientY
    const diff = currentY.current - startY.current

    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`
    }
  }

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current

    if (diff > 100) {
      onClose()
    }

    if (sheetRef.current) {
      sheetRef.current.style.transform = ''
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="modal-overlay" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        ref={sheetRef}
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {showHandle && (
          <div
            className="modal-handle"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        )}
        
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-light)]">
            <h2 
              id="modal-title" 
              className="text-xl font-bold"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </>
  )
}
