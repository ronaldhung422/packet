# 🚀 Packet 部署指南（完整版）

## ✅ 已完成設定

### Supabase 資料庫
- **Project URL**: `https://cfmswewmfaahthjlkshg.supabase.co`
- **Anon Key**: 已設定在 `.env` 檔案
- **狀態**: ⚠️ 需要執行 SQL migration

### Cloudflare Worker
- **Worker 名稱**: `packetproxy`
- **Dashboard**: https://dash.cloudflare.com/...workers/services/view/packetproxy/production
- **狀態**: ⚠️ 需要部署 worker 程式碼

---

## 📋 部署步驟（3 個步驟）

### 步驟 1: 設定 Supabase 資料庫 ⏱️ 5 分鐘

1. 前往 Supabase Dashboard: https://supabase.com/dashboard/project/cfmswewmfaahthjlkshg

2. 點選左側選單的 **SQL Editor**

3. 點選 **New query**

4. 複製整個 `supabase/migrations/001_initial_schema.sql` 檔案內容並貼上

5. 點選 **Run** 執行 SQL

6. 應該會看到成功訊息：
   - ✓ Created tables: `pairs`, `places`, `sync_status`
   - ✓ Created functions and triggers
   - ✓ Enabled Row Level Security

**驗證方式**：
- 前往 **Table Editor**
- 應該可以看到 `pairs`, `places`, `sync_status` 三個表格

---

### 步驟 2: 部署 Cloudflare Worker（選配） ⏱️ 3 分鐘

**選項 A：直接部署現有 worker**

Worker 已經在 Cloudflare 上了，只需要確認程式碼已部署。
前往 https://dash.cloudflare.com/a8104429ae4e67d1b41ff09fbac2fe00/workers/services/view/packetproxy/production

檢查是否有部署記錄。如果沒有，執行：

```bash
cd workers/extraction-worker
npm install
npx wrangler deploy
```

**選項 B：不使用 worker**

如果 worker 部署有問題，可以暫時不設定。App 會自動降級到客戶端擷取：
- 移除 `.env` 中的 `VITE_EXTRACTION_API_URL` 那行
- 重新建置：`npm run build`

**取得 Worker URL**：
部署後，Wrangler 會顯示 worker URL，格式像：
```
https://packetproxy.<subdomain>.workers.dev
```

把這個 URL 更新到 `.env`：
```env
VITE_EXTRACTION_API_URL=https://packetproxy.<subdomain>.workers.dev
```

---

### 步驟 3: 部署前端到 Vercel ⏱️ 5 分鐘

**方式 A：使用 Vercel CLI（推薦）**

```bash
# 安裝 Vercel CLI（如果還沒有）
npm i -g vercel

# 登入 Vercel
vercel login

# 部署
vercel --prod
```

在部署過程中：
1. 選擇 "Link to existing project" 或建立新專案
2. 確認 build command: `npm run build`
3. 確認 output directory: `dist`

**方式 B：透過 Vercel Dashboard**

1. 前往 https://vercel.com/new
2. 匯入 GitHub repository（需要先 push 到 GitHub）
3. 設定環境變數：
   ```
   VITE_SUPABASE_URL=https://cfmswewmfaahthjlkshg.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_EXTRACTION_API_URL=https://packetproxy.<subdomain>.workers.dev
   ```
4. 點選 Deploy

**部署後會得到 URL，例如**：
```
https://packet-ronald-kerry.vercel.app
```

---

## 📱 在 iPhone 上安裝

### Ronald 的 iPhone
1. 使用 Safari 開啟：`https://your-app.vercel.app`
2. 點選底部的「分享」按鈕
3. 滑動找到「加入主畫面螢幕」
4. 點選「加入」
5. App 圖示會出現在主畫面

### Kerry 的 iPhone
1. 使用 Safari 開啟同一個 URL
2. 重複上述步驟安裝

---

## 🔗 配對兩台 iPhone

### 在第一台 iPhone（例如 Ronald）
1. 開啟 Packet app
2. 點選底部的「Pair」圖示
3. 點選「Generate Pair Code」按鈕
4. 會出現類似 `PACKET-A3K9X2` 的配對碼
5. 點選「Copy Code」

### 在第二台 iPhone（例如 Kerry）
1. 開啟 Packet app
2. 點選底部的「Pair」圖示
3. 在「Enter Pair Code」欄位貼上配對碼
4. 點選「Pair Now」

