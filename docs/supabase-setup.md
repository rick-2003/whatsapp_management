# Supabase Database Setup

This guide will help you set up the Supabase database for the FUTURE MINDS Groups Management System.

## 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your project URL and anon key

## 2. Create the Groups Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('education', 'technology', 'business', 'entertainment', 'health', 'sports', 'other')),
  group_type VARCHAR(20) DEFAULT 'group' CHECK (group_type IN ('group', 'channel')),
  join_link TEXT NOT NULL,
  image_url TEXT,
  member_count INTEGER DEFAULT 0 CHECK (member_count >= 0),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on category for faster filtering
CREATE INDEX idx_groups_category ON groups(category);

-- Create an index on is_active for faster queries
CREATE INDEX idx_groups_active ON groups(is_active);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## 3. Set up Row Level Security (RLS)

```sql
-- Enable RLS on the groups table
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active groups
CREATE POLICY "Public can view active groups" ON groups
  FOR SELECT USING (is_active = true);

-- Allow authenticated users (admins) full access
CREATE POLICY "Authenticated users can do everything" ON groups
  FOR ALL USING (auth.role() = 'authenticated');
```

## 4. Create Admin User

1. Go to Authentication > Users in your Supabase dashboard
2. Create a new user with admin credentials
3. Note down the email and password for admin login

## 5. Insert Sample Data (Optional)

```sql
-- Insert some sample groups
INSERT INTO groups (name, description, category, group_type, join_link, member_count, is_verified) VALUES
('Future Minds Tech Hub', 'A community for technology enthusiasts, developers, and innovators. Share knowledge, discuss latest trends, and collaborate on projects.', 'technology', 'group', 'https://chat.whatsapp.com/sample1', 250, true),
('Study Together', 'Join students from around the world for group study sessions, resource sharing, and academic support.', 'education', 'group', 'https://chat.whatsapp.com/sample2', 180, true),
('Business Network', 'Connect with entrepreneurs, business owners, and professionals. Share opportunities and grow your network.', 'business', 'group', 'https://chat.whatsapp.com/sample3', 320, false),
('Health & Wellness', 'Tips, advice, and support for maintaining a healthy lifestyle. Share recipes, workouts, and motivation.', 'health', 'group', 'https://chat.whatsapp.com/sample4', 95, false),
('Entertainment Central', 'Discuss movies, music, books, games, and all things entertainment. Share recommendations and reviews.', 'entertainment', 'group', 'https://chat.whatsapp.com/sample5', 420, true);
```

## 6. Environment Variables

Add these to your `.env` file:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes

- The anon key is safe to use in frontend applications
- RLS policies ensure data security
- Only authenticated users can manage groups
- All user data is protected by Supabase's security features
