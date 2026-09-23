-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE place_category AS ENUM ('want-to-try', 'been-there', 'favorites');
CREATE TYPE person AS ENUM ('ronald', 'kerry');

-- Create pairs table
CREATE TABLE pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Indexes
    CONSTRAINT pair_code_length CHECK (LENGTH(pair_code) = 12),
    CONSTRAINT pair_code_format CHECK (pair_code ~ '^PACKET-[A-Z0-9]{6}$')
);

CREATE INDEX idx_pairs_pair_code ON pairs(pair_code);
CREATE INDEX idx_pairs_is_active ON pairs(is_active);

-- Create places table
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair_code TEXT NOT NULL REFERENCES pairs(pair_code) ON DELETE CASCADE,
    
    -- Place details
    name TEXT NOT NULL,
    description TEXT,
    link TEXT NOT NULL,
    extracted_from TEXT,
    category place_category NOT NULL DEFAULT 'want-to-try',
    tags TEXT[] DEFAULT '{}',
    added_by person NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Location (stored as JSONB for flexibility)
    location JSONB,
    
    -- Memories (array of JSON objects)
    memories JSONB[] DEFAULT '{}',
    
    -- Visit information
    visited_at TIMESTAMP WITH TIME ZONE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_url CHECK (link ~ '^https?://'),
    CONSTRAINT valid_tags CHECK (array_length(tags, 1) <= 20)
);

