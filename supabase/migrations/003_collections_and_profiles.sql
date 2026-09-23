-- Migration Script for Packet Collections Feature
-- This creates the new schema for collections and user profiles

-- 1. Create User Profiles Table
CREATE TABLE IF NOT EXISTS packet_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (display_name IN ('ronald', 'kerry')),
  avatar_emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE packet_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read all profiles in their collection
CREATE POLICY "Users can view profiles in their collection"
  ON packet_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM packet_members pm
      WHERE pm.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM packet_members pm2
        WHERE pm2.user_id = packet_profiles.user_id
        AND pm2.collection_id = pm.collection_id
      )
    )
  );

-- RLS Policy: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON packet_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON packet_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- 2. Create Place Collections Table
CREATE TABLE IF NOT EXISTS packet_place_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES packet_collections(collection_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📁',
  cover_image TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, name)
);

-- Enable RLS on place collections
ALTER TABLE packet_place_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view collections in their packet_collection
CREATE POLICY "Users can view their place collections"
  ON packet_place_collections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM packet_members
      WHERE packet_members.user_id = auth.uid()
      AND packet_members.collection_id = packet_place_collections.collection_id
    )
  );

-- RLS Policy: Users can insert collections in their packet_collection
CREATE POLICY "Users can create place collections"
  ON packet_place_collections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM packet_members
      WHERE packet_members.user_id = auth.uid()
      AND packet_members.collection_id = packet_place_collections.collection_id
    )
  );

-- RLS Policy: Users can update collections in their packet_collection
CREATE POLICY "Users can update their place collections"
  ON packet_place_collections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM packet_members
      WHERE packet_members.user_id = auth.uid()
      AND packet_members.collection_id = packet_place_collections.collection_id
    )
  );

-- RLS Policy: Users can delete collections in their packet_collection
CREATE POLICY "Users can delete their place collections"
  ON packet_place_collections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM packet_members
      WHERE packet_members.user_id = auth.uid()
      AND packet_members.collection_id = packet_place_collections.collection_id
    )
  );

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_place_collections_collection_id 
  ON packet_place_collections(collection_id);

CREATE INDEX IF NOT EXISTS idx_place_collections_display_order 
  ON packet_place_collections(collection_id, display_order);

-- 4. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_packet_place_collections_updated_at
  BEFORE UPDATE ON packet_place_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Create default "全部" collection for existing users
-- This will be done via RPC function to ensure proper user context

-- 6. RPC Function: Create default collections for a user
CREATE OR REPLACE FUNCTION packet_create_default_collections(p_collection_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Create default collections
  INSERT INTO packet_place_collections (collection_id, name, emoji, display_order, created_by)
  VALUES
    (p_collection_id, '全部', '📚', 0, auth.uid()),
    (p_collection_id, '想去', '✨', 1, auth.uid()),
    (p_collection_id, '去過', '✅', 2, auth.uid()),
    (p_collection_id, '最愛', '❤️', 3, auth.uid()),
    (p_collection_id, '中菜', '🍜', 4, auth.uid()),
    (p_collection_id, '咖啡', '☕', 5, auth.uid()),
    (p_collection_id, '甜點', '🍰', 6, auth.uid())
  ON CONFLICT (collection_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC Function: Create a new place collection
CREATE OR REPLACE FUNCTION packet_create_collection(
  p_collection_id UUID,
  p_name TEXT,
  p_emoji TEXT
)
RETURNS UUID AS $$
DECLARE
  v_max_order INTEGER;
  v_new_id UUID;
BEGIN
  -- Get max display order
  SELECT COALESCE(MAX(display_order), -1) + 1
  INTO v_max_order
  FROM packet_place_collections
  WHERE collection_id = p_collection_id;

  -- Insert new collection
  INSERT INTO packet_place_collections (
    collection_id,
    name,
    emoji,
    display_order,
    created_by
  ) VALUES (
    p_collection_id,
    p_name,
    p_emoji,
    v_max_order,
    auth.uid()
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC Function: Update collection display order
CREATE OR REPLACE FUNCTION packet_reorder_collections(
  p_collection_id UUID,
  p_collection_orders JSONB
)
RETURNS VOID AS $$
DECLARE
  v_item JSONB;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_collection_orders)
  LOOP
    UPDATE packet_place_collections
    SET display_order = (v_item->>'order')::INTEGER
    WHERE id = (v_item->>'id')::UUID
    AND collection_id = p_collection_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Note: packet_records.data (Place objects) should now include:
--    - collectionIds: string[] (array of place_collection IDs)
--    - discoveredBy: 'ronald' | 'kerry'
--    - likedBy: string[] (array of user IDs or names)
--    - coverImage: string (URL)
-- These are stored in the JSONB data field, no schema change needed for packet_records

COMMENT ON TABLE packet_profiles IS 'User profiles for Ronald and Kerry';
COMMENT ON TABLE packet_place_collections IS 'Collections/folders for organizing places';
COMMENT ON FUNCTION packet_create_default_collections IS 'Creates default collections when user joins';
COMMENT ON FUNCTION packet_create_collection IS 'Creates a new place collection';
COMMENT ON FUNCTION packet_reorder_collections IS 'Reorders collections by display_order';
