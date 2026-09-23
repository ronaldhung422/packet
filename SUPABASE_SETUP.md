# Packet - Supabase 資料庫設定

## 專案資訊
- **Supabase URL**: https://cfmswewmfaahthjlkshg.supabase.co
- **Project ID**: cfmswewmfaahthjlkshg

## 📋 執行 Migration

### 方式 1: 透過 Supabase Dashboard（推薦）

1. 前往 SQL Editor: https://supabase.com/dashboard/project/cfmswewmfaahthjlkshg/sql

2. 點選「New query」

3. 複製貼上 `001_initial_schema.sql` 的完整內容

4. 點選「Run」執行

5. 確認成功訊息

### 方式 2: 使用 Supabase CLI

```bash
# 安裝 Supabase CLI（如果還沒有）
npm install -g supabase

# 登入
supabase login

# 連結專案
supabase link --project-ref cfmswewmfaahthjlkshg

# 執行 migration
supabase db push
```

## ✅ 驗證設定

執行以下 SQL 確認表格已建立：

```sql
-- 檢查表格
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 應該看到：
-- pairs
-- places  
-- sync_status

-- 檢查 RLS 政策
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- 測試插入配對碼
INSERT INTO pairs (pair_code) 
VALUES ('PACKET-TEST99') 
RETURNING *;

-- 清理測試資料
DELETE FROM pairs WHERE pair_code = 'PACKET-TEST99';
```

## 🔐 安全性檢查

### Row Level Security (RLS)
所有表格都已啟用 RLS：
- ✓ `pairs` - 只能讀取 active 的配對
- ✓ `places` - 只能存取相同 pair_code 的資料
- ✓ `sync_status` - 只能讀取

### 權限設定
```sql
-- 確認權限
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name IN ('pairs', 'places', 'sync_status');
```

## 📊 實用查詢

### 查看所有配對
```sql
SELECT 
    pair_code,
    created_at,
    last_sync,
    is_active,
    (SELECT COUNT(*) FROM places WHERE places.pair_code = pairs.pair_code) as place_count
FROM pairs
ORDER BY created_at DESC;
```

### 查看最近新增的地點
```sql
SELECT 
    p.name,
    p.category,
    p.added_by,
    p.added_at,
    p.pair_code,
    array_length(p.tags, 1) as tag_count,
    array_length(p.memories, 1) as memory_count
FROM places p
WHERE p.deleted_at IS NULL
ORDER BY p.added_at DESC
LIMIT 10;
```

### 查看配對統計
```sql
SELECT 
    pair_code,
    COUNT(*) as total_places,
    COUNT(*) FILTER (WHERE category = 'want-to-try') as want_to_try,
    COUNT(*) FILTER (WHERE category = 'been-there') as been_there,
    COUNT(*) FILTER (WHERE category = 'favorites') as favorites,
    COUNT(*) FILTER (WHERE added_by = 'ronald') as ronald_places,
    COUNT(*) FILTER (WHERE added_by = 'kerry') as kerry_places
FROM places
WHERE deleted_at IS NULL
GROUP BY pair_code;
```

### 清理測試資料（小心使用！）
```sql
-- 刪除測試配對碼
DELETE FROM pairs WHERE pair_code LIKE 'PACKET-TEST%';

-- 刪除 sample 資料
DELETE FROM places WHERE link LIKE '%sample%';
```

## 🔄 Realtime 設定

確認 Realtime 已啟用：

1. 前往：Settings > API > Realtime
2. 確認以下表格的 Realtime 已啟用：
   - ✓ `places`
   - ✓ `pairs`

或用 SQL 確認：
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 🧹 維護作業

### 定期清理（可設定 cron job）
```sql
-- 停用 30 天未使用的配對
UPDATE pairs
SET is_active = FALSE
WHERE last_sync < NOW() - INTERVAL '30 days'
  AND created_at < NOW() - INTERVAL '30 days'
  AND is_active = TRUE;

-- 查看需要清理的記錄
SELECT COUNT(*) FROM pairs WHERE is_active = FALSE;
```

### 備份重要資料
```sql
-- 匯出所有 active 配對的資料
COPY (
    SELECT * FROM places 
    WHERE pair_code IN (SELECT pair_code FROM pairs WHERE is_active = TRUE)
    AND deleted_at IS NULL
) TO STDOUT WITH CSV HEADER;
```

## 📈 效能優化

目前的索引設定已經很完善：
- ✓ `pair_code` 索引（最常查詢）
- ✓ `added_at` 索引（排序用）
- ✓ `tags` GIN 索引（陣列搜尋）
- ✓ `location` GIN 索引（JSONB 查詢）

如果未來資料量大，可以考慮：
```sql
-- 分析查詢效能
EXPLAIN ANALYZE
SELECT * FROM places 
WHERE pair_code = 'PACKET-ABC123'
AND deleted_at IS NULL
ORDER BY added_at DESC;

-- 如需要，可新增複合索引
CREATE INDEX idx_places_pair_active 
ON places(pair_code, added_at DESC) 
WHERE deleted_at IS NULL;
```

## 🆘 問題排查

### 問題：配對失敗
```sql
-- 檢查配對碼是否存在
SELECT * FROM pairs WHERE pair_code = 'PACKET-XXXXXX';

-- 檢查是否 active
SELECT is_active FROM pairs WHERE pair_code = 'PACKET-XXXXXX';
```

### 問題：地點沒有同步
```sql
-- 檢查地點數量
SELECT pair_code, COUNT(*) 
FROM places 
WHERE deleted_at IS NULL 
GROUP BY pair_code;

-- 檢查最近的變更
SELECT * FROM places 
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

### 問題：Realtime 不工作
```sql
-- 檢查 RLS 政策
SELECT * FROM pg_policies WHERE tablename = 'places';

-- 測試權限
SELECT * FROM places LIMIT 1;
```

## 完成！

資料庫已準備就緒，可以開始使用 Packet 了！
