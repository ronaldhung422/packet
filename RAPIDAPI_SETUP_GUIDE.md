# 🚀 快速設定指南：Instagram Scraper API 2023

## 步驟 1：註冊 RapidAPI (5 分鐘)

1. 前往 https://rapidapi.com/
2. 點選右上角 **「Sign Up」**
3. 使用 Google 帳號登入（最快）

## 步驟 2：訂閱 API (5 分鐘)

1. 在 RapidAPI 搜尋框輸入：**「instagram scraper api2」**
2. 選擇 **「Instagram Scraper API 2023」** by Media Toolbox
3. 點選 **「Pricing」** 標籤
4. 選擇 **「Basic (Free)」** 方案
5. 點選 **「Subscribe」**

## 步驟 3：取得 API Key (2 分鐘)

1. 訂閱後，點選 **「Endpoints」** 標籤
2. 在右側看到 **「X-RapidAPI-Key」**
3. 點選 **「Show」** 並複製你的 API Key
4. 應該是類似這樣的格式：
   ```
   1234567890abcdefghijklmnopqrstuv
   ```

## 步驟 4：測試 API (3 分鐘)

在 RapidAPI 網站上直接測試：

1. 選擇 **「post_info」** endpoint
2. 在 **「code_or_id_or_url」** 欄位輸入：
   ```
   https://www.instagram.com/reel/Dc_Ca43KO06/
   ```
3. 點選 **「Test Endpoint」**
4. 應該會看到完整的 JSON 回應

## 步驟 5：設定 Vercel 環境變數 (3 分鐘)

### 方法 A：透過 Vercel Dashboard

1. 前往 https://vercel.com/dashboard
2. 選擇你的 **「packet」** 專案
3. 點選 **「Settings」** → **「Environment Variables」**
4. 新增變數：
   - Name: `RAPIDAPI_KEY`
   - Value: `你的_API_Key`
   - Environment: Production + Preview + Development
5. 點選 **「Save」**

### 方法 B：透過命令列

```bash
cd C:\Download\packet
vercel env add RAPIDAPI_KEY
# 貼上你的 API Key
# 選擇 Production, Preview, Development (全選)
```

## 步驟 6：更新 API Endpoint (已完成 ✓)

我已經建立了 `api/scrape-instagram-rapidapi.ts`

只需要確認 API Host 正確：

```typescript
// api/scrape-instagram-rapidapi.ts
const response = await fetch(
  `https://instagram-scraper-api2.p.rapidapi.com/v1/post_info?code_or_id_or_url=${encodeURIComponent(url)}`,
  {
    headers: {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
    }
  }
)
```

## 步驟 7：部署 (5 分鐘)

```bash
cd C:\Download\packet
npm run build
vercel --prod
```

## 步驟 8：測試 (5 分鐘)

### 方法 A：使用 curl

```bash
curl "https://packet-kappa.vercel.app/api/scrape-instagram-rapidapi?url=https://www.instagram.com/reel/Dc_Ca43KO06/"
```

應該回傳：
```json
{
  "title": "...",
  "description": "...",
  "image": "...",
  "location": "..."
}
```

### 方法 B：在 Packet App 中測試

1. 在 iPhone 上打開 Packet
2. 點選「+ 新增地點」
3. 貼上 Instagram 連結
4. 等待 2-3 秒
5. 查看是否自動填入資訊！

---

## 🎊 完成！

現在你的 Packet App 可以：
- ✅ 自動從 Instagram 抓取餐廳資訊
- ✅ 提取地點名稱和地址
- ✅ 抓取圖片
- ✅ 識別 Hashtags
- ✅ 每月免費 500 次請求

---

## 📊 使用量監控

隨時查看使用情況：

1. 前往 RapidAPI Dashboard
2. 查看 **「Analytics」**
3. 監控：
   - 每月使用量
   - 成功率
   - 回應時間
   - 錯誤率

---

## ⚠️ 注意事項

1. **API Key 安全**
   - ✅ 只存在 Vercel 環境變數
   - ❌ 不要提交到 Git
   - ❌ 不要分享給其他人

2. **請求限制**
   - 免費：500 requests/月
   - 超過後會被限流
   - 考慮升級到 Basic ($9.99/月) 如果不夠用

3. **錯誤處理**
   - 如果 API 失敗，會回到手動輸入
   - 用戶不會看到錯誤，只會被提示手動輸入

---

## 💰 成本估算

假設每月新增 30 個餐廳：
- 使用量：30 requests
- 免費額度：500 requests
- **成本：$0** ✅

假設每月新增 100 個餐廳：
- 使用量：100 requests
- 免費額度：500 requests
- **成本：$0** ✅

假設每月新增 1000 個餐廳：
- 使用量：1000 requests
- 需要：Basic Plan ($9.99/月，10,000 requests)
- **成本：$9.99/月** 💰

---

## 🎯 下一步

設定完成後，建議：
1. 測試 10-20 個不同的 Instagram 連結
2. 記錄成功率
3. 如果成功率 > 80%，就可以正式使用了！
4. 如果成功率 < 60%，可能需要調整或考慮其他 API

---

**準備好了嗎？開始設定吧！** 🚀

如果遇到任何問題，隨時告訴我！
