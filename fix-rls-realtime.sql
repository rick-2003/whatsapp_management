-- Fix RLS policies to ensure real-time subscriptions work properly for authenticated users
-- This script ensures that authenticated admin users can receive real-time updates

-- First, disable RLS temporarily to check current policies
-- ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON groups;

-- Re-enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create new policies that support real-time subscriptions
-- Allow public read access to active groups
CREATE POLICY "Public can view active groups" ON groups
  FOR SELECT USING (is_active = true);

-- Allow authenticated users full access for all operations
CREATE POLICY "Authenticated users full access" ON groups
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure real-time is enabled for the groups table
-- (This is usually enabled by default, but let's be explicit)
ALTER PUBLICATION supabase_realtime ADD TABLE groups;

-- Grant necessary permissions for real-time
GRANT SELECT, INSERT, UPDATE, DELETE ON groups TO authenticated;
GRANT SELECT ON groups TO anon;

-- Optional: Create a function to broadcast custom events
CREATE OR REPLACE FUNCTION notify_group_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- This function can be used to send custom notifications
  -- Currently, we rely on Supabase's built-in real-time
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Optional: Create triggers for custom notifications (commented out for now)
-- CREATE TRIGGER notify_group_insert
--   AFTER INSERT ON groups
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_group_changes();

-- CREATE TRIGGER notify_group_update
--   AFTER UPDATE ON groups
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_group_changes();

-- CREATE TRIGGER notify_group_delete
--   AFTER DELETE ON groups
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_group_changes();
