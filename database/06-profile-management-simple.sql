-- Profile Management System for Username Change Limitations
-- Execute these commands one by one in Supabase SQL Editor

-- Step 1: Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username_changes_remaining INTEGER DEFAULT 1;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username_change_history JSONB DEFAULT '[]';

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_username_change TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name_locked BOOLEAN DEFAULT FALSE;

-- Step 2: Create unique index for usernames (case-insensitive)
DROP INDEX IF EXISTS idx_users_display_name_unique;
CREATE UNIQUE INDEX idx_users_display_name_unique 
ON public.users (LOWER(display_name)) 
WHERE display_name IS NOT NULL;

-- Step 3: Create username validation function
CREATE OR REPLACE FUNCTION validate_username_change(
  user_id UUID,
  new_display_name TEXT
) RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  name_exists BOOLEAN;
BEGIN
  -- Get current user data
  SELECT 
    id,
    display_name,
    username_changes_remaining,
    display_name_locked
  INTO user_record
  FROM public.users 
  WHERE id = user_id;
  
  -- Check if user exists
  IF user_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'User not found'
    );
  END IF;
  
  -- Check if display name is locked
  IF user_record.display_name_locked = true THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Username is permanently locked'
    );
  END IF;
  
  -- Check if user has changes remaining
  IF user_record.username_changes_remaining <= 0 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'No username changes remaining'
    );
  END IF;
  
  -- Validate username format (3-20 chars, alphanumeric + underscore/dash)
  IF LENGTH(new_display_name) < 3 OR LENGTH(new_display_name) > 20 THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Username must be between 3 and 20 characters'
    );
  END IF;
  
  IF new_display_name !~ '^[a-zA-Z0-9_-]+$' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Username can only contain letters, numbers, underscores, and dashes'
    );
  END IF;
  
  -- Check if username already exists (case-insensitive)
  SELECT EXISTS(
    SELECT 1 FROM public.users 
    WHERE LOWER(display_name) = LOWER(new_display_name) 
    AND id != user_id
  ) INTO name_exists;
  
  IF name_exists THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Username is already taken'
    );
  END IF;
  
  -- All validations passed
  RETURN jsonb_build_object(
    'valid', true,
    'changes_remaining', user_record.username_changes_remaining
  );
END;
$$;

-- Step 4: Create username change function
CREATE OR REPLACE FUNCTION change_username(
  user_id UUID,
  new_display_name TEXT
) RETURNS JSONB 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  validation_result JSONB;
  old_name TEXT;
  new_history JSONB;
BEGIN
  -- Validate the change first
  SELECT validate_username_change(user_id, new_display_name) INTO validation_result;
  
  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RETURN validation_result;
  END IF;
  
  -- Get current user data
  SELECT 
    display_name,
    username_change_history,
    username_changes_remaining,
    has_completed_profile_setup
  INTO user_record 
  FROM public.users 
  WHERE id = user_id;
  
  old_name := user_record.display_name;
  
  -- Build new history entry
  new_history := COALESCE(user_record.username_change_history, '[]'::jsonb) || 
    jsonb_build_object(
      'old_name', old_name,
      'new_name', new_display_name,
      'changed_at', NOW(),
      'reason', CASE 
        WHEN user_record.has_completed_profile_setup THEN 'user_request'
        ELSE 'initial_setup'
      END
    );
  
  -- Update user record
  UPDATE public.users SET
    display_name = new_display_name,
    username_changes_remaining = GREATEST(0, username_changes_remaining - 1),
    username_change_history = new_history,
    last_username_change = NOW(),
    display_name_locked = CASE 
      WHEN username_changes_remaining - 1 <= 0 THEN true 
      ELSE false 
    END,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'old_name', old_name,
    'new_name', new_display_name,
    'changes_remaining', GREATEST(0, user_record.username_changes_remaining - 1),
    'locked', CASE WHEN user_record.username_changes_remaining - 1 <= 0 THEN true ELSE false END
  );
END;
$$;

-- Step 5: Grant permissions
GRANT EXECUTE ON FUNCTION validate_username_change(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION change_username(UUID, TEXT) TO authenticated;

-- Step 6: Create view for easy profile status checking
CREATE OR REPLACE VIEW user_profile_status AS
SELECT 
  id,
  display_name,
  username_changes_remaining,
  display_name_locked,
  last_username_change,
  CASE 
    WHEN username_changes_remaining > 0 AND NOT COALESCE(display_name_locked, false) THEN 'can_change'
    WHEN COALESCE(display_name_locked, false) THEN 'locked'
    ELSE 'no_changes_remaining'
  END as change_status,
  jsonb_array_length(COALESCE(username_change_history, '[]'::jsonb)) as total_changes_made
FROM public.users;

-- Grant access to the view
GRANT SELECT ON user_profile_status TO authenticated;

-- Step 7: Update existing users to have default values
UPDATE public.users 
SET 
  username_changes_remaining = COALESCE(username_changes_remaining, 1),
  username_change_history = COALESCE(username_change_history, '[]'::jsonb),
  display_name_locked = COALESCE(display_name_locked, false)
WHERE username_changes_remaining IS NULL 
   OR username_change_history IS NULL 
   OR display_name_locked IS NULL;
