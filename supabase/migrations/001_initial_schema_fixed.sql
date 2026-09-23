-- ========================================
-- Packet - Supabase Migration (修正版)
-- 配對碼格式: PACKET-XXXXXX (正好 12 字元)
-- ========================================

-- 如果之前執行失敗，先清除 (可選)
-- DROP TABLE IF EXISTS places CASCADE;
-- DROP TABLE IF EXISTS sync_status CASCADE;
-- DROP TABLE IF EXISTS pairs CASCADE;
-- DROP TYPE IF EXISTS place_category CASCADE;
-- DROP TYPE IF EXISTS person CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
DO $$ BEGIN
    CREATE TYPE place_category AS ENUM ('want-to-try', 'been-there', 'favorites');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE person AS ENUM ('ronald', 'kerry');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create pairs table
CREATE TABLE IF NOT EXISTS pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT pair_code_length CHECK (LENGTH(pair_code) = 12),
    CONSTRAINT pair_code_format CHECK (pair_code ~ '^PACKET-[A-Z0-9]{6}$')
);

CREATE INDEX IF NOT EXISTS idx_pairs_pair_code ON pairs(pair_code);
CREATE INDEX IF NOT EXISTS idx_pairs_is_active ON pairs(is_active);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair_code TEXT NOT NULL REFERENCES pairs(pair_code) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    extracted_from TEXT,
    category place_category NOT NULL DEFAULT 'want-to-try',
    tags TEXT[] DEFAULT '{}',
    added_by person NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    location JSONB,
    memories JSONB[] DEFAULT '{}',
    
    visited_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_url CHECK (link ~ '^https?://'),
    CONSTRAINT valid_tags CHECK (array_length(tags, 1) <= 20)
);

CREATE INDEX IF NOT EXISTS idx_places_pair_code ON places(pair_code);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_places_added_by ON places(added_by);
CREATE INDEX IF NOT EXISTS idx_places_added_at ON places(added_at DESC);
CREATE INDEX IF NOT EXISTS idx_places_deleted_at ON places(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_places_tags ON places USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_places_location ON places USING GIN(location);

-- Create sync_status table
CREATE TABLE IF NOT EXISTS sync_status (
    pair_code TEXT PRIMARY KEY REFERENCES pairs(pair_code) ON DELETE CASCADE,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pending_changes INTEGER DEFAULT 0,
    sync_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_places_updated_at ON places;
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sync_status_updated_at ON sync_status;
CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON sync_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Pairs are readable by anyone with pair code" ON pairs;
DROP POLICY IF EXISTS "Places are readable by anyone with pair code" ON places;
DROP POLICY IF EXISTS "Places can be inserted with valid pair code" ON places;
DROP POLICY IF EXISTS "Places can be updated by pair code" ON places;
DROP POLICY IF EXISTS "Places can be deleted (soft) by pair code" ON places;
DROP POLICY IF EXISTS "Sync status is readable by pair code" ON sync_status;

-- Create policies
CREATE POLICY "Pairs are readable by anyone with pair code"
    ON pairs FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Places are readable by anyone with pair code"
    ON places FOR SELECT
    USING (pair_code IN (SELECT pair_code FROM pairs WHERE is_active = TRUE) AND deleted_at IS NULL);

CREATE POLICY "Places can be inserted with valid pair code"
    ON places FOR INSERT
    WITH CHECK (pair_code IN (SELECT pair_code FROM pairs WHERE is_active = TRUE));

CREATE POLICY "Places can be updated by pair code"
    ON places FOR UPDATE
    USING (pair_code IN (SELECT pair_code FROM pairs WHERE is_active = TRUE));

CREATE POLICY "Places can be deleted (soft) by pair code"
    ON places FOR DELETE
    USING (pair_code IN (SELECT pair_code FROM pairs WHERE is_active = TRUE));

CREATE POLICY "Sync status is readable by pair code"
    ON sync_status FOR SELECT
    USING (TRUE);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ========================================
-- 測試資料 (可選，生產環境建議刪除)
-- ========================================

-- 插入一個測試配對碼 (正好 12 字元: PACKET- + 6個字元)
INSERT INTO pairs (pair_code) VALUES ('PACKET-DEMO12')
ON CONFLICT (pair_code) DO NOTHING;

-- 插入測試地點
INSERT INTO places (pair_code, name, description, link, category, tags, added_by) VALUES
    ('PACKET-DEMO12', 'Sample Restaurant 1', 'A great place for pizza', 'https://instagram.com/p/sample1', 'want-to-try', ARRAY['pizza', 'italian'], 'ronald'),
    ('PACKET-DEMO12', 'Sample Restaurant 2', 'Amazing sushi place', 'https://threads.net/@user/post/123', 'been-there', ARRAY['sushi', 'japanese'], 'kerry')
ON CONFLICT DO NOTHING;

-- ========================================
-- 驗證設定
-- ========================================

-- 檢查表格是否建立
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pairs', 'places', 'sync_status');

-- 檢查測試資料
SELECT 'Test data:' as status;
SELECT pair_code, is_active, 
       (SELECT COUNT(*) FROM places WHERE places.pair_code = pairs.pair_code) as place_count
FROM pairs;

-- 完成！
SELECT '✓ Migration 執行成功！現在可以使用 Packet 了。' as result;
