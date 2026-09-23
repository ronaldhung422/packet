# 🚀 部署到 Vercel 步驟

## 前置檢查

✅ 所有功能已完成
✅ TypeScript 編譯通過
✅ 移除分數/競爭功能完成

---

## 部署步驟

### 1. 確認 build 成功

```bash
cd C:\Download\packet
npm run build
```

應該會看到：
```
✓ built in X.XXs
dist/index.html
dist/assets/...
```

---

### 2. 提交到 Git

```bash
# 查看變更
git status

# 加入所有變更
git add .

# 提交
git commit -m "feat: Albo style redesign with Collections system

- 新增 Collections 收藏夾系統（7個預設分類）
- 實作用戶識別系統（Ronald/Kerry with avatars）
- 重新設計 UI（紫色主題、大圓角、Albo 風格）
- 新增元件：AvatarBadge, FilterChips, FAB, BottomSheet, CollectionCard, PlaceCarousel
- 實作 Drag & Drop 跨 Collection 移動
- 更新 PlaceCard（封面圖、Like 按鈕、頭像徽章）
- 重構 Home 頁面（carousel + 2-column grid）
- 新增 Collection Detail 頁面
- 移除競爭分數系統
- 更新 Database schema（profiles, place_collections）
- 完整 migration scripts"
```

---

### 3. 推送到 GitHub

```bash
# 推送到 main branch
git push origin main
```

---

### 4. Vercel 自動部署

推送後，Vercel 會自動偵測並開始部署：

1. 前往 https://vercel.com/dashboard
2. 找到 `packet` 專案
3. 查看 Deployments 頁面
4. 等待部署完成（通常 2-3 分鐘）
5. 狀態變成 ✅ Ready

---

### 5. 訪問新版本

部署完成後，訪問：
```
https://packet-kappa.vercel.app/
```

你應該會看到：
- ✅ 紫色主題
- ✅ 橫向 Filter Chips
- ✅ 最近 Saved Carousel
- ✅ 2-column Collections Grid
- ✅ 右下角紫色 FAB

---

## ⚠️ 重要：Database Migration

部署後，**必須**在 Supabase 執行 migration：

### 前往 Supabase Dashboard
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

### 執行 Migration 1
複製並執行：
```sql
-- C:\Download\packet\supabase\migrations\20240101000001_add_collections.sql
```

### 執行 Migration 2
複製並執行：
```sql
-- C:\Download\packet\supabase\migrations\20240101000002_migrate_existing_data.sql
```

---

## 🎉 完成！

現在你可以：
1. 在 https://packet-kappa.vercel.app/ 看到全新 Albo 風格
2. 使用 7 個預設 Collections
3. 切換用戶身分（Ronald/Kerry）
4. Drag & Drop 移動餐廳
5. 使用 Like 功能

---

## 📱 測試清單

- [ ] 首頁顯示 Filter Chips
- [ ] 首頁顯示 Carousel
- [ ] 首頁顯示 Collections Grid
- [ ] 點擊 FAB 開啟 Bottom Sheet
- [ ] 新增餐廳時選擇 Collections
- [ ] 點擊 Collection 進入詳細頁
- [ ] 拖拽餐廳到其他 Collection
- [ ] 按 Like 按鈕
- [ ] 看到發現者頭像（👨/👩）
- [ ] 統計頁面沒有分數/競爭內容

---

## 🐛 如果遇到問題

### 清除快取
```javascript
// 在瀏覽器 Console 執行
localStorage.clear()
location.reload()
```

### 檢查 Supabase Migration
確認兩個 migration 都已執行

### 重新部署
在 Vercel Dashboard 點擊 "Redeploy"