### 確認配對成功
- 兩台裝置都應該顯示「Paired successfully!」訊息
- 畫面上方應該顯示綠色的 "Paired" 狀態
- 現在任一台新增的餐廳會即時同步到另一台！

---

## ✅ 功能測試清單

### 基本功能
- [ ] 開啟 app 看到首頁
- [ ] 點選「Add Place」
- [ ] 貼上 Instagram 連結（例如：`https://instagram.com/p/xxxxx/`）
- [ ] 看到自動擷取的餐廳名稱（或手動輸入）
- [ ] 儲存後回到首頁能看到新增的地點

### 配對與同步
- [ ] 兩台裝置成功配對
- [ ] 在 A 裝置新增地點
- [ ] B 裝置自動顯示該地點（可能需要重新整理）
- [ ] 在 B 裝置編輯地點
- [ ] A 裝置看到更新

### 離線功能
- [ ] 關閉 WiFi 和行動網路
- [ ] 仍然可以瀏覽現有地點
- [ ] 可以新增地點
- [ ] 重新連線後，離線新增的地點會自動同步

### 回憶功能
- [ ] 在地點卡片點選「+ Memory」
- [ ] 輸入心得並儲存
- [ ] 回憶顯示在卡片上
- [ ] 另一台裝置也能看到該回憶

---

## 🔧 疑難排解

### 問題 1：配對失敗

**症狀**：點選「Pair Now」後沒有反應或顯示錯誤

**解決方式**：
1. 檢查兩台裝置都有網路連線
2. 開啟瀏覽器開發者工具（Safari > 開發 > 檢閱器）
3. 查看 Console 的錯誤訊息
4. 確認 Supabase SQL migration 已成功執行

**驗證 Supabase**：
```sql
-- 在 Supabase SQL Editor 執行
SELECT * FROM pairs;
```
應該可以看到你產生的配對碼。

---

### 問題 2：自動擷取失敗

**症狀**：貼上 Instagram 連結後，餐廳名稱是空的

**原因**：
- Cloudflare Worker 未部署或 URL 設定錯誤
- Instagram 變更了頁面結構

**解決方式**：
1. **暫時解法**：手動輸入餐廳名稱
2. **永久解法**：檢查 Cloudflare Worker 狀態
   ```bash
   cd workers/extraction-worker
   npx wrangler tail packetproxy
   ```
   然後在 app 中貼上連結，觀察 worker logs

---

### 問題 3：同步延遲

**症狀**：在 A 裝置新增地點，B 裝置沒有立即顯示

**解決方式**：
1. 下拉重新整理頁面
2. 檢查 Supabase Realtime 是否啟用
3. 前往 Supabase Dashboard > Settings > API > Realtime
4. 確認 `places` table 的 Realtime 已啟用

---

### 問題 4：地圖沒有顯示地點

**原因**：地點沒有座標資料（lat/lng）

**解決方式**：
目前地點只有地址文字，沒有座標。要顯示在地圖上需要：
1. 整合 geocoding API（未來功能）
2. 或手動新增座標（在資料庫中）

---

## 📊 監控與維護

### Supabase Dashboard
- **使用量**: https://supabase.com/dashboard/project/cfmswewmfaahthjlkshg/settings/billing
- **Logs**: https://supabase.com/dashboard/project/cfmswewmfaahthjlkshg/logs/explorer
- **資料瀏覽**: Table Editor

### Vercel Dashboard
- **部署狀態**: https://vercel.com/dashboard
- **分析**: 可看到訪問量、效能指標
- **Logs**: 可看到執行期錯誤

### Cloudflare Dashboard
- **Worker 狀態**: https://dash.cloudflare.com/.../workers/services/view/packetproxy
- **請求量**: 可看到 extraction API 的使用情況
- **Logs**: `wrangler tail packetproxy`

---

## 🎉 完成！

現在 Packet 已經完全可用了！

**下一步**：
1. 在兩台 iPhone 測試所有功能
2. 開始收藏喜歡的餐廳
3. 享受共同發現美食的樂趣！

**未來可以加的功能**：
- 📸 上傳餐廳照片到回憶
- 📍 整合 Google Maps Geocoding
- 🔔 推送通知（當對方新增地點時）
- 📤 分享清單給朋友
- 📊 更豐富的統計圖表

有任何問題，檢查上面的疑難排解章節！
