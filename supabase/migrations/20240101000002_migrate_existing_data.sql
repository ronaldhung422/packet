-- Migration script to update existing places with new fields
-- Run this after the schema migration

-- Step 1: Get the current user's default device user (Ronald)
DO $$
DECLARE
  v_user_id uuid;
  v_collection_id uuid;
  v_all_collection_id uuid;
BEGIN
  -- Get the first user and their collection (assuming single user for migration)
  SELECT user_id, collection_id INTO v_user_id, v_collection_id
  FROM packet_members
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Skipping migration.';
    RETURN;
  END IF;

  -- Initialize default collections if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM packet_place_collections 
    WHERE collection_id = v_collection_id
  ) THEN
    PERFORM packet_init_default_collections(v_collection_id, v_user_id);
    RAISE NOTICE 'Created default collections for collection %', v_collection_id;
  END IF;

  -- Get the "All" collection ID
  SELECT id INTO v_all_collection_id
  FROM packet_place_collections
  WHERE collection_id = v_collection_id
  AND (name = '全部' OR name = 'All')
  LIMIT 1;

  -- Step 2: Update all existing places in packet_records
  -- Add discoveredBy as 'ronald' and collectionIds with 'All' collection
  UPDATE packet_records
  SET data = jsonb_set(
    jsonb_set(
      COALESCE(data, '{}'::jsonb),
      '{discoveredBy}',
      '"ronald"'
    ),
    '{collectionIds}',
    CASE 
      WHEN v_all_collection_id IS NOT NULL 
      THEN jsonb_build_array(v_all_collection_id::text)
      ELSE '[]'::jsonb
    END
  )
  WHERE collection_id = v_collection_id
  AND deleted = false
  AND (data->>'discoveredBy' IS NULL OR data->>'collectionIds' IS NULL);

  -- Step 3: Add likedBy array if not exists
  UPDATE packet_records
  SET data = jsonb_set(
    COALESCE(data, '{}'::jsonb),
    '{likedBy}',
    '[]'::jsonb
  )
  WHERE collection_id = v_collection_id
  AND deleted = false
  AND (data->>'likedBy' IS NULL);

  -- Step 4: Migrate addedBy to discoveredBy for backward compatibility
  UPDATE packet_records
  SET data = jsonb_set(
    data,
    '{discoveredBy}',
    data->'addedBy'
  )
  WHERE collection_id = v_collection_id
  AND deleted = false
  AND data->>'addedBy' IS NOT NULL
  AND data->>'discoveredBy' IS NULL;

  RAISE NOTICE 'Migration completed successfully for collection %', v_collection_id;
  RAISE NOTICE 'All collection ID: %', v_all_collection_id;
END $$;

-- Verify migration
DO $$
DECLARE
  v_total_places int;
  v_migrated_places int;
BEGIN
  SELECT COUNT(*) INTO v_total_places
  FROM packet_records
  WHERE deleted = false;

  SELECT COUNT(*) INTO v_migrated_places
  FROM packet_records
  WHERE deleted = false
  AND data->>'discoveredBy' IS NOT NULL
  AND data->>'collectionIds' IS NOT NULL
  AND data->>'likedBy' IS NOT NULL;

  RAISE NOTICE 'Total places: %', v_total_places;
  RAISE NOTICE 'Migrated places: %', v_migrated_places;
  
  IF v_total_places = v_migrated_places THEN
    RAISE NOTICE 'All places migrated successfully!';
  ELSE
    RAISE WARNING 'Some places may not have been migrated. Please check.';
  END IF;
END $$;
