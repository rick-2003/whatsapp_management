-- Fix RLS Policies for Groups Table
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'groups';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can do everything" ON groups;

-- Create new, more permissive policies for testing
-- Allow anyone to read active groups (no authentication required)
CREATE POLICY "Allow public read active groups" ON groups
    FOR SELECT 
    USING (is_active = true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated full access" ON groups
    FOR ALL 
    USING (auth.uid() IS NOT NULL);

-- Alternative: If the above doesn't work, temporarily disable RLS for testing
-- WARNING: This makes the table publicly accessible - only for debugging!
-- ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- To re-enable RLS later:
-- ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'groups';

-- Test query to see what data is visible
SELECT id, name, is_active, created_at 
FROM groups 
ORDER BY created_at DESC 
LIMIT 5;
