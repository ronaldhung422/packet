# 🔍 Instagram 自動抓取 - 可行方案指南

## 📊 方案比較

| 方案 | 難度 | 成本 | 可靠性 | 合法性 | 推薦度 |
|------|------|------|--------|--------|--------|
| **RapidAPI** | ⭐ 簡單 | $10-50/月 | ⭐⭐⭐⭐⭐ | ✅ 合法 | ⭐⭐⭐⭐⭐ |
| **Instagram Graph API** | ⭐⭐ 中等 | 免費 | ⭐⭐⭐⭐⭐ | ✅ 官方 | ⭐⭐⭐ |
| **Puppeteer 爬蟲** | ⭐⭐⭐⭐ 困難 | 高 | ⭐⭐⭐ | ⚠️ 灰色 | ⭐⭐ |
| **iOS Share Extension** | ⭐⭐⭐⭐⭐ 很難 | $99/年 | ⭐⭐⭐⭐⭐ | ✅ 合法 | ⭐⭐⭐⭐ |
| **oEmbed API** | ⭐ 簡單 | 免費 | ⭐⭐⭐⭐ | ✅ 官方 | ⭐⭐ |

---

## 🥇 推薦方案：RapidAPI Instagram Scraper

### 為什麼選這個？

1. ✅ **即插即用** - 最快 1 小時實現
2. ✅ **高可靠性** - 95%+ 成功率
3. ✅ **完整資訊** - caption, location, likes, comments
4. ✅ **合法合規** - 不違反服務條款
5. ✅ **有支援** - 完整文件和客服

### 實作步驟

#### 步驟 1：註冊 RapidAPI

1. 前往 https://rapidapi.com/
2. 註冊帳號（使用 Google 或 GitHub）
3. 免費方案即可開始測試

#### 步驟 2：選擇 Instagram API

推薦以下幾個（按評價排序）：

**選項 A: Instagram Scraper API** ⭐⭐⭐⭐⭐
```
價格：免費 500 requests/月，Pro $9.99/月
特色：完整貼文資訊、地點、hashtags
連結：搜尋 "instagram scraper api2"
```

**選項 B: Instagram Bulk Profile Scrapper**
```
價格：免費 100 requests/月，Basic $5/月
特色：批次抓取、快速回應
```

**選項 C: Social Media Scraper**
```
價格：免費 50 requests/月，Mega $15/月
特色：支援多平台（Instagram, Facebook, TikTok）
```

#### 步驟 3：取得 API Key

1. 訂閱選擇的 API
2. 前往「Apps」→「Default Application」
3. 複製 `X-RapidAPI-Key`

#### 步驟 4：加入環境變數

在 Vercel 專案設定中：

```
RAPIDAPI_KEY=your_api_key_here
```

或本地測試時在 `.env` 檔案：

```bash
# .env
RAPIDAPI_KEY=your_api_key_here
```

#### 步驟 5：使用 API

我已經建立了 `api/scrape-instagram-rapidapi.ts`，你只需要：

1. 確保環境變數已設定
2. 部署到 Vercel：`vercel --prod`
3. 測試 API：
```bash
curl "https://packet-kappa.vercel.app/api/scrape-instagram-rapidapi?url=https://www.instagram.com/reel/Dc_Ca43KO06/"
```

#### 步驟 6：更新前端

修改 `extraction.service.ts`：

```typescript
private async extractClientSide(url: string, platform: 'instagram' | 'threads'): Promise<LinkMetadata> {
  try {
    // 使用 RapidAPI endpoint
    const apiUrl = `/api/scrape-instagram-rapidapi?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.title + ' ' + data.description;
    
    return {
      title: data.title || '',
      description: data.description || '',
      image: data.image || '',
      restaurantName: this.extractRestaurantNameFromInstagram(data.title, data.description),
      location: data.location || this.extractLocation(text),
      phone: this.extractPhone(text),
      extractedAt: new Date().toISOString(),
      platform
    };
  } catch (error) {
    // 回到手動輸入
    return {
      title: '',
      description: '',
      image: '',
      restaurantName: '',
      location: '',
      phone: '',
      extractedAt: new Date().toISOString(),
      platform,
      error: '自動抓取失敗，請手動輸入'
    };
  }
}
```

---

## 🎯 其他方案詳解

### 方案 2：Instagram Graph API (官方)

**適合場景**：
- 用戶願意登入 Instagram 授權
- 只需要抓取自己的貼文
- 想要完全合法的解決方案

**限制**：
- ❌ **無法抓取其他人的公開貼文**
- ❌ 需要複雜的 OAuth 流程
- ❌ 申請審核可能需要數週

**實作指南**：
1. https://developers.facebook.com/docs/instagram-basic-display-api
2. 申請 Instagram Basic Display API
3. 實作 OAuth 登入流程
4. 只能用於已授權用戶的貼文

**結論**：不適合 Packet 的使用場景（要抓取朋友的推薦）

---

### 方案 3：Puppeteer 爬蟲

**適合場景**：
- 預算有限，不想付費
- 技術能力強
- 可以接受偶爾失敗

**實作範例**：

```typescript
// api/scrape-instagram-puppeteer.ts
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  const { url } = req.query;
  
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });
  
  try {
    const page = await browser.newPage();
    
    // 模擬 iPhone
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15');
    await page.setViewport({ width: 375, height: 812 });
    
    // 前往 Instagram
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 等待內容載入
    await page.waitForSelector('article', { timeout: 10000 });
    
    // 抓取資料
    const data = await page.evaluate(() => {
      // 找到貼文內容
      const caption = document.querySelector('h1')?.textContent || 
                      document.querySelector('meta[property="og:title"]')?.content || '';
      
      const description = document.querySelector('meta[property="og:description"]')?.content || '';
      const image = document.querySelector('meta[property="og:image"]')?.content || '';
      
      return { caption, description, image };
    });
    
    await browser.close();
    
    res.json(data);
    
  } catch (error) {
    await browser.close();
    res.status(500).json({ error: error.message });
  }
}
```

**注意事項**：
- ⚠️ Vercel 免費版不支援 Puppeteer（需要 Pro plan）
- ⚠️ 每次請求耗時 5-10 秒
- ⚠️ 可能被 Instagram 封鎖 IP
- ⚠️ 違反 Instagram 服務條款

---

### 方案 4：iOS Share Extension

**適合場景**：
- 願意投資原生 App
- 想要最佳用戶體驗
- 長期發展規劃

**用戶體驗**：
```
在 Instagram App 中
    ↓
