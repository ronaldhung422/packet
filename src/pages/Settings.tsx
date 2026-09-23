import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Info, User, Heart } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { translations as t } from '../i18n'

interface SettingsItem {
  label: string
  value?: string
  selected?: boolean
  onClick?: () => void
}

interface SettingsSection {
  title: string
  icon: JSX.Element
  items: SettingsItem[]
}

const Settings = () => {
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguage()

  const settingsSections: SettingsSection[] = [
    {
      title: t.language[language],
      icon: <Globe className="w-5 h-5" />,
      items: [
        {
          label: '繁體中文',
          value: 'zh-TW',
          selected: language === 'zh-TW',
          onClick: () => setLanguage('zh-TW')
        },
        {
          label: 'English',
          value: 'en',
          selected: language === 'en',
          onClick: () => setLanguage('en')
        }
      ]
    },
    {
      title: t.account[language],
      icon: <User className="w-5 h-5" />,
      items: [
        {
          label: language === 'zh-TW' ? '個人檔案' : 'Profile',
          onClick: () => {}
        },
        {
          label: language === 'zh-TW' ? '配對設定' : 'Pairing Settings',
          onClick: () => {}
        }
      ]
    },
    {
      title: t.about[language],
      icon: <Info className="w-5 h-5" />,
      items: [
        {
          label: language === 'zh-TW' ? '版本' : 'Version',
          value: '1.0.0'
        },
        {
          label: language === 'zh-TW' ? '使用說明' : 'How to Use',
          onClick: () => {}
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t.back[language]}</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{t.settings[language]}</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <div className="bg-gradient-to-r from-packet-purple to-packet-pink rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl">
              👨‍💻
            </div>
            <div>
              <h2 className="text-xl font-bold">Ronald & Kerry</h2>
              <p className="text-white/80 text-sm">
                {language === 'zh-TW' ? '美食探險家' : 'Food Explorers'}
              </p>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-gray-700">
                {section.icon}
                <h3 className="font-semibold">{section.title}</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  onClick={item.onClick}
                  className={`px-4 py-4 flex items-center justify-between ${
                    item.onClick ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : ''
                  }`}
                >
                  <span className="text-gray-900">{item.label}</span>
                  {item.value && (
                    <span className="text-gray-500 text-sm">{item.value}</span>
                  )}
                  {item.selected && (
                    <div className="w-5 h-5 rounded-full bg-packet-purple flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Made with Love */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <span>{language === 'zh-TW' ? '用' : 'Made with'}</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>{language === 'zh-TW' ? '製作' : 'by Ronald & Kerry'}</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {language === 'zh-TW' ? '探索美食，創造回憶' : 'Explore food, create memories'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Settings
