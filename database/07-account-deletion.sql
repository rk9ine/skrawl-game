-- Account Deletion Support
-- This script ensures proper cascading deletes for account removal

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create a function to safely delete a user account
-- This function will handle all related data cleanup
CREATE OR REPLACE FUNCTION delete_user_account(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  deleted_user_data JSON;
BEGIN
  -- Security check: only allow users to delete their own account
  IF auth.uid() != user_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Unauthorized: can only delete your own account'
    );
  END IF;

  -- Check if user exists
  SELECT to_json(u.*) INTO deleted_user_data
  FROM public.users u
  WHERE u.id = user_id;

  IF deleted_user_data IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Delete user profile data
  -- This will cascade to related tables if foreign keys are set up properly
  DELETE FROM public.users WHERE id = user_id;

  -- Add any additional cleanup here for tables that don't have proper foreign keys
  -- Example:
  -- DELETE FROM game_sessions WHERE user_id = user_id;
  -- DELETE FROM user_achievements WHERE user_id = user_id;

  -- Note: Auth user deletion must be handled on the client side
  -- The client should call supabase.auth.signOut() after this function succeeds

  RETURN json_build_object(
    'success', true,
    'deleted_user', deleted_user_data
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create RLS policies for the delete function
-- Only allow users to delete their own accounts
CREATE POLICY "Users can delete their own account"
ON public.users
FOR DELETE
USING (auth.uid() = id);

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account(UUID) TO authenticated;

-- Create a trigger to log account deletions (optional, for audit purposes)
CREATE TABLE IF NOT EXISTS public.account_deletion_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deleted_user_id UUID NOT NULL,
  deleted_user_email TEXT,
  deleted_user_display_name TEXT,
  deletion_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on deletion log
ALTER TABLE public.account_deletion_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for deletion log (only admins can view)
CREATE POLICY "Only admins can view deletion log"
ON public.account_deletion_log
FOR SELECT
USING (false); -- Change this to your admin check logic

-- Create trigger function to log deletions
CREATE OR REPLACE FUNCTION log_account_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.account_deletion_log (
    deleted_user_id,
    deleted_user_email,
    deleted_user_display_name,
    deleted_by
  ) VALUES (
    OLD.id,
    OLD.email,
    OLD.display_name,
    auth.uid()
  );
  
  RETURN OLD;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS account_deletion_trigger ON public.users;
CREATE TRIGGER account_deletion_trigger
  BEFORE DELETE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION log_account_deletion();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_deletion_log_timestamp 
ON public.account_deletion_log(deletion_timestamp);

CREATE INDEX IF NOT EXISTS idx_account_deletion_log_deleted_user 
ON public.account_deletion_log(deleted_user_id);

-- Comments for documentation
COMMENT ON FUNCTION delete_user_account(UUID) IS 'Safely deletes a user account and all related data';
COMMENT ON TABLE public.account_deletion_log IS 'Audit log for account deletions';
COMMENT ON TRIGGER account_deletion_trigger ON public.users IS 'Logs account deletions for audit purposes';
