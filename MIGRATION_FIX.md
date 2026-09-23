# 🔧 Supabase Migration 完整修復指南

## 問題說明

執行 migration 時遇到兩個 constraint 錯誤：

### 錯誤 1: pair_code_length
```
PACKET-TEST01 (13 字元) ✗ 太長
```

### 錯誤 2: pair_code_format  
```
PACKET-DEMO1 (只有 5 個字元在 - 後面) ✗ 不符合格式
```

## 配對碼格式要求

必須符合：`PACKET-` + **正好 6 個大寫字母或數字**

**正確範例：**
- ✓ `PACKET-ABC123` (7+6=12 字元)
- ✓ `PACKET-XYZ999` 
- ✓ `PACKET-DEMO12`
- ✓ `PACKET-TEST01` → 改成 `PACKET-TEST1` 才對（補一個字元）

**錯誤範例：**
- ✗ `PACKET-DEMO1` (只有 5 個字元)
- ✗ `PACKET-TEST01` (有 7 個字元)
- ✗ `PACKET-A` (太短)

---

## 🎯 快速解決方式（推薦）

### 選項 1：使用無測試資料版本（最保險）

1. 前往 Supabase SQL Editor
2. 複製貼上 **`001_minimal.sql`** 的完整內容
3. 點選 Run
4. 完成！

**優點：**
- ✓ 沒有測試資料，不會有格式錯誤
- ✓ 可以多次執行（有 IF NOT EXISTS）
- ✓ 直接在應用程式中產生正確格式的配對碼

---

### 選項 2：使用修正後的完整版本

1. 前往 Supabase SQL Editor
2. 複製貼上 **`001_initial_schema_fixed.sql`** 的完整內容
3. 點選 Run
4. 會建立表格並插入 `PACKET-DEMO12` 測試資料

**優點：**
- ✓ 包含測試資料，可以立即在 Supabase 看到範例
- ✓ 測試資料使用正確格式：`PACKET-DEMO12`

---

### 選項 3：清除後重新開始

如果之前已經建立了部分表格：

```sql
-- 1. 先清除所有內容
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS sync_status CASCADE;
DROP TABLE IF EXISTS pairs CASCADE;
DROP TYPE IF EXISTS place_category CASCADE;
DROP TYPE IF EXISTS person CASCADE;

-- 2. 然後執行 001_minimal.sql 或 001_initial_schema_fixed.sql
```

---

## 📋 執行步驟（詳細）

### Step 1: 開啟 SQL Editor
前往：https://supabase.com/dashboard/project/cfmswewmfaahthjlkshg/sql

### Step 2: 新增查詢
點選「New query」

### Step 3: 選擇要執行的版本

**推薦：使用 `001_minimal.sql`（無測試資料）**
- 適合正式使用
- 不會有測試資料干擾
- 配對碼由應用程式產生

或

**使用 `001_initial_schema_fixed.sql`（含測試資料）**
- 適合先測試看看
- 會建立 `PACKET-DEMO12` 配對碼和 2 個範例餐廳

### Step 4: 貼上並執行
1. 複製整個 SQL 檔案內容
2. 貼到 Supabase SQL Editor
3. 點選右下角的「Run」按鈕

### Step 5: 確認成功

應該看到：
```
✓ Migration 完成！

Tables:
- pairs
- places
- sync_status

✓ 現在可以在應用程式中產生配對碼並開始使用
```

---

## ✅ 驗證設定

執行這些 SQL 確認一切正常：

```sql
-- 檢查表格
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 應該看到：pairs, places, sync_status

-- 檢查 constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'pairs'::regclass;

-- 應該看到：
-- pair_code_length (c)
-- pair_code_format (c)

-- 測試插入一個正確格式的配對碼
INSERT INTO pairs (pair_code) VALUES ('PACKET-ABC123');

-- 成功！檢查
SELECT * FROM pairs;

-- 清理測試
DELETE FROM pairs WHERE pair_code = 'PACKET-ABC123';
```

---

## 🧪 測試配對碼格式

可以用這個 SQL 測試不同格式：

```sql
-- 正確格式（會成功）
INSERT INTO pairs (pair_code) VALUES ('PACKET-XYZ789');

-- 錯誤格式（會失敗並顯示錯誤）
INSERT INTO pairs (pair_code) VALUES ('PACKET-ABC');    -- 太短
INSERT INTO pairs (pair_code) VALUES ('PACKET-ABCD123'); -- 太長
INSERT INTO pairs (pair_code) VALUES ('packet-abc123');  -- 小寫（會失敗）

-- 清理
DELETE FROM pairs WHERE pair_code LIKE 'PACKET-%';
```

---

## 📱 應用程式中的配對碼產生

應用程式的 `generatePairCode()` 函式會自動產生正確格式：

```typescript
// 範例輸出
PACKET-A3K9X2  ✓ 正確 (6 個字元)
PACKET-M7N4P1  ✓ 正確
PACKET-QRS456  ✓ 正確
```

所以只要 migration 成功，應用程式產生的配對碼一定符合格式。

---

## 🗑️ 清理測試資料（正式使用前）

如果你執行了含測試資料的版本：

```sql
-- 刪除測試配對碼和相關地點
DELETE FROM places WHERE pair_code = 'PACKET-DEMO12';
DELETE FROM pairs WHERE pair_code = 'PACKET-DEMO12';

-- 確認清空
SELECT COUNT(*) FROM pairs;   -- 應該是 0
SELECT COUNT(*) FROM places;  -- 應該是 0
```

或直接在 Supabase Table Editor 中手動刪除。

---

## 🎉 完成檢查清單

- [ ] Migration 執行成功（看到 ✓ 訊息）
- [ ] 可以在 Supabase Table Editor 看到 3 個表格
- [ ] 執行驗證 SQL 沒有錯誤
- [ ] （選配）測試插入一個配對碼成功
- [ ] 準備部署應用程式到 Vercel

---

## 🆘 如果還是失敗

### 最後的終極方案：手動建立

如果 SQL 一直有問題，可以：

1. 在 Supabase Table Editor 手動建立表格
2. 使用 Supabase CLI：`supabase db diff`
3. 聯絡 Supabase 支援

但通常 `001_minimal.sql` 應該可以順利執行。

---

## 📝 可用的 Migration 檔案

現在專案中有 3 個版本可選：

1. **`001_minimal.sql`** ⭐ 推薦
   - 無測試資料
   - 最乾淨
   - 適合正式使用

2. **`001_initial_schema_fixed.sql`**
   - 含測試資料 `PACKET-DEMO12`
   - 適合先測試

3. **`001_initial_schema.sql`**
   - 原始版本（已修正）
   - 與 fixed 版本相同

---

## ✅ 成功後的下一步

1. ✓ Migration 完成
2. → 執行 `npm run build`
3. → 部署到 Vercel: `vercel --prod`
4. → 在兩台 iPhone 安裝
5. → 產生配對碼並配對
6. → 開始使用 Packet！

配對碼會由應用程式自動產生，格式一定正確！🎊
