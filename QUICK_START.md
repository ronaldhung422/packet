# 🍜 Packet App - 快速開始指南

## 📱 立即使用

### 🌐 App 網址
```
https://packet-kappa.vercel.app
```

---

## ⚡ 3 步驟快速開始

### 1️⃣ 安裝到主畫面
在兩台 iPhone 上：
- 打開 Safari 進入 https://packet-kappa.vercel.app
- 點選底部「分享」圖示
- 選擇「加入主畫面」
- 完成！

### 2️⃣ 配對裝置
**iPhone A**:
- 打開 App
- 點選「產生配對碼」
- 會看到類似 `PACKET-A1B2C3` 的配對碼

**iPhone B**:
- 打開 App  
- 點選「輸入配對碼」
- 輸入 iPhone A 的配對碼
- 配對成功！✅

### 3️⃣ 新增餐廳
點選「+ 新增地點」，有兩種方式：

**方式 A：從 Instagram 匯入**
```
1. 點選「從連結匯入」
2. 貼上 Instagram/Threads 連結
3. 等待自動抓取（約 2-3 秒）
4. 檢查並補充資訊
5. 儲存
```

**方式 B：手動輸入**
```
1. 直接填寫：
   - 餐廳名稱
   - 地址
   - 電話
   - 備註
2. 儲存
```

---

## 🧪 測試用 Instagram 連結

可以用這個連結測試抓取功能：
```
https://www.instagram.com/reel/Dc_Ca43KO06/?stkn=MXJ6Z2Z0YWZvaXVzOQ==
```

---

## ✨ 主要功能

### 🔄 自動同步
- 在 iPhone A 新增 → 自動出現在 iPhone B
- 在 iPhone B 編輯 → 自動更新到 iPhone A
- **實時同步**，無需手動重新整理

### 🗺️ Google Maps 整合
- 點選地點可看到地圖位置
- 點選「開啟導航」直接跳轉 Google Maps
- 支援搜尋地址

### 📱 離線支援
- 安裝後可在主畫面開啟
- 基本介面支援離線使用
- 同步功能需要網路連線

### 🔍 智能抓取
從 Instagram/Threads 自動識別：
- 🏪 餐廳名稱
- 📍 香港地址（支援中文地名、樓層格式）
- 📞 香港電話（手機/固網）
- 🖼️ 圖片

---

## 🇭🇰 香港格式支援

### 地址範例
```
✅ 中環威靈頓街9-19號地下
✅ 尖沙咀彌敦道100號1樓
✅ 銅鑼灣時代廣場 Shop 123
✅ Near Causeway Bay MTR Station
```

### 電話範例
```
✅ 2332-2896 (固網)
✅ 5123-4567 (手機)
✅ 9876-5432 (手機)
✅ +852 2332-2896 (國際格式)
```

---

## 📊 系統狀態

| 項目 | 狀態 | 說明 |
|------|------|------|
| 🌐 網站 | 🟢 運行中 | Vercel Hosting |
| 🗄️ 資料庫 | 🟢 運行中 | Supabase |
| 📡 API | 🟢 運行中 | Instagram 抓取 |
| 🔄 同步 | 🟢 運行中 | Realtime |

---

## ❓ 常見問題

### Q1: 為什麼 Instagram 連結抓取失敗？
**A**: 可能原因：
- Instagram 暫時阻擋了請求
- 連結格式不正確
- 貼文內容沒有餐廳資訊

**解決方案**: 改用手動輸入

### Q2: 為什麼另一台 iPhone 沒有同步？
**A**: 檢查清單：
- ✓ 兩台裝置是否已配對？
- ✓ 兩台裝置是否都連上網路？
- ✓ 等待 2-3 秒看看是否延遲

### Q3: 可以配對超過 2 台裝置嗎？
**A**: 目前設計是配對 2 台裝置。如需支援更多裝置，需要修改程式碼。

### Q4: 資料會保存多久？
**A**: 永久保存在 Supabase 資料庫中，除非手動刪除。

### Q5: 支援哪些瀏覽器？
**A**: 
- ✅ iOS Safari (推薦)
- ✅ Chrome on iOS
- ⚠️ 其他瀏覽器未測試

---

## 🛠️ 技術細節

### 技術棧
- **前端**: React + TypeScript + Vite
- **UI**: Tailwind CSS
- **資料庫**: Supabase (PostgreSQL)
- **部署**: Vercel
- **API**: Vercel Serverless Functions
- **地圖**: Google Maps Embed API
- **PWA**: Workbox

### API Endpoints

**抓取 Instagram Meta 資訊**:
```
GET /api/extract-metadata?url=<INSTAGRAM_URL>
```

**Supabase Realtime**:
```
自動監聽資料庫變更並同步
```

---

## 📁 專案檔案結構

```
packet/
├── src/
│   ├── components/        # React 元件
│   ├── services/          # 商業邏輯
│   │   ├── supabase.service.ts
│   │   └── extraction.service.ts
│   └── types/            # TypeScript 型別
├── api/
│   └── extract-metadata.ts  # Vercel Function
├── supabase/
│   └── migrations/       # 資料庫 Schema
├── dist/                 # 建置輸出
└── docs/
    ├── EXTRACTION_API.md      # API 文件
    ├── FINAL_CHECKLIST.md     # 部署檢查清單
    └── QUICK_START.md         # 本檔案
```

---

## 🎯 使用建議

### 👍 推薦做法
1. **手動輸入最可靠**: 直接輸入餐廳資訊是最快最準確的
2. **Instagram 連結輔助**: 如果貼文內容完整，可以節省時間
3. **定期檢查同步**: 確保兩台裝置資料一致

### 👎 不推薦做法
1. **完全依賴自動抓取**: Instagram 結構可能隨時改變
2. **在沒網路時新增**: 同步功能需要網路連線
3. **多人共用配對碼**: 每對裝置應使用獨立配對碼

---

## 🚀 進階功能（未來）

### 計劃中
- [ ] AI 智能提取（使用 GPT-4）
- [ ] 支援更多平台（Facebook、小紅書）
- [ ] 照片上傳功能
- [ ] 評分和評論系統
- [ ] 社群共享資料庫
- [ ] OCR 從圖片提取資訊

---

## 📞 需要協助？

### 檢查系統狀態
- Vercel: https://vercel.com/dashboard
- Supabase: https://supabase.com/dashboard

### 測試工具
- 測試頁面: `test-extraction.html`
- iPhone 模擬: `test-iphone.js`

### 文件
- `EXTRACTION_API.md` - API 詳細文件
- `FINAL_CHECKLIST.md` - 完整測試清單
- `HONG_KONG_SUPPORT.md` - 香港格式說明

---

## 🎉 享受使用！

現在你可以：
- ✅ 在兩台 iPhone 上安裝 Packet
- ✅ 配對並開始同步
- ✅ 新增喜歡的餐廳
- ✅ 隨時查看地圖位置
- ✅ 與朋友分享美食清單

**Happy Eating! 🍜🍕🍣🍔🥘**

---

**Last Updated**: 2026-09-22  
**App Version**: 1.0.0  
**Status**: 🟢 Production Ready
