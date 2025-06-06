-- Profile Management System for Username Change Limitations
-- Add columns to existing users table for username change tracking

-- Step 1: Add username change tracking columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username_changes_remaining INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS username_change_history JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS last_username_change TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS display_name_locked BOOLEAN DEFAULT FALSE;

-- Step 2: Create index for username uniqueness checks (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_display_name_unique
ON public.users (LOWER(display_name))
WHERE display_name IS NOT NULL;

-- Step 3: Create function to validate username changes
CREATE OR REPLACE FUNCTION validate_username_change(
  user_id UUID,
  new_display_name TEXT
) RETURNS JSONB AS $$
DECLARE
  current_user_record RECORD;
  validation_result JSONB;
  name_exists BOOLEAN;
BEGIN
  -- Get current user data
  SELECT
    id,
    display_name,
    username_changes_remaining,
    display_name_locked
  INTO current_user_record
  FROM public.users
  WHERE id = user_id;

  -- Check if user exists
  IF current_user_record IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if display name is locked
  IF current_user_record.display_name_locked THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Username is permanently locked'
    );
  END IF;
  
  -- Check if user has changes remaining
  IF current_user_record.username_changes_remaining <= 0 THEN
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
    'changes_remaining', current_user_record.username_changes_remaining
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create function to perform username change
CREATE OR REPLACE FUNCTION change_username(
  user_id UUID,
  new_display_name TEXT
) RETURNS JSONB AS $$
DECLARE
  current_user_record RECORD;
  validation_result JSONB;
  old_name TEXT;
  change_history JSONB;
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
  INTO current_user_record
  FROM public.users
  WHERE id = user_id;

  old_name := current_user_record.display_name;
  
  -- Build new history entry
  change_history := current_user_record.username_change_history || jsonb_build_object(
    'old_name', old_name,
    'new_name', new_display_name,
    'changed_at', NOW(),
    'reason', CASE
      WHEN current_user_record.has_completed_profile_setup THEN 'user_request'
      ELSE 'initial_setup'
    END
  );
  
  -- Update user record
  UPDATE public.users SET
    display_name = new_display_name,
    username_changes_remaining = GREATEST(0, username_changes_remaining - 1),
    username_change_history = change_history,
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
    'changes_remaining', GREATEST(0, current_user_record.username_changes_remaining - 1),
    'locked', CASE WHEN current_user_record.username_changes_remaining - 1 <= 0 THEN true ELSE false END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for username change functions
CREATE POLICY "Users can validate their own username changes" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION validate_username_change(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION change_username(UUID, TEXT) TO authenticated;

-- Create view for username change status (for easy querying)
CREATE OR REPLACE VIEW user_profile_status AS
SELECT 
  id,
  display_name,
  username_changes_remaining,
  display_name_locked,
  last_username_change,
  CASE 
    WHEN username_changes_remaining > 0 AND NOT display_name_locked THEN 'can_change'
    WHEN display_name_locked THEN 'locked'
    ELSE 'no_changes_remaining'
  END as change_status,
  jsonb_array_length(username_change_history) as total_changes_made
FROM public.users;

-- Grant access to the view
GRANT SELECT ON user_profile_status TO authenticated;
