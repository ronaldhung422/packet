import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Tag, User } from 'lucide-react'
import LinkInput from '../components/LinkInput'
import { useStore } from '../store/useStore'
import { extractionService } from '../services/extraction.service'
import { useLanguage } from '../contexts/LanguageContext'
import { translations as t } from '../i18n'
import { PlaceType } from '../types'
import toast from 'react-hot-toast'

const AddPlace = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { places, addPlace, updatePlace } = useStore()
  const { language } = useLanguage()
  const editingPlace = places.find(place => place.id === searchParams.get('edit'))
  
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'link' | 'details'>('link')
  const [link, setLink] = useState('')
  const [platform, setPlatform] = useState<'instagram' | 'threads' | 'manual'>('instagram')
  
  const [placeDetails, setPlaceDetails] = useState({
    name: '',
    description: '',
    tags: [] as string[],
    addedBy: 'ronald' as 'ronald' | 'kerry',
    category: 'want-to-try' as 'want-to-try' | 'been-there' | 'favorites',
    placeType: 'restaurant' as PlaceType,
    location: '',
    notes: ''
  })

  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (!editingPlace) return
    setLink(editingPlace.link)
    setPlatform((editingPlace.extractedFrom as 'instagram' | 'threads' | 'manual') || 'manual')
    setStep('details')
    setPlaceDetails({
      name: editingPlace.name,
      description: editingPlace.description || '',
      tags: editingPlace.tags,
      addedBy: editingPlace.addedBy,
      category: editingPlace.category,
      placeType: editingPlace.placeType || 'restaurant',
      location: editingPlace.location?.address || '',
      notes: editingPlace.notes || ''
    })
  }, [editingPlace])

  const handleLinkSubmit = async (submittedLink: string, submittedPlatform: 'instagram' | 'threads' | 'manual') => {
    setLink(submittedLink)
    setPlatform(submittedPlatform)
    setStep('details')
    
    // Try to extract restaurant name from link
    if (submittedPlatform !== 'manual') {
      setIsLoading(true)
      
      try {
        const metadata = await extractionService.extractMetadata(submittedLink)
        setPlaceDetails(prev => ({
          ...prev,
          name: metadata.restaurantName || '',
          description: metadata.description || '',
          location: metadata.location || ''
        }))

        if (metadata.restaurantName) {
          toast.success('Restaurant name found')
        } else {
          toast('Add the place name below')
        }
      } catch (error) {
        console.error('Extraction failed:', error)
        toast('Add the place name below')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !placeDetails.tags.includes(tagInput.trim())) {
      setPlaceDetails(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setPlaceDetails(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!placeDetails.name.trim()) {
      toast.error(language === 'zh-TW' ? '請輸入餐廳名稱' : 'Please enter a restaurant name')
      return
    }

    setIsLoading(true)

    try {
      if (editingPlace) {
        updatePlace(editingPlace.id, {
          name: placeDetails.name,
          description: placeDetails.description,
          link,
          extractedFrom: platform,
          category: placeDetails.category,
          placeType: placeDetails.placeType,
          tags: placeDetails.tags,
          addedBy: placeDetails.addedBy,
          location: placeDetails.location ? { address: placeDetails.location } : undefined,
          notes: placeDetails.notes
        })
      } else {
        addPlace({
          name: placeDetails.name,
          description: placeDetails.description,
          link,
          extractedFrom: platform,
          category: placeDetails.category,
          placeType: placeDetails.placeType,
          tags: placeDetails.tags,
          addedBy: placeDetails.addedBy,
          memories: [],
          location: placeDetails.location ? { address: placeDetails.location } : undefined,
          notes: placeDetails.notes
        })
      }

      toast.success(`${editingPlace ? (language === 'zh-TW' ? '已更新' : 'Updated') : (language === 'zh-TW' ? '已新增' : 'Added')} ${placeDetails.name}!`)
      navigate('/places')
      
    } catch (error) {
      console.error('Failed to add place:', error)
      toast.error(language === 'zh-TW' ? '新增失敗' : 'Failed to add place')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'details') {
      setStep('link')
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.back[language]}</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">{editingPlace ? (language === 'zh-TW' ? '編輯地點' : 'Edit Place') : t.addNewPlace[language]}</h1>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'link' ? 'bg-packet-purple text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className="w-12 h-1 bg-gray-200" />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'details' ? 'bg-packet-purple text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>
        
        <div className="w-10" /> {/* Spacer */}
      </div>

      {step === 'link' ? (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-packet-purple to-packet-pink rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍜</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'zh-TW' ? '貼上連結' : 'Paste a Link'}
            </h2>
            <p className="text-gray-600">
              {language === 'zh-TW' ? '從 Instagram 或 Threads 複製餐廳貼文連結' : 'Copy link from Instagram or Threads post about a restaurant'}
            </p>
          </div>

          <LinkInput
            onLinkSubmit={handleLinkSubmit}
            onCancel={() => navigate(-1)}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'zh-TW' ? '新增詳細資訊' : 'Add Details'}
            </h2>
            <p className="text-gray-600">
              {language === 'zh-TW' ? '新增關於餐廳的資訊' : 'Add information about the restaurant'}
            </p>
          </div>

          {/* Source link preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  platform === 'instagram' ? 'bg-pink-100 text-pink-600' :
                  platform === 'threads' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {platform === 'instagram' ? '📷' : platform === 'threads' ? '💬' : '🔗'}
                </div>
                <div>
                  <div className="font-medium">
                    {platform === 'instagram' ? 'Instagram' : 
                     platform === 'threads' ? 'Threads' : (language === 'zh-TW' ? '手動輸入' : 'Manual entry')}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {link || (language === 'zh-TW' ? '無連結' : 'No link provided')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('link')}
                className="text-packet-purple hover:text-packet-purple-dark font-medium"
              >
                {language === 'zh-TW' ? '更改' : 'Change'}
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.name[language]} *
              </label>
              <input
                type="text"
                value={placeDetails.name}
                onChange={(e) => setPlaceDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t.enterName[language]}
                className="input"
                required
              />
            </div>

            {/* Place Type Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t.category[language]} *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'restaurant', icon: '🍽️', label: t.restaurant[language] },
                  { value: 'cafe', icon: '☕', label: t.cafe[language] },
                  { value: 'bar', icon: '🍺', label: t.bar[language] },
                  { value: 'dessert', icon: '🍰', label: t.dessert[language] },
                  { value: 'fastFood', icon: '🍔', label: t.fastFood[language] },
                  { value: 'fineDining', icon: '🍷', label: t.fineDining[language] },
                  { value: 'streetFood', icon: '🌮', label: t.streetFood[language] },
                  { value: 'bakery', icon: '🥐', label: t.bakery[language] },
                  { value: 'other', icon: '📍', label: t.other[language] },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPlaceDetails(prev => ({ ...prev, placeType: type.value as PlaceType }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      placeDetails.placeType === type.value
                        ? 'border-packet-purple bg-packet-purple-light text-white shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.description[language]}
              </label>
              <textarea
                value={placeDetails.description}
                onChange={(e) => setPlaceDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t.enterDescription[language]}
                rows={3}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>Tags</span>
                </div>
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {placeDetails.tags.map((tag) => (
                  <div
                    key={tag}
                    className="px-3 py-1 bg-packet-purple-light text-white rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder={language === 'zh-TW' ? '新增標籤（例如：披薩、義大利、約會夜）' : 'Add tags (e.g., pizza, italian, date-night)'}
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  {language === 'zh-TW' ? '新增' : 'Add'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{language === 'zh-TW' ? '新增者' : 'Added By'}</span>
                  </div>
                </label>
                <select
                  value={placeDetails.addedBy}
                  onChange={(e) => setPlaceDetails(prev => ({ 
                    ...prev, 
                    addedBy: e.target.value as 'ronald' | 'kerry' 
                  }))}
                  className="input"
                >
                  <option value="ronald">Ronald 👨‍💻</option>
                  <option value="kerry">Kerry 👩‍💻</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.category[language]}
                </label>
                <select
                  value={placeDetails.category}
                  onChange={(e) => setPlaceDetails(prev => ({ 
                    ...prev, 
                    category: e.target.value as 'want-to-try' | 'been-there' | 'favorites' 
                  }))}
                  className="input"
                >
                  <option value="want-to-try">{t.wantToTry[language]} 🤔</option>
                  <option value="been-there">{t.beenThere[language]} ✅</option>
                  <option value="favorites">{t.favorites[language]} ⭐</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{t.location[language]} ({language === 'zh-TW' ? '選填' : 'optional'})</span>
                </div>
              </label>
              <input
                type="text"
                value={placeDetails.location}
                onChange={(e) => setPlaceDetails(prev => ({ ...prev, location: e.target.value }))}
                placeholder={language === 'zh-TW' ? '地址或區域' : 'Address or area'}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notes[language]} ({language === 'zh-TW' ? '選填' : 'optional'})
              </label>
              <textarea
                value={placeDetails.notes}
                onChange={(e) => setPlaceDetails(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={language === 'zh-TW' ? '任何額外的備註或提醒' : 'Any additional notes or reminders'}
                rows={2}
                className="input"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {language === 'zh-TW' ? '返回' : 'Back'}
            </button>
            <button
              type="submit"
              disabled={isLoading || !placeDetails.name.trim()}
              className="flex-1 btn btn-primary py-3 text-base font-medium"
            >
              {isLoading ? (language === 'zh-TW' ? '儲存中...' : 'Saving...') : (language === 'zh-TW' ? '儲存地點' : 'Save Place')}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AddPlace