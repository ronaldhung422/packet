# 🔍 Debug: API 無法運作

## 問題

API 回傳錯誤：`FUNCTION_INVOCATION_FAILED`

這通常表示：
1. ❌ Endpoint 路徑錯誤
2. ❌ 參數名稱錯誤
3. ❌ API Key 無效
4. ❌ API Host 錯誤

---

## 🎯 需要你的協助

請在 RapidAPI 網站上檢查以下資訊：

### 步驟 1：前往你的 API

https://rapidapi.com/（登入後）

找到你訂閱的 API：`instagram-scraper-20251`

### 步驟 2：查看 Endpoints

點選 **"Endpoints"** 標籤

### 步驟 3：提供以下資訊

#### A. Endpoint 列表

在左側看到的所有 endpoints，例如：
- [ ] `/post`
- [ ] `/post_info`
- [ ] `/media`
- [ ] `/get_post`
- [ ] 其他：_______

#### B. 選擇一個 Endpoint 並查看詳情

通常選擇最常用的（例如 `/post` 或 `/post_info`）

**請提供**：

1. **完整的 Request URL**（在右側 Code Snippets 中）
   ```
   例如：
   https://instagram-scraper-20251.p.rapidapi.com/v1/post?url=...
   或
   https://instagram-scraper-20251.p.rapidapi.com/post?shortcode=...
   ```

2. **參數名稱**
   - [ ] `url`
   - [ ] `shortcode`
   - [ ] `post_id`
   - [ ] `code`
   - [ ] 其他：_______

3. **HTTP Method**
   - [ ] GET
   - [ ] POST

4. **必需的 Headers**
   ```
   X-RapidAPI-Key: ...
   X-RapidAPI-Host: ...
   其他：_______
   ```

#### C. 測試結果

在 RapidAPI 網站上測試：

1. 輸入測試 URL：`https://www.instagram.com/reel/Dc_Ca43KO06/`
2. 點選 **"Test Endpoint"**
3. 貼上回傳的 JSON（前 50 行即可）

```json
{
  "請貼上實際的回傳 JSON"
}
```

---

## 🔧 常見的 Endpoint 格式

### 格式 A：使用 URL 參數
```
GET https://instagram-scraper-20251.p.rapidapi.com/post?url=INSTAGRAM_URL
```

### 格式 B：使用 Shortcode
```
GET https://instagram-scraper-20251.p.rapidapi.com/post?shortcode=Dc_Ca43KO06
```

### 格式 C：使用 Path 參數
```
GET https://instagram-scraper-20251.p.rapidapi.com/post/Dc_Ca43KO06
```

### 格式 D：POST 請求
```
POST https://instagram-scraper-20251.p.rapidapi.com/scrape
Body: { "url": "INSTAGRAM_URL" }
```

---

## 📸 最好的方式

如果可以的話，請截圖或複製以下內容：

1. **Endpoints 列表**（左側）
2. **Code Snippets**（右側，選擇 JavaScript/Node.js）
3. **測試結果的 JSON**

然後貼給我，我會立即修正！

---

## 🎯 我需要知道的

最重要的是：

1. **正確的 Endpoint 路徑**（例如：`/post`、`/v1/post_info`）
2. **正確的參數名稱**（例如：`url`、`shortcode`）
3. **回傳的 JSON 結構**

有了這些資訊，我可以在 5 分鐘內修好！🚀
