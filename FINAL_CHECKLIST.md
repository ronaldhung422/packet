# ✅ Packet App - 最終檢查清單

## 🎯 測試 Instagram 連結抓取

### 測試連結
```
https://www.instagram.com/reel/Dc_Ca43KO06/?stkn=MXJ6Z2Z0YWZvaXVzOQ==
```

### 測試步驟

#### 方法 1：使用測試頁面 (推薦快速測試)

1. 打開 `test-extraction.html` (應該已經開啟)
2. 確認連結已填入
3. 點選 **「🔍 抓取資訊」**
4. 檢查結果：

**預期結果**：
- ✅ 平台：instagram
- ✅ 標題：應該顯示 Instagram meta title
- ✅ 描述：應該顯示 Instagram meta description
- ✅ 圖片：應該顯示縮圖
- ⚠️ 餐廳名稱：取決於貼文內容
- ⚠️ 地址：取決於貼文內容
- ⚠️ 電話：取決於貼文內容

#### 方法 2：使用實際 App (完整測試)

1. 在 iPhone 上打開：https://packet-kappa.vercel.app
2. 配對兩台 iPhone（如果尚未配對）
3. 點選 **「+ 新增地點」**
4. 選擇 **「從連結匯入」**
5. 貼上測試連結
6. 等待自動抓取
7. 檢查並補充資訊
8. 點選 **「儲存」**
9. 確認在另一台 iPhone 上也能看到

---

## 📱 完整部署檢查清單

### ✅ 已完成項目

- [x] **Supabase Migration**
  - [x] 修正配對碼格式 (PACKET-XXXXXX)
  - [x] 建立 pairs, places, sync_status 資料表
  - [x] 設定 RLS policies
  - [x] 測試資料表建立成功

- [x] **香港地址支援**
  - [x] 香港地區名稱識別
  - [x] 樓層格式 (G/F, 1/F, Shop X)
  - [x] MTR 站名支援
  - [x] 街道名稱識別

- [x] **香港電話支援**
  - [x] 手機號碼 (5/6/9 開頭)
  - [x] 固網電話 (2/3 開頭)
  - [x] 國際格式 (+852)

- [x] **Instagram/Threads 抓取**
  - [x] 建立 Vercel API endpoint (`/api/extract-metadata`)
  - [x] 繞過 CORS 限制
  - [x] 智能餐廳名稱提取
  - [x] 自動填入功能整合

- [x] **部署**
  - [x] 建置成功 (npm run build)
  - [x] 部署到 Vercel Production
  - [x] URL: https://packet-kappa.vercel.app

---

## 🧪 測試案例

### Test Case 1: 配對功能
```
1. iPhone A 產生配對碼
2. iPhone B 輸入配對碼
3. 確認配對成功
4. 測試雙向同步
```

### Test Case 2: 新增地點 (手動)
```
1. 點選「+ 新增地點」
2. 手動輸入：
   - 餐廳名稱：添好運點心專門店
   - 地址：中環威靈頓街9-19號地下
   - 電話：2332-2896
3. 儲存
4. 確認另一台 iPhone 收到
```

### Test Case 3: 新增地點 (Instagram 連結)
```
1. 點選「+ 新增地點」
2. 選擇「從連結匯入」
3. 貼上：https://www.instagram.com/reel/Dc_Ca43KO06/
4. 等待自動抓取
5. 檢查並補充資訊
6. 儲存
7. 確認另一台 iPhone 收到
```

### Test Case 4: 地圖功能
```
1. 點選已儲存的地點
2. 查看 Google Maps 位置
3. 點選「開啟導航」
4. 確認跳轉到 Google Maps
```

### Test Case 5: 刪除/編輯
```
1. 選擇一個地點
2. 測試編輯功能
3. 測試刪除功能
4. 確認雙向同步
```

---

## 🚀 生產環境部署

### 當前狀態

**✅ Production Ready**

- 🌐 **Live URL**: https://packet-kappa.vercel.app
- 🗄️ **Database**: Supabase (cfmswewmfaahthjlkshg)
- 📡 **API**: /api/extract-metadata
- 📱 **PWA**: 支援安裝到主畫面

### 如何使用

#### 步驟 1: 在兩台 iPhone 上安裝

1. 在 iPhone A 打開：https://packet-kappa.vercel.app
2. 點選 **分享圖示** → **「加入主畫面」**
3. 在 iPhone B 重複相同步驟

#### 步驟 2: 配對兩台裝置

1. 在 iPhone A 點選 **「產生配對碼」**
2. 記下顯示的 12 字元配對碼（格式：PACKET-XXXXXX）
3. 在 iPhone B 點選 **「輸入配對碼」**
4. 輸入配對碼
5. 確認配對成功訊息

#### 步驟 3: 開始使用

1. 在任一台 iPhone 點選 **「+ 新增地點」**
2. 選擇輸入方式：
   - **手動輸入**: 直接填寫餐廳資訊
   - **從連結匯入**: 貼上 Instagram/Threads 連結
3. 儲存後會自動同步到另一台裝置

---

## 📊 系統架構

```
┌─────────────────┐
│   iPhone A/B    │
│   (PWA App)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Vercel Hosting │
│  Static Files   │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌──────────────┐
│Supabase│ │ Vercel API   │
│Database│ │ /api/extract │
└────────┘ └──────────────┘
    ↑              ↓
    │      ┌──────────────┐
    │      │ Instagram/   │
    │      │ Threads      │
    │      └──────────────┘
    │
    └─── Realtime Sync ───┘
```

---

## 🐛 已知限制

### 1. Instagram 抓取
- ⚠️ **不保證 100% 成功**: Instagram 可能隨時改變 HTML 結構
- ⚠️ **可能被限流**: 過多請求可能觸發速率限制
- ✅ **建議**: 提供手動輸入作為備案

### 2. 地理位置
- ⚠️ **需要手動輸入地址**: 無法自動取得 GPS 座標
- ✅ **使用 Google Maps API**: 可搜尋地址並顯示在地圖上

### 3. 離線功能
- ⚠️ **需要網路連線**: 同步功能需要網路
- ✅ **PWA 快取**: 基本 UI 可離線使用

---

## 🔧 維護指南

### 定期檢查

**每週**:
- 測試 Instagram 連結抓取是否正常
- 檢查 Supabase 資料庫狀態
- 確認配對功能運作

**每月**:
- 檢查 Vercel 用量
- 檢查 Supabase 用量
- 更新依賴套件

**每季**:
- 審查並改進抓取正則表達式
- 收集用戶反饋
- 規劃新功能

### 如何更新

```bash
# 1. 修改程式碼
# 2. 本地測試
npm run dev

# 3. 建置
npm run build

# 4. 部署
vercel --prod

# 5. 測試正式環境
# 在 iPhone 上測試所有功能
```

---

## 📞 緊急聯絡

### 如果遇到問題

1. **檢查 Vercel 部署狀態**: https://vercel.com/dashboard
2. **檢查 Supabase 狀態**: https://supabase.com/dashboard
3. **查看錯誤日誌**: Vercel Functions Logs
4. **回滾到上一版本**: `vercel rollback`

---

## 🎉 準備就緒！

你現在可以：

1. ✅ **測試 Instagram 連結抓取**: 使用 `test-extraction.html`
2. ✅ **在 iPhone 上完整測試**: https://packet-kappa.vercel.app
3. ✅ **開始實際使用**: 配對兩台 iPhone 並新增餐廳地點
4. ✅ **分享給朋友**: 讓其他人也能使用

---

**Deployment Date**: 2026-09-22  
**Version**: 1.0.0  
**Status**: 🟢 Production Ready
