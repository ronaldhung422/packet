# Packet - 情侶餐廳收藏 PWA

為 Ronald 和 Kerry 建立的餐廳收藏應用程式，可從 Instagram 和 Threads 貼文自動擷取餐廳資訊。

## 功能特色

✅ **已完成核心功能**

- 從 Instagram/Threads 貼文連結自動擷取餐廳名稱
- 手動輸入模式（當自動擷取失敗時）
- 三種分類：想試試、去過了、最愛
- 為每個地點新增回憶與評分
- 標籤系統與搜尋功能
- 地圖檢視（需要座標資料）
- 統計儀表板
- 離線優先架構
- 配對系統（兩台裝置共享資料）
- Supabase 即時同步

## 技術架構

- **前端**: React 18 + TypeScript + Vite
- **狀態管理**: Zustand with persistence
- **UI**: TailwindCSS
- **地圖**: Leaflet + React Leaflet
- **PWA**: Vite PWA plugin + Workbox
- **後端**: Supabase (PostgreSQL + Realtime)
- **擷取服務**: Cloudflare Workers (選配)

## 本機開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置正式版
npm run build

# 預覽正式版
npm run preview
```

## 部署步驟

### 1. Supabase 設定（必要，用於兩台手機共享）

1. 前往 [supabase.com](https://supabase.com) 建立新專案
2. 在 SQL Editor 執行 `supabase/migrations/001_initial_schema.sql`
3. 從專案設定頁取得：
   - Project URL (VITE_SUPABASE_URL)
   - Anon public key (VITE_SUPABASE_ANON_KEY)

### 2. 環境變數

建立 `.env` 檔案：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 選配：自架擷取服務
VITE_EXTRACTION_API_URL=https://extraction.packet.workers.dev
```

### 3. 部署前端（Vercel / Netlify）

**Vercel 部署**：
```bash
npm run build
npx vercel --prod
```

在 Vercel 專案設定中加入環境變數。

**Netlify 部署**：
```bash
npm run build
npx netlify deploy --prod --dir=dist
```

在 Netlify 專案設定中加入環境變數。

### 4. 部署擷取服務（選配，用於自動擷取餐廳名稱）

Instagram/Threads API 在 2024 年後不再提供公開貼文 metadata 存取。擷取服務採用以下策略：

1. **伺服器端擷取** (推薦)：部署 Cloudflare Worker
   ```bash
   cd workers/extraction-worker
   npm install
   npx wrangler deploy
   ```

2. **客戶端擷取** (fallback)：使用 CORS proxy
   - 受限於瀏覽器 CORS 政策
   - 準確度較低
   - 不需要額外設定

3. **手動輸入**：永遠可用的備援方案

## 使用方式

### 配對兩台裝置

1. **第一台手機**（例如 Ronald 的 iPhone）：
   - 開啟 Packet PWA
   - 前往 Pair 頁面
   - 點選「Generate Pair Code」
   - 會產生格式為 `PACKET-XXXXXX` 的配對碼

2. **第二台手機**（例如 Kerry 的 iPhone）：
   - 開啟 Packet PWA
   - 前往 Pair 頁面
   - 在「Enter Pair Code」輸入配對碼
   - 點選「Pair Now」

3. **確認配對成功**：
   - 兩台裝置會顯示「Paired successfully!」
   - 上方會顯示 paired 狀態
   - 之後新增/編輯的地點會即時同步

### 新增餐廳

1. 在 Instagram/Threads 找到餐廳貼文
2. 點選分享按鈕，複製連結
3. 在 Packet 點選「Add Place」
4. 貼上連結
5. App 會自動擷取餐廳名稱（如果失敗可以手動輸入）
6. 填寫標籤、分類、地點等資訊
7. 儲存

### 新增回憶

1. 在地點卡片上點選「+ Memory」
2. 輸入體驗心得
3. 儲存後會同步到兩台裝置

## 離線支援

- 所有資料先儲存在 localStorage
- 有網路時自動同步到 Supabase
- 離線新增的地點會在連線後自動上傳
- PWA 可安裝到主畫面，離線也能開啟

## 資料結構

### Place (地點)
```typescript
{
  id: string                    // UUID
  name: string                  // 餐廳名稱
  description?: string          // 描述
  link: string                  // Instagram/Threads 連結
  extractedFrom?: string        // 'instagram' | 'threads' | 'manual'
  category: string              // 'want-to-try' | 'been-there' | 'favorites'
  tags: string[]                // 標籤陣列
  addedBy: 'ronald' | 'kerry'   // 新增者
  addedAt: string               // ISO 時間
  location?: {                  // 地點資訊
    lat?: number
    lng?: number
    address?: string
  }
  memories: Memory[]            // 回憶陣列
  rating?: number               // 1-5 星評分
  notes?: string                // 備註
}
```

### Memory (回憶)
```typescript
{
  id: string
  text: string
  date: string
  images?: string[]
}
```

## 疑難排解

### 配對失敗
- 確認兩台裝置都有網路連線
- 確認 Supabase 環境變數正確
- 檢查瀏覽器 console 的錯誤訊息

### 同步失敗
- 檢查網路連線
- 前往 Pair 頁面檢查 sync status
- 重新載入頁面觸發同步

### 地圖沒有顯示地點
- 地點需要有座標 (lat/lng) 才會顯示在地圖上
- 目前只有手動輸入的地址欄位
- 未來可整合 geocoding API 將地址轉換為座標

## 安全性

- Row Level Security (RLS) 已在 Supabase 啟用
- 配對碼為 12 字元隨機產生
- 僅有相同 pair_code 的裝置可存取資料
- 不需要帳號/密碼系統

## 授權

MIT License - 本專案為 Ronald 和 Kerry 的私人使用而開發。

## 支援

需要協助或發現 bug？
- 檢查瀏覽器 console
- 檢查 Supabase logs
- 確認環境變數設定正確