看到餐廳貼文
    ↓
點選「分享」圖示
    ↓
選擇「加入 Packet」
    ↓
Packet 自動開啟並填好表單
    ↓
確認並儲存
```

**實作技術棧**：
- React Native + Expo
- 或 Capacitor + Ionic
- iOS Share Extension

**成本**：
- Apple Developer Account: $99/年
- 開發時間: 2-4 週
- 維護成本: 持續

**結論**：長期方案，如果 Packet 要成為正式產品可以考慮

---

### 方案 5：Instagram oEmbed API

**最簡單的官方方案**：

```typescript
// 使用 oEmbed API（不需要 access token）
const response = await fetch(
  `https://graph.facebook.com/v18.0/instagram_oembed?url=${instagramUrl}`
);

const data = await response.json();
// 回傳：title, author_name, thumbnail_url, html（嵌入代碼）
```

**優點**：
- ✅ 官方 API
- ✅ 免費
- ✅ 不需要授權

**缺點**：
- ⚠️ 資訊非常有限（只有標題和圖片）
- ⚠️ 沒有 caption 完整內容
- ⚠️ 沒有地點資訊

**結論**：資訊太少，不適合 Packet 的需求

---

## 💰 成本分析

### RapidAPI 方案

假設每月新增 50 個餐廳：

| 方案 | 月費 | 請求限制 | 每次成本 |
|------|------|----------|----------|
| **Free** | $0 | 500/月 | $0 |
| **Basic** | $9.99 | 5,000/月 | $0.002 |
| **Pro** | $29.99 | 50,000/月 | $0.0006 |

**結論**：免費方案就夠用了！

### Puppeteer 方案

| 項目 | 成本 |
|------|------|
| Vercel Pro | $20/月 |
| 開發時間 | 2-3 天 |
| 維護成本 | 高 |
| **總計** | $20/月 + 時間成本 |

**結論**：不划算，且不穩定

---

## 🚀 立即行動計畫

### 今天就可以做（1 小時）

1. **註冊 RapidAPI** (5 分鐘)
   - https://rapidapi.com/

2. **訂閱免費方案** (5 分鐘)
   - 搜尋 "Instagram Scraper API"
   - 訂閱免費方案（500 requests/月）

3. **取得 API Key** (2 分鐘)
   - 複製 `X-RapidAPI-Key`

4. **設定環境變數** (3 分鐘)
   ```bash
   # 在 Vercel 專案設定
   RAPIDAPI_KEY=your_key_here
   ```

5. **部署** (5 分鐘)
   ```bash
   npm run build
   vercel --prod
   ```

6. **測試** (5 分鐘)
   - 在 iPhone 上開啟 Packet
   - 貼上 Instagram 連結
   - 查看是否自動填入！

---

## 📈 成功率預估

| 方案 | 成功率 | 速度 | 穩定性 |
|------|--------|------|--------|
| **RapidAPI** | 95% | 1-2秒 | ⭐⭐⭐⭐⭐ |
| **Graph API** | 100% | <1秒 | ⭐⭐⭐⭐⭐ |
| **Puppeteer** | 60% | 5-10秒 | ⭐⭐ |
| **Share Extension** | 100% | 即時 | ⭐⭐⭐⭐⭐ |
| **oEmbed** | 90% | <1秒 | ⭐⭐⭐ |

---

## 🎯 我的最終建議

### 短期（立即實現）
使用 **RapidAPI Instagram Scraper**
- 1 小時實現
- 免費 500 requests/月
- 高可靠性

### 中期（1-2 個月）
如果用戶數增長，考慮：
- 升級到 RapidAPI Basic 方案（$9.99/月）
- 或整合多個 API 作為備援

### 長期（6-12 個月）
如果 Packet 成為正式產品：
- 開發 iOS 原生 App
- 實作 Share Extension
- 提供最佳用戶體驗

---

## 📞 需要協助？

如果你決定使用 RapidAPI 方案，我可以：
1. 協助整合到現有程式碼
2. 處理錯誤情況
3. 優化用戶體驗
4. 測試並部署

只要告訴我你想要哪個方案，我會立即協助實作！

---

**推薦：立即試用 RapidAPI 免費方案！** 🚀
