-- SnapConnect Database Setup and Testing Script
-- This will diagnose and fix user discovery/friend connection issues

-- SECTION 1: DIAGNOSTIC QUERIES
-- Run these to understand current state

SELECT '=== DATABASE DIAGNOSTICS ===' as section;

-- Check current database schema
SELECT 'Table Structure Check:' as info;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'chats', 'messages')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Check current user data
SELECT 'Current Users:' as info;
SELECT 
    COUNT(*) as total_users,
    COUNT(username) as users_with_username,
    COUNT(display_name) as users_with_display_name
FROM public.users;

-- Show sample users (if any)
SELECT 'Sample User Data:' as info;
SELECT 
    id,
    email,
    username,
    display_name,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- Check RLS policies
SELECT 'RLS Policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- SECTION 2: FIX MISSING USERNAME COLUMN (if needed)
-- Add username column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON public.users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- SECTION 3: ENSURE PROPER RLS POLICIES
-- Drop and recreate user search policies
DROP POLICY IF EXISTS "Users can view other users for chat creation" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;

-- Allow authenticated users to search for other users
CREATE POLICY "Enable read access for authenticated users" 
ON public.users FOR SELECT 
USING (auth.role() = 'authenticated');

-- SECTION 4: UPDATE EXISTING USERS WITH USERNAMES
-- Generate usernames for users who don't have them
UPDATE public.users 
SET username = LOWER(REPLACE(COALESCE(display_name, SPLIT_PART(email, '@', 1)), ' ', '_')) || '_' || RIGHT(id::text, 6)
WHERE username IS NULL;

-- SECTION 5: CREATE TEST USERS (for development)
-- Only run this if you need test users for development

-- Function to create test users safely
CREATE OR REPLACE FUNCTION create_test_users()
RETURNS void AS $$
DECLARE
    test_user_1_id UUID;
    test_user_2_id UUID;
    test_user_3_id UUID;
BEGIN
    -- Check if we already have enough users
    IF (SELECT COUNT(*) FROM public.users) >= 3 THEN
        RAISE NOTICE 'Already have enough users for testing';
        RETURN;
    END IF;

    -- Create test users in auth.users first (simulated)
    -- In real app, these would be created through signup
    
    -- Generate test user IDs
    test_user_1_id := gen_random_uuid();
    test_user_2_id := gen_random_uuid();
    test_user_3_id := gen_random_uuid();
    
    -- Insert test users into public.users
    INSERT INTO public.users (id, email, username, display_name, created_at, friends, snap_score)
    VALUES 
        (test_user_1_id, 'alice@example.com', 'alice_dev', 'Alice Johnson', NOW(), '{}', 42),
        (test_user_2_id, 'bob@example.com', 'bob_dev', 'Bob Smith', NOW(), '{}', 38),
        (test_user_3_id, 'charlie@example.com', 'charlie_dev', 'Charlie Brown', NOW(), '{}', 55)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created test users: alice_dev, bob_dev, charlie_dev';
    
END;
$$ LANGUAGE plpgsql;

-- Uncomment the next line to create test users
-- SELECT create_test_users();

-- SECTION 6: CREATE SAMPLE CHAT FOR TESTING
-- Function to create a test chat between users
CREATE OR REPLACE FUNCTION create_test_chat()
RETURNS void AS $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    new_chat_id UUID;
BEGIN
    -- Get first two users
    SELECT id INTO user1_id FROM public.users ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM public.users ORDER BY created_at LIMIT 1 OFFSET 1;
    
    IF user1_id IS NULL OR user2_id IS NULL THEN
        RAISE NOTICE 'Need at least 2 users to create test chat';
        RETURN;
    END IF;
    
    -- Create chat
    INSERT INTO public.chats (participants, created_at, last_message_at)
    VALUES (ARRAY[user1_id, user2_id], NOW(), NOW())
    RETURNING id INTO new_chat_id;
    
    -- Add test messages
    INSERT INTO public.messages (chat_id, sender_id, content, message_type, created_at)
    VALUES 
        (new_chat_id, user1_id, 'Hey! How are you doing?', 'text', NOW() - INTERVAL '2 hours'),
        (new_chat_id, user2_id, 'Great! Just testing this awesome chat app 😊', 'text', NOW() - INTERVAL '1 hour'),
        (new_chat_id, user1_id, 'Nice! The design looks really professional!', 'text', NOW());
        
    RAISE NOTICE 'Created test chat with ID: %', new_chat_id;
    
END;
$$ LANGUAGE plpgsql;

-- Uncomment the next line to create a test chat
-- SELECT create_test_chat();

-- SECTION 7: VERIFICATION QUERIES
SELECT '=== POST-SETUP VERIFICATION ===' as section;

-- Verify username column exists
SELECT 
    'Username column check:' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name = 'username' 
            AND table_schema = 'public'
        ) THEN '✅ Username column exists'
        ELSE '❌ Username column missing'
    END as status;

-- Check user counts
SELECT 
    'User counts:' as info,
    COUNT(*) as total_users,
    COUNT(username) as users_with_username,
    COUNT(display_name) as users_with_display_name
FROM public.users;

-- Show current users for testing
SELECT 'Available users for testing:' as info;
SELECT 
    username,
    display_name,
    email,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- Check RLS policies
SELECT 'RLS Policy check:' as info;
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';

-- SECTION 8: TEST THE USER SEARCH QUERY
-- This is the exact query your CreateChatModal uses
SELECT '=== TESTING USER SEARCH QUERY ===' as section;

-- Simulate the query from CreateChatModal.js
SELECT 
    'User search test:' as info,
    id, 
    email, 
    username, 
    display_name
FROM public.users
LIMIT 20;

-- Test filtering (like the app does)
SELECT 'Filtered search test (searching for "alice"):' as info;
SELECT 
    id, 
    email, 
    username, 
    display_name
FROM public.users
WHERE 
    email ILIKE '%alice%' 
    OR username ILIKE '%alice%' 
    OR display_name ILIKE '%alice%'
LIMIT 20;

-- SECTION 9: INSTRUCTIONS
SELECT '=== INSTRUCTIONS ===' as section;

SELECT 'Next steps to test your app:' as info;
SELECT '1. Run this entire script in Supabase SQL Editor' as step_1;
SELECT '2. If you need test users, uncomment and run the create_test_users() function' as step_2;
SELECT '3. If you want a test chat, uncomment and run create_test_chat() function' as step_3;
SELECT '4. Restart your Expo app with: npx expo start --clear' as step_4;
SELECT '5. Try clicking the + button in your Messages tab' as step_5;
SELECT '6. You should now see users in the search list!' as step_6; 