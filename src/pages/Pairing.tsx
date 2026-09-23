import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useLanguage } from '../contexts/LanguageContext'
import { isSupabaseConfigured } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Pairing() {
  const { appState, syncState, generatePairCode, pairWithPartner, syncWithCloud } = useStore()
  const { language } = useLanguage()
  const zh = language === 'zh-TW'
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const connected = appState.isPaired && /^[a-f0-9]{32}$/i.test(appState.pairCode || '')
  const configured = isSupabaseConfigured()

  const create = async () => {
    setBusy(true)
    try { await generatePairCode() }
    catch { toast.error(zh ? '無法建立收藏，請確認雲端設定與匿名登入已啟用。' : 'Could not create collection. Check cloud setup and anonymous sign-in.') }
    finally { setBusy(false) }
  }

  return <div className="max-w-xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">{zh ? '跨裝置共享收藏' : 'Shared collection'}</h1>
    <p className="text-gray-600">{zh ? '先在有地點記錄的電腦建立收藏，再在 iPhone 輸入同一邀請碼。首次連結會合併此裝置的地點。' : 'Create a collection on your computer, then enter its invitation on your iPhone. Existing places on each device are merged when connected.'}</p>
    {!configured && <p role="alert" className="bg-amber-50 p-4 rounded-xl">{zh ? '雲端尚未啟用，目前資料只儲存在此裝置。請先完成 Supabase 設定，再重新部署網站。' : 'Cloud is not configured. Records are stored on this device only. Complete Supabase setup and redeploy.'}</p>}
    {connected ? <div className="card space-y-4">
      <h2 className="font-semibold">{zh ? '收藏邀請碼' : 'Collection invitation'}</h2>
      <p className="font-mono break-all select-all">{appState.pairCode}</p>
      <button className="btn btn-primary" onClick={async () => {
        try { await navigator.clipboard.writeText(appState.pairCode!); toast.success(zh ? '已複製' : 'Copied') }
        catch { toast.error(zh ? '請選取並手動複製邀請碼' : 'Select and copy the invitation manually') }
      }}>{zh ? '複製邀請碼' : 'Copy invitation'}</button>
      <button disabled={syncState.isSyncing || !configured} className="btn ml-2" onClick={() => void syncWithCloud()}>{zh ? '立即同步' : 'Sync now'}</button>
      <p className="text-sm text-gray-600">{zh ? '開啟頁面時每 15 秒同步，也會在回到此頁及恢復連線時重試。' : 'Syncs every 15 seconds while visible, on focus and when reconnecting.'}</p>
    </div> : <div className="card space-y-4">
      <button disabled={busy || !configured} className="btn btn-primary w-full" onClick={create}>{zh ? '建立共享收藏' : 'Create shared collection'}</button>
      <label className="block">{zh ? '另一部裝置的 32 碼邀請碼' : '32-character invitation from another device'}
        <input className="input mt-2" value={code} onChange={e => setCode(e.target.value.trim())} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
      </label>
      <button disabled={busy || !configured || !code} className="btn btn-primary w-full" onClick={async () => {
        setBusy(true)
        try { if (await pairWithPartner(code)) setCode('') }
        finally { setBusy(false) }
      }}>{zh ? '加入收藏' : 'Join collection'}</button>
    </div>}
    {syncState.error && <p role="alert" className="text-red-700">{zh ? '同步未完成，本機資料仍保留。請確認雲端設定後重試。' : 'Sync incomplete. Local records are retained. Check cloud setup and retry.'}</p>}
    <p className="text-sm text-gray-500">{zh ? '資料會透過加密連線傳到 Supabase。請只與信任的人分享邀請碼。清除瀏覽器資料會移除此裝置的登入，需重新輸入邀請碼。舊 PACKET- 配對碼不能用於新版收藏。' : 'Data is sent to Supabase over HTTPS. Share invitations only with trusted people. Clearing browser data removes this device login; re-enter the invitation to reconnect. Legacy PACKET- codes do not work with new collections.'}</p>
  </div>
}
