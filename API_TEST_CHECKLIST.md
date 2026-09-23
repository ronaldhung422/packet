# 📋 API 測試清單

## 請在 RapidAPI 網站上測試後填寫

### 基本資訊
- [ ] API 名稱: Instagram Scraper 2023
- [ ] 開發者: sochineme
- [ ] 已訂閱: □ 是 □ 否
- [ ] API Key: ________________

### API Endpoint 資訊
- [ ] Endpoint 路徑: _______________ (例如：/post_info)
- [ ] HTTP 方法: □ GET □ POST
- [ ] 參數名稱: _______________ (例如：url, shortcode)

### 測試結果
- [ ] 測試 URL: https://www.instagram.com/reel/Dc_Ca43KO06/
- [ ] 測試成功: □ 是 □ 否
- [ ] 回應時間: _______ 秒

### 回傳資料檢查
請貼上測試時回傳的 JSON（至少前 50 行）：

```json
{
  "請貼上實際回傳的 JSON 資料"
}
```

### 資料欄位確認

回傳的 JSON 中是否包含以下資訊？

| 欄位 | 有/無 | JSON 路徑 |
|------|-------|-----------|
| Caption/文字內容 | □ 有 □ 無 | data.caption 或 _______ |
| 圖片 URL | □ 有 □ 無 | data.display_url 或 _______ |
| 地點名稱 | □ 有 □ 無 | data.location.name 或 _______ |
| 地點地址 | □ 有 □ 無 | data.location.address 或 _______ |
| 作者 Username | □ 有 □ 無 | data.owner.username 或 _______ |
| 按讚數 | □ 有 □ 無 | data.like_count 或 _______ |

---

## 下一步

完成測試後，請提供：
1. ✅ 你的 API Key（設定到 Vercel）
2. ✅ Endpoint 路徑
3. ✅ 回傳的 JSON 結構

我會立即：
1. 更新 `api/scrape-instagram-rapidapi.ts` 使用正確的 endpoint
2. 解析正確的 JSON 欄位
3. 部署到 Vercel
4. 測試確認運作正常

---

**準備好後告訴我，我會立刻協助整合！** 🚀
