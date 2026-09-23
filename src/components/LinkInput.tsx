import { useState, useRef } from 'react'
import { Link, Instagram, Globe, AlertCircle, Check, X, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

interface LinkInputProps {
  onLinkSubmit: (link: string, platform: 'instagram' | 'threads' | 'manual') => void
  onCancel?: () => void
  initialValue?: string
  isLoading?: boolean
}

const LinkInput = ({ onLinkSubmit, onCancel, initialValue = '', isLoading = false }: LinkInputProps) => {
  const [link, setLink] = useState(initialValue)
  const [platform, setPlatform] = useState<'instagram' | 'threads' | 'manual'>('instagram')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateLink = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      
      // Check for Instagram links
      if (parsedUrl.hostname.includes('instagram.com')) {
        setPlatform('instagram')
        return parsedUrl.pathname.includes('/p/') || parsedUrl.pathname.includes('/reel/')
      }
      
      // Check for Threads links
      if (parsedUrl.hostname.includes('threads.net')) {
        setPlatform('threads')
        return true
      }
      
      // Manual entry for other links
      setPlatform('manual')
      return true
      
    } catch {
      // Invalid URL, allow manual entry
      setPlatform('manual')
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!link.trim()) {
      toast.error('Please enter a link')
      return
    }

    if (!validateLink(link)) {
      toast.error('Please enter a valid Instagram or Threads link')
      return
    }

    onLinkSubmit(link, platform)
    setLink('')
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setLink(text)
        validateLink(text)
        inputRef.current?.focus()
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error)
      toast.error('Unable to access clipboard')
    }
  }

  const handleClear = () => {
    setLink('')
    inputRef.current?.focus()
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-600" />
      case 'threads':
        return <Globe className="w-5 h-5 text-gray-800" />
      case 'manual':
        return <Link className="w-5 h-5 text-gray-600" />
    }
  }

  const getPlatformLabel = () => {
    switch (platform) {
      case 'instagram':
        return 'Instagram'
      case 'threads':
        return 'Threads'
      case 'manual':
        return 'Manual entry'
    }
  }

  const getPlaceholder = () => {
    switch (platform) {
      case 'instagram':
        return 'Paste Instagram post link...'
      case 'threads':
        return 'Paste Threads post link...'
      case 'manual':
        return 'Enter restaurant name or any link...'
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getPlatformIcon()}
            <span className="font-medium text-gray-700">{getPlatformLabel()}</span>
          </div>
          
          {platform === 'manual' && (
            <div className="flex items-center space-x-1 text-yellow-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Manual entry mode</span>
            </div>
          )}
        </div>

        {/* Link input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="url"
            value={link}
            onChange={(e) => {
              setLink(e.target.value)
              validateLink(e.target.value)
            }}
            placeholder={getPlaceholder()}
            className="input pl-12 pr-12 py-4 text-base"
            disabled={isLoading}
            autoFocus
          />
          
          {/* Left icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Link className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Right actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            {link && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-md"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
            
            <button
              type="button"
              onClick={handlePaste}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              disabled={isLoading}
            >
              Paste
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>Copy link from Instagram or Threads post</span>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>App will try to extract restaurant name automatically</span>
          </div>
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>You can always type the name manually if needed</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || !link.trim()}
            className="flex-1 btn btn-primary py-3 text-base font-medium flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>Add Place</span>
              </>
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Quick examples */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Example links:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setLink('https://www.instagram.com/p/ABC123/')
                setPlatform('instagram')
              }}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
            >
              <div className="font-medium">Instagram Post</div>
              <div className="text-gray-500 truncate">instagram.com/p/ABC123/</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setLink('https://www.threads.net/@user/post/123')
                setPlatform('threads')
              }}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
            >
              <div className="font-medium">Threads Post</div>
              <div className="text-gray-500 truncate">threads.net/@user/post/123</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setLink('')
                setPlatform('manual')
                inputRef.current?.focus()
              }}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
            >
              <div className="font-medium">Manual Entry</div>
              <div className="text-gray-500">Type restaurant name</div>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LinkInput