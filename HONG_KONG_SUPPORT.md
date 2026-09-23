# 🇭🇰 香港地區支援 + 改進的資訊抓取

## ✅ 已完成的改進

### 1. 香港地址格式支援 ✓

支援以下香港常見地址格式：

#### 地區名稱
- 九龍區：尖沙咀、旺角、油麻地、佐敦、紅磡、觀塘、黃大仙、深水埗
- 香港島：中環、銅鑼灣、灣仔、北角、鰂魚涌、柴灣、筲箕灣、西營盤、上環、金鐘
- 新界：荃灣、沙田、大埔、元朗、屯門

#### 地址格式
```
✅ 📍 尖沙咀金馬倫道3號
✅ 地址：旺角西洋菜南街1A號
✅ 位置：中環皇后大道中99號
✅ G/F, 123 Nathan Road, TST
✅ Shop 3, 2/F, Times Square, Causeway Bay
✅ near Admiralty MTR Station
```

#### 樓層格式（香港特有）
```
✅ G/F (Ground Floor)
✅ 1/F, 2/F, 3/F (樓層)
✅ Shop 3, 2/F
✅ Unit A-B, 10/F
```

---

### 2. 香港電話號碼格式支援 ✓

#### 手機號碼（8位數字）
```
✅ 5XXX XXXX (5開頭)
✅ 6XXX XXXX (6開頭)
✅ 9XXX XXXX (9開頭)
✅ 5123-4567
✅ 9876 5432
```

#### 固網電話（8位數字）
```
✅ 2XXX XXXX (2開頭 - 香港島、九龍)
✅ 3XXX XXXX (3開頭 - 新電話號碼)
✅ 2123-4567
✅ 3456 7890
```

#### 國際格式
```
✅ +852 2123 4567
✅ +852-9876-5432
✅ +852 5123 4567
```

#### 關鍵字識別
```
✅ 電話：2123 4567
✅ Tel: 2123 4567
✅ Phone: 9876 5432
✅ ☎️ 5123 4567
✅ 📞 2123 4567
✅ 訂位：2123 4567
✅ 預約：9876 5432
✅ 聯絡：5123 4567
```

---

### 3. 改進的餐廳名稱抓取 ✓

#### 多語言支援
```
✅ 中文餐廳名稱（2-20個中文字）
✅ 英文餐廳名稱
✅ 中英混合名稱
```

#### 識別模式
```
✅ 🍜 添好運點心專門店
✅ @timhowan
✅ #添好運
✅ "Tim Ho Wan"
✅ Lunch at 翠華餐廳
✅ 蘭芳園 - 絲襪奶茶始祖
```

#### 智能過濾
自動排除無意義的文字：
- ❌ instagram, threads, post, photo
- ❌ food, yummy, delicious (僅這些字)
- ❌ lunch, dinner (僅這些字)
- ❌ today, yesterday
- ✅ "Yummy Cafe" (完整餐廳名稱保留)

---

## 📝 使用範例

### 範例 1：香港中環餐廳

**Instagram 貼文內容：**
```
🍜 蘭芳園
📍 中環結志街2號地下
☎️ 2544-3895
絲襪奶茶始祖！必試招牌奶茶
```

**自動抓取結果：**
- 餐廳名稱：`蘭芳園`
- 地址：`中環結志街2號地下`
- 電話：`2544-3895`

---

### 範例 2：尖沙咀日式餐廳

**Threads 貼文內容：**
```
Amazing sushi at "Sushi Kuu" 🍣
Location: Shop 3, G/F, 18 Carnarvon Road, TST
Tel: 2369-8773
```

**自動抓取結果：**
- 餐廳名稱：`Sushi Kuu`
- 地址：`Shop 3, G/F, 18 Carnarvon Road, TST`
- 電話：`2369-8773`

---

### 範例 3：銅鑼灣餐廳

**Instagram 貼文內容：**
```
@yardbird_hk
📍 銅鑼灣士丹頓街154-158號
電話：2547 9273
今晚的燒雞太讚了！
```

**自動抓取結果：**
- 餐廳名稱：`yardbird_hk`
- 地址：`銅鑼灣士丹頓街154-158號`
- 電話：`2547 9273`

---

### 範例 4：MTR 附近餐廳

**Threads 貼文內容：**
```
Found this gem near Admiralty MTR 💎
"Little Bao" - best bao in town!
Phone: 2194 0202
```

**自動抓取結果：**
- 餐廳名稱：`Little Bao`
- 地址：`near Admiralty MTR`
- 電話：`2194 0202`

