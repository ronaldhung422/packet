-- ========================================
-- Packet - Supabase Migration (最簡版，無測試資料)
-- 如果測試資料一直失敗，用這個版本
-- ========================================

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
-- 驗證
-- ========================================

SELECT '✓ Migration 完成！' as status;

SELECT 'Tables:' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pairs', 'places', 'sync_status');

SELECT '✓ 現在可以在應用程式中產生配對碼並開始使用' as next_step;
