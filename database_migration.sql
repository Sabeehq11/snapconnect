-- SnapConnect Database Migration - Fix User Search
-- Run this in your Supabase SQL Editor to fix the "username does not exist" error

-- Step 1: Add username column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Step 2: Create index for faster username searches
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Step 3: Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, username, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', NULL),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Step 4: Enable RLS policies for username searches
-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Users can view other users for chat creation" ON public.users;

CREATE POLICY "Users can view other users for chat creation" 
ON public.users FOR SELECT 
USING (true);  -- Allow authenticated users to search for other users

-- Step 5: Update existing users without usernames (optional)
-- This sets username to a default format for existing users
UPDATE public.users 
SET username = LOWER(REPLACE(display_name, ' ', '_')) || '_' || RIGHT(id::text, 6)
WHERE username IS NULL AND display_name IS NOT NULL;

-- For users without display_name, use email prefix
UPDATE public.users 
SET username = SPLIT_PART(email, '@', 1) || '_' || RIGHT(id::text, 6)
WHERE username IS NULL;

-- Step 6: Verify the changes
SELECT 
    'Migration completed successfully!' as status,
    COUNT(*) as total_users,
    COUNT(username) as users_with_username,
    COUNT(display_name) as users_with_display_name
FROM public.users;

-- Step 7: Show sample user data to verify
SELECT 
    id,
    email,
    username,
    display_name,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5; 