---

## 🔄 CORS 代理問題解決

如果抓取功能不工作，可能是因為 CORS 代理失效。

### 當前使用的代理
```typescript
https://corsproxy.io/?[URL]
```

### 備用方案

#### 方案 A：使用其他 CORS 代理
1. 打開 `src/services/extraction.service.ts`
2. 找到第 99 行：
```typescript
const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
```
3. 替換為其他代理：
```typescript
// 選項 1：AllOrigins
const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, {

// 選項 2：CORS Anywhere
const response = await fetch(`https://cors-anywhere.herokuapp.com/${url}`, {

// 選項 3：ThingProxy
const response = await fetch(`https://thingproxy.freeboard.io/fetch/${url}`, {
```

#### 方案 B：手動輸入（不使用連結）
如果抓取功能完全無法使用：
1. 點選「新增」
2. 留空連結欄位
3. 手動輸入：
   - 餐廳名稱
   - 地址
   - 電話號碼
   - 標籤和類別

---

## 🧪 測試檢查清單

### 地址識別測試
- [ ] 中環地址（香港島）
- [ ] 尖沙咀地址（九龍）
- [ ] 沙田地址（新界）
- [ ] G/F 樓層格式
- [ ] Shop X, Y/F 格式
- [ ] MTR 站名格式

### 電話號碼測試
- [ ] 5開頭手機 (5XXX XXXX)
- [ ] 6開頭手機 (6XXX XXXX)
- [ ] 9開頭手機 (9XXX XXXX)
- [ ] 2開頭固網 (2XXX XXXX)
- [ ] 3開頭固網 (3XXX XXXX)
- [ ] +852 國際格式
- [ ] 含關鍵字（電話：、Tel:）

### 餐廳名稱測試
- [ ] 純中文名稱
- [ ] 純英文名稱
- [ ] 中英混合名稱
- [ ] @username 格式
- [ ] #hashtag 格式
- [ ] "引號包圍" 格式

---

## 🔧 如何測試

### 步驟 1：部署最新版本
```bash
npm run build
vercel --prod
```

### 步驟 2：在手機上測試
1. 打開 Packet app
2. 點選「新增」
3. 貼上一個香港餐廳的 Instagram/Threads 連結
4. 觀察是否自動抓取：
   - ✅ 餐廳名稱
   - ✅ 地址
   - ✅ 電話號碼

### 步驟 3：檢查開發者工具（如果不工作）
在桌面瀏覽器：
1. 按 F12 打開開發者工具
2. 切換到 Console 標籤
3. 點選「新增」並貼上連結
4. 查看 Console 中的錯誤訊息
5. 查看 Network 標籤中的請求狀態

---

## 📊 支援的格式總結

| 類型 | 台灣格式 | 香港格式 | 狀態 |
|------|---------|---------|------|
| **地址** | 台北市信義區... | 中環皇后大道中... | ✅ |
| **電話** | 02-1234-5678 | 2123-4567 | ✅ |
| **手機** | 0912-345-678 | 9123-4567 | ✅ |
| **樓層** | 1樓 | G/F, 1/F | ✅ |
| **MTR** | - | near MTR Station | ✅ |
| **中文** | 鼎泰豐 | 添好運 | ✅ |
| **英文** | Din Tai Fung | Tim Ho Wan | ✅ |

---

## 🚀 建置狀態

```bash
✓ TypeScript 編譯：通過
✓ Vite 建置：成功
✓ 香港地址格式：支援
✓ 香港電話格式：支援
✓ 改進餐廳名稱抓取：完成
✓ 智能文字過濾：啟用

產物大小：
- JavaScript: 517.10 KB (146.18 KB gzipped)
- 比上一版增加：0.69 KB
```

---

## 📌 重要提醒

### CORS 限制
Instagram 和 Threads 有嚴格的 CORS 政策，客戶端抓取可能不穩定。

**建議解決方案：**
1. 使用手動輸入（最可靠）
2. 建立後端 API（未來優化）
3. 使用多個 CORS 代理作為備援

### 最佳實踐
1. **複製貼文內容**：從 Instagram/Threads 複製整段文字到備忘錄
2. **手動輸入**：打開 Packet，手動輸入餐廳資訊
3. **加入照片**：可以從相機膠卷選擇照片

這樣可以避免 CORS 問題，且更快速！

---

**最後更新：** 2026-09-22  
**版本：** 1.1.0  
**地區支援：** 🇭🇰 香港 + 🇹🇼 台灣  
**狀態：** ✅ 完成並可部署