-- Indexes for places table
CREATE INDEX idx_places_pair_code ON places(pair_code);
CREATE INDEX idx_places_category ON places(category);
CREATE INDEX idx_places_added_by ON places(added_by);
CREATE INDEX idx_places_added_at ON places(added_at DESC);
CREATE INDEX idx_places_deleted_at ON places(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_places_tags ON places USING GIN(tags);
CREATE INDEX idx_places_location ON places USING GIN(location);

-- Create sync_status table
CREATE TABLE sync_status (
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
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON places
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_status_updated_at BEFORE UPDATE ON sync_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to sync places (handles conflicts)
CREATE OR REPLACE FUNCTION sync_places(
    p_pair_code TEXT,
    p_places JSONB[]
)
RETURNS TABLE(synced_count INTEGER, conflicts INTEGER) AS $$
DECLARE
    v_synced INTEGER := 0;
    v_conflicts INTEGER := 0;
    v_place JSONB;
BEGIN
    -- Validate pair exists and is active
    IF NOT EXISTS (SELECT 1 FROM pairs WHERE pair_code = p_pair_code AND is_active = TRUE) THEN
        RAISE EXCEPTION 'Invalid or inactive pair code';
    END IF;

    -- Process each place
    FOREACH v_place IN ARRAY p_places
    LOOP
        BEGIN
            -- Try to insert or update
            INSERT INTO places (
                id,
                pair_code,
                name,
                description,
                link,
                extracted_from,
                category,
                tags,
                added_by,
                added_at,
                location,
                memories,
                visited_at,
                rating,
                notes
            ) VALUES (
                (v_place->>'id')::UUID,
                p_pair_code,
                v_place->>'name',
                v_place->>'description',
                v_place->>'link',
                v_place->>'extractedFrom',
                (v_place->>'category')::place_category,
                ARRAY(SELECT jsonb_array_elements_text(v_place->'tags')),
                (v_place->>'addedBy')::person,
                (v_place->>'addedAt')::TIMESTAMP WITH TIME ZONE,
                v_place->'location',
                ARRAY(SELECT jsonb_array_elements(v_place->'memories')),
                (v_place->>'visitedAt')::TIMESTAMP WITH TIME ZONE,
                (v_place->>'rating')::INTEGER,
                v_place->>'notes'
            )
            ON CONFLICT (id, pair_code) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                link = EXCLUDED.link,
                extracted_from = EXCLUDED.extracted_from,
                category = EXCLUDED.category,
                tags = EXCLUDED.tags,
                added_by = EXCLUDED.added_by,
                added_at = EXCLUDED.added_at,
                location = EXCLUDED.location,
                memories = EXCLUDED.memories,
                visited_at = EXCLUDED.visited_at,
                rating = EXCLUDED.rating,
                notes = EXCLUDED.notes,
                updated_at = NOW(),
                deleted_at = NULL; -- Undelete if previously deleted
            
            v_synced := v_synced + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_conflicts := v_conflicts + 1;
            -- Log conflict but continue
            RAISE NOTICE 'Conflict syncing place %: %', v_place->>'id', SQLERRM;
        END;
    END LOOP;

    -- Update sync status
    INSERT INTO sync_status (pair_code, last_sync, pending_changes)
    VALUES (p_pair_code, NOW(), 0)
    ON CONFLICT (pair_code) DO UPDATE SET
        last_sync = NOW(),
        pending_changes = 0,
        sync_error = NULL;

    RETURN QUERY SELECT v_synced, v_conflicts;
END;
$$ LANGUAGE plpgsql;

-- Function to get pair statistics
CREATE OR REPLACE FUNCTION get_pair_stats(p_pair_code TEXT)
RETURNS TABLE(
    total_places INTEGER,
    places_by_category JSONB,
    places_by_person JSONB,
    last_sync TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER as total_places,
        jsonb_build_object(
            'want-to-try', COUNT(*) FILTER (WHERE category = 'want-to-try'),
            'been-there', COUNT(*) FILTER (WHERE category = 'been-there'),
            'favorites', COUNT(*) FILTER (WHERE category = 'favorites')
        ) as places_by_category,
        jsonb_build_object(
            'ronald', COUNT(*) FILTER (WHERE added_by = 'ronald'),
            'kerry', COUNT(*) FILTER (WHERE added_by = 'kerry')
        ) as places_by_person,
        COALESCE(
            (SELECT last_sync FROM sync_status WHERE pair_code = p_pair_code),
            NOW()
        ) as last_sync
    FROM places
    WHERE pair_code = p_pair_code
        AND deleted_at IS NULL
    GROUP BY pair_code;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete old pairs (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_pairs()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER := 0;
BEGIN
    -- Deactivate pairs older than 30 days with no activity
    UPDATE pairs
    SET is_active = FALSE
    WHERE created_at < NOW() - INTERVAL '30 days'
        AND last_sync < NOW() - INTERVAL '30 days'
        AND is_active = TRUE
    RETURNING COUNT(*) INTO v_deleted;
    
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies
ALTER TABLE pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_status ENABLE ROW LEVEL SECURITY;

-- Policies for pairs (read-only for authenticated users)
CREATE POLICY "Pairs are readable by anyone with pair code"
    ON pairs FOR SELECT
    USING (is_active = TRUE);

-- Policies for places (CRUD based on pair code)
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

-- Policies for sync_status (managed by functions)
CREATE POLICY "Sync status is readable by pair code"
    ON sync_status FOR SELECT
    USING (TRUE);

-- Insert a sample pair for testing (可選，正式使用時可刪除這段)
INSERT INTO pairs (pair_code) VALUES ('PACKET-DEMO12')
ON CONFLICT (pair_code) DO NOTHING;

-- Insert sample places for testing (可選，正式使用時可刪除這段)
INSERT INTO places (pair_code, name, description, link, category, tags, added_by) VALUES
    ('PACKET-DEMO12', 'Sample Restaurant 1', 'A great place for pizza', 'https://instagram.com/p/sample1', 'want-to-try', ARRAY['pizza', 'italian'], 'ronald'),
    ('PACKET-DEMO12', 'Sample Restaurant 2', 'Amazing sushi place', 'https://threads.net/@user/post/123', 'been-there', ARRAY['sushi', 'japanese'], 'kerry')
ON CONFLICT DO NOTHING;

-- Grant permissions to authenticated users (adjust based on your auth setup)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;