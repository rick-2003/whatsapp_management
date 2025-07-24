/*
  # Create groups table for Student Community Hub

  1. New Tables
    - `groups`
      - `id` (uuid, primary key)
      - `name` (varchar, group name)
      - `description` (text, group description)
      - `category` (varchar, department category)
      - `group_type` (varchar, group or channel)
      - `join_link` (text, WhatsApp join link)
      - `image_url` (text, optional group image)
      - `member_count` (integer, member count)
      - `is_verified` (boolean, verification status)
      - `is_active` (boolean, active status)
      - `created_at` (timestamp, creation time)
      - `updated_at` (timestamp, last update time)

  2. Security
    - Enable RLS on `groups` table
    - Add policy for public read access to active groups
    - Add policy for authenticated users full access

  3. Indexes
    - Index on category for faster filtering
    - Index on is_active for faster queries

  4. Triggers
    - Auto-update updated_at timestamp on changes
*/

-- Create the groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  group_type VARCHAR(20) DEFAULT 'group' CHECK (group_type IN ('group', 'channel')),
  join_link TEXT NOT NULL,
  image_url TEXT,
  member_count INTEGER DEFAULT 0 CHECK (member_count >= 0),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_category ON groups(category);
CREATE INDEX IF NOT EXISTS idx_groups_active ON groups(is_active);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on the groups table
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active groups
DROP POLICY IF EXISTS "Public can view active groups" ON groups;
CREATE POLICY "Public can view active groups" ON groups
  FOR SELECT USING (is_active = true);

-- Allow authenticated users (admins) full access
DROP POLICY IF EXISTS "Authenticated users can do everything" ON groups;
CREATE POLICY "Authenticated users can do everything" ON groups
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO groups (name, description, category, group_type, join_link, member_count, is_verified) VALUES
('CSE Study Hub', 'A community for Computer Science students and professionals. Share knowledge, discuss algorithms, and collaborate on coding projects.', 'cse', 'group', 'https://chat.whatsapp.com/sample1', 250, true),
('IT Study Group', 'Join Information Technology students for group study sessions, resource sharing, and technical discussions.', 'it', 'group', 'https://chat.whatsapp.com/sample2', 180, true),
('ECE Network', 'Connect with Electronics & Communication students and professionals. Discuss circuits, signals, and latest tech trends.', 'ece', 'group', 'https://chat.whatsapp.com/sample3', 320, false),
('Mechanical Engineering', 'Tips, advice, and discussions for Mechanical Engineering students. Share projects and career guidance.', 'mechanical', 'group', 'https://chat.whatsapp.com/sample4', 95, false),
('Common Groups', 'General discussion group for all departments. Share experiences, events, and campus updates.', 'common', 'group', 'https://chat.whatsapp.com/sample5', 420, true)
ON CONFLICT (id) DO NOTHING;