-- Create profiles table for user identification
CREATE TABLE IF NOT EXISTS packet_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  avatar_emoji text,
  created_at timestamptz DEFAULT now()
);

-- Create place collections table
CREATE TABLE IF NOT EXISTS packet_place_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES packet_collections(id) ON DELETE CASCADE,
  name text NOT NULL,
  emoji text NOT NULL,
  cover_image text,
  display_order int DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE packet_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE packet_place_collections ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view profiles in their collection"
  ON packet_profiles FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM packet_members 
      WHERE collection_id IN (
        SELECT collection_id FROM packet_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own profile"
  ON packet_profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON packet_profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Policies for place collections
CREATE POLICY "Users can view collections in their packet"
  ON packet_place_collections FOR SELECT
  USING (
    collection_id IN (
      SELECT collection_id FROM packet_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create collections in their packet"
  ON packet_place_collections FOR INSERT
  WITH CHECK (
    collection_id IN (
      SELECT collection_id FROM packet_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update collections in their packet"
  ON packet_place_collections FOR UPDATE
  USING (
    collection_id IN (
      SELECT collection_id FROM packet_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete collections in their packet"
  ON packet_place_collections FOR DELETE
  USING (
    collection_id IN (
      SELECT collection_id FROM packet_members WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_place_collections_collection_id ON packet_place_collections(collection_id);
CREATE INDEX idx_place_collections_created_by ON packet_place_collections(created_by);
CREATE INDEX idx_profiles_user_id ON packet_profiles(user_id);

-- RPC function to initialize default collections for new packets
CREATE OR REPLACE FUNCTION packet_init_default_collections(p_collection_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default collections
  INSERT INTO packet_place_collections (collection_id, name, emoji, created_by, display_order)
  VALUES
    (p_collection_id, '全部', '📁', p_user_id, 0),
    (p_collection_id, '想去試試', '🤔', p_user_id, 1),
    (p_collection_id, '去過了', '✅', p_user_id, 2),
    (p_collection_id, '最愛', '⭐', p_user_id, 3),
    (p_collection_id, '香港美食', '🇭🇰', p_user_id, 4),
    (p_collection_id, '咖啡館', '☕', p_user_id, 5),
    (p_collection_id, '甜品店', '🍰', p_user_id, 6);
END;
$$;

-- Trigger to auto-create default collections when a new packet is created
CREATE OR REPLACE FUNCTION trigger_create_default_collections()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create default collections for the creator
  PERFORM packet_init_default_collections(NEW.id, NEW.created_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_packet_collection_created
  AFTER INSERT ON packet_collections
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_default_collections();
