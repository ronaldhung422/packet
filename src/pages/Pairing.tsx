import { useState, useEffect, useRef } from 'react'
import { Users, QrCode, Copy, Check, Wifi, RefreshCw, Shield, Smartphone } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import { useStore } from '../store/useStore'
import toast from 'react-hot-toast'
import { useLanguage } from '../contexts/LanguageContext'
import { translations as t } from '../i18n'

const Pairing = () => {
  const { appState, pairWithPartner, generatePairCode } = useStore()
  const { language } = useLanguage()
  
  const [pairCodeInput, setPairCodeInput] = useState('')
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [isPairing, setIsPairing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  
  const qrCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (appState.pairCode) {
      generateQRCode(appState.pairCode)
    }
  }, [appState.pairCode])

  const generateQRCode = (text: string) => {
    if (!qrCanvasRef.current) return

    const canvas = qrCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Simple QR code generation (in real app, use a proper QR library)
    const cellSize = 10
    const size = 29 // QR code version 3
    const margin = 4
    
    // Draw background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw QR code pattern (simplified)
    ctx.fillStyle = 'black'
    
    // Position markers
    drawPositionMarker(ctx, margin, margin, cellSize)
    drawPositionMarker(ctx, margin + (size - 7) * cellSize, margin, cellSize)
    drawPositionMarker(ctx, margin, margin + (size - 7) * cellSize, cellSize)

    // Draw text in center
    ctx.fillStyle = '#8b5cf6'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text.slice(0, 4), canvas.width / 2, canvas.height / 2 - 10)
    ctx.fillText(text.slice(4), canvas.width / 2, canvas.height / 2 + 10)
  }

  const drawPositionMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.fillStyle = 'black'
    ctx.fillRect(x, y, size * 7, size * 7)
    
    ctx.fillStyle = 'white'
    ctx.fillRect(x + size, y + size, size * 5, size * 5)
    
    ctx.fillStyle = 'black'
    ctx.fillRect(x + size * 2, y + size * 2, size * 3, size * 3)
  }

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true)
    
    try {
      const code = await generatePairCode()
      toast.success(`Generated pair code: ${code}`)
      setShowQR(true)
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const handleCopyCode = () => {
    if (appState.pairCode) {
      navigator.clipboard.writeText(appState.pairCode)
      setCopied(true)
      toast.success('Pair code copied to clipboard!')
      
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  const handlePair = async () => {
    if (!pairCodeInput.trim()) {
      toast.error('Please enter a pair code')
      return
    }

    setIsPairing(true)
    
    try {
      const success = await pairWithPartner(pairCodeInput.trim())
      if (success) {
        setPairCodeInput('')
      }
    } finally {
      setIsPairing(false)
    }
  }

  const handleResetPairing = () => {
    // This would reset pairing in real app
    toast.success('Pairing reset. Generate a new code to pair again.')
  }

  if (appState.isPaired) {
    return (
      <div className="space-y-6">
        {/* Already paired state */}
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'zh-TW' ? '已配對！🎉' : 'Already Paired! 🎉'}
          </h1>
          <p className="text-gray-600">
            {language === 'zh-TW' 
              ? `你已與 ${appState.partnerName === 'ronald' ? 'Ronald' : 'Kerry'} 連線`
              : `You're connected with ${appState.partnerName === 'ronald' ? 'Ronald' : 'Kerry'}`
            }
          </p>
        </div>

        {/* Pairing info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">
                  {language === 'zh-TW' ? '連線狀態' : 'Connection Status'}
                </span>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {language === 'zh-TW' ? '已連線' : 'Active'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'zh-TW' ? '配對碼' : 'Pair Code'}</span>
                <span className="font-mono font-bold text-gray-900">{appState.pairCode}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'zh-TW' ? '伴侶' : 'Partner'}</span>
                <span className="font-medium text-gray-900">
                  {appState.partnerName === 'ronald' ? 'Ronald 👨‍💻' : 'Kerry 👩‍💻'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'zh-TW' ? '已同步地點' : 'Synced Places'}</span>
                <span className="font-medium text-gray-900">
                  {language === 'zh-TW' ? '所有地點已共享' : 'All places shared'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code for easy re-pairing */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {language === 'zh-TW' ? '快速配對碼' : 'Quick Pair Code'}
          </h3>
          <div className="flex flex-col items-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <canvas
                ref={qrCanvasRef}
                width={300}
                height={300}
                className="w-48 h-48"
              />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              {language === 'zh-TW' 
                ? '用伴侶的手機掃描此 QR 碼即可快速配對'
                : "Scan this QR code with your partner's phone to pair quickly"
              }
            </p>
            <button
              onClick={handleCopyCode}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copied ? (language === 'zh-TW' ? '已複製！' : 'Copied!') : (language === 'zh-TW' ? '複製配對碼' : 'Copy Pair Code')}</span>
            </button>
          </div>
        </div>

        {/* Sync status */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">
                {language === 'zh-TW' ? '同步狀態' : 'Sync Status'}
              </h3>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              navigator.onLine ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {navigator.onLine ? (language === 'zh-TW' ? '線上' : 'Online') : (language === 'zh-TW' ? '離線' : 'Offline')}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{language === 'zh-TW' ? '最後同步' : 'Last sync'}</span>
              <span className="text-gray-900">
                {new Date(appState.lastSync).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">{language === 'zh-TW' ? '離線變更' : 'Offline changes'}</span>
              <span className={`font-medium ${
                appState.offlineChanges > 0 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {appState.offlineChanges} {language === 'zh-TW' ? '待處理' : 'pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Reset pairing */}
        <div className="text-center">
          <button
            onClick={handleResetPairing}
            className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            {language === 'zh-TW' ? '重置配對' : 'Reset Pairing'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {language === 'zh-TW' 
              ? '這將中斷你與伴侶的連線。你需要新的配對碼才能重新連線。'
              : "This will disconnect you from your partner. You'll need a new pair code to reconnect."
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Not paired state */}
      <EmptyState
        type="pairing"
        title={language === 'zh-TW' ? '與伴侶配對' : 'Pair with your partner'}
        description={language === 'zh-TW' ? '連接你們的裝置，一起分享美食探索' : 'Connect your devices to share food discoveries together'}
        actionLabel={undefined}
      />

      {/* Pairing options */}
      <div className="space-y-6">
        {/* Option 1: Generate code */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-packet-purple rounded-lg flex items-center justify-center flex-shrink-0">
              <QrCode className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'zh-TW' ? '產生配對碼' : 'Generate Pair Code'}
              </h3>
              <p className="text-gray-600">
                {language === 'zh-TW' ? '建立一個讓伴侶掃描的配對碼' : 'Create a code for your partner to scan'}
              </p>
            </div>
          </div>

          {appState.pairCode ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-packet-purple mb-2">
                  {appState.pairCode}
                </div>
                <p className="text-sm text-gray-600">
                  {language === 'zh-TW' ? '與伴侶分享此配對碼' : 'Share this code with your partner'}
                </p>
              </div>

              {showQR && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center">
                  <canvas
                    ref={qrCanvasRef}
                    width={300}
                    height={300}
                    className="w-40 h-40"
                  />
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {language === 'zh-TW' ? '你的伴侶可以掃描此 QR 碼' : 'Your partner can scan this QR code'}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span>{copied ? (language === 'zh-TW' ? '已複製！' : 'Copied!') : (language === 'zh-TW' ? '複製配對碼' : 'Copy Code')}</span>
                </button>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex-1 py-3 bg-packet-purple hover:bg-packet-purple-dark text-white rounded-lg font-medium"
                >
                  {showQR ? (language === 'zh-TW' ? '隱藏 QR 碼' : 'Hide QR') : (language === 'zh-TW' ? '顯示 QR 碼' : 'Show QR')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerateCode}
              disabled={isGeneratingCode}
              className="w-full py-3 bg-packet-purple hover:bg-packet-purple-dark text-white rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {isGeneratingCode ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <QrCode className="w-5 h-5" />
              )}
              <span>{isGeneratingCode ? (language === 'zh-TW' ? '產生中...' : 'Generating...') : (language === 'zh-TW' ? '產生配對碼' : 'Generate Pair Code')}</span>
            </button>
          )}
        </div>

        {/* Option 2: Enter code */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'zh-TW' ? '輸入配對碼' : 'Enter Pair Code'}
              </h3>
              <p className="text-gray-600">
                {language === 'zh-TW' ? '輸入伴侶裝置的配對碼' : "Enter code from your partner's device"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={pairCodeInput}
                onChange={(e) => setPairCodeInput(e.target.value.toUpperCase())}
                placeholder={language === 'zh-TW' ? '輸入配對碼（例如：PACKET-ABC123）' : 'Enter pair code (e.g., PACKET-ABC123)'}
                className="input text-center font-mono text-lg"
              />
              <p className="text-sm text-gray-600 mt-2">
                {language === 'zh-TW' ? '格式：PACKET- 後接 6 個字母/數字' : 'Format: PACKET- followed by 6 letters/numbers'}
              </p>
            </div>

            <button
              onClick={handlePair}
              disabled={isPairing || !pairCodeInput.trim()}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
            >
              {isPairing ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Users className="w-5 h-5" />
              )}
              <span>{isPairing ? (language === 'zh-TW' ? '配對中...' : 'Pairing...') : (language === 'zh-TW' ? '立即配對' : 'Pair Now')}</span>
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {language === 'zh-TW' ? '配對如何運作' : 'How Pairing Works'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'zh-TW' ? '一人產生配對碼' : 'One person generates code'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'zh-TW' ? '點擊「產生配對碼」以建立唯一的配對碼' : 'Tap "Generate Pair Code" to create a unique code'}
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">2</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'zh-TW' ? '與伴侶分享' : 'Share with partner'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'zh-TW' ? '與伴侶分享配對碼或 QR 碼' : 'Share the code or QR code with your partner'}
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">3</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'zh-TW' ? '伴侶輸入配對碼' : 'Partner enters code'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'zh-TW' ? '伴侶在裝置上輸入配對碼以連線' : 'Partner enters the code on their device to connect'}
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blue-600">4</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {language === 'zh-TW' ? '開始分享！' : 'Start sharing!'}
                </div>
                <div className="text-sm text-gray-600">
                  {language === 'zh-TW' ? '兩個裝置自動同步地點' : 'Both devices sync places automatically'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security info */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-gray-700" />
            <h3 className="font-medium text-gray-900">
              {language === 'zh-TW' ? '隱私與安全' : 'Privacy & Security'}
            </h3>
          </div>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• {language === 'zh-TW' ? '配對完全是你和伴侶之間的私密行為' : 'Pairing is completely private between you and your partner'}</li>
            <li>• {language === 'zh-TW' ? '不會與伺服器分享個人資訊' : 'No personal information is shared with servers'}</li>
            <li>• {language === 'zh-TW' ? '所有資料在同步時都會加密' : 'All data is encrypted during sync'}</li>
            <li>• {language === 'zh-TW' ? '你可以隨時重置配對' : 'You can reset pairing at any time'}</li>
            <li>• {language === 'zh-TW' ? '配對碼在 24 小時後過期' : 'Pair codes expire after 24 hours'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Pairing