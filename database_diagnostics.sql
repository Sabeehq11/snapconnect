-- SnapConnect Database Diagnostics
-- Run these queries in your Supabase SQL Editor to diagnose user search issues

-- 1. Check if the users table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Count total users in the database
SELECT 
    COUNT(*) as total_users,
    COUNT(display_name) as users_with_display_name,
    COUNT(username) as users_with_username
FROM public.users;

-- 3. Show sample user data (without sensitive info)
SELECT 
    id,
    email,
    username,
    display_name,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check for users without display names or usernames
SELECT 
    id,
    email,
    username,
    display_name,
    created_at
FROM public.users
WHERE display_name IS NULL OR display_name = '' OR username IS NULL OR username = ''
ORDER BY created_at DESC;

-- 5. Check auth.users vs public.users consistency
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as count
FROM public.users;

-- 6. Find auth users not in public.users
SELECT 
    au.id,
    au.email,
    au.created_at,
    au.raw_user_meta_data
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 7. Check RLS policies for users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- Migration script to fix missing user records
-- Run this if you find auth users without corresponding public.users records

INSERT INTO public.users (id, email, username, display_name, created_at, friends, snap_score)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'username' as username,
    COALESCE(au.raw_user_meta_data->>'display_name', au.email) as display_name,
    au.created_at,
    '{}' as friends,
    0 as snap_score
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Add username column if missing (run this first if needed)
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
-- CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username); 