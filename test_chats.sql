-- SnapConnect Chat Testing Script
-- Run this in your Supabase SQL Editor to test chat functionality

-- 1. First, let's check the current state of our tables
SELECT 'Users count:' as info, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Chats count:' as info, COUNT(*) as count FROM public.chats  
UNION ALL
SELECT 'Messages count:' as info, COUNT(*) as count FROM public.messages;

-- 2. Show all users (for reference)
SELECT 
    id,
    email,
    display_name,
    username,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- 3. Show existing chats (if any)
SELECT 
    id,
    participants,
    created_at,
    last_message_at
FROM public.chats
ORDER BY created_at DESC;

-- 4. Show existing messages (if any)
SELECT 
    id,
    chat_id,
    sender_id,
    content,
    message_type,
    created_at
FROM public.messages
ORDER BY created_at DESC;

-- 5. Create sample data for testing (only if you don't have real data)
-- WARNING: Only run this section if you want to create test data!

-- First, let's make sure we have at least 2 users for testing
-- You might want to replace these with actual user IDs from your auth.users table

-- Get the first two user IDs (modify as needed)
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    chat_id UUID;
BEGIN
    -- Get first two users
    SELECT id INTO user1_id FROM public.users ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM public.users ORDER BY created_at LIMIT 1 OFFSET 1;
    
    -- Only proceed if we have at least 2 users
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL AND user1_id != user2_id THEN
        -- Create a test chat between these users
        INSERT INTO public.chats (participants)
        VALUES (ARRAY[user1_id, user2_id])
        RETURNING id INTO chat_id;
        
        -- Add some test messages
        INSERT INTO public.messages (chat_id, sender_id, content, message_type)
        VALUES 
            (chat_id, user1_id, 'Hello! This is a test message.', 'text'),
            (chat_id, user2_id, 'Hi there! Testing the chat functionality.', 'text'),
            (chat_id, user1_id, 'Great! The chat seems to be working.', 'text');
            
        -- Update the chat's last_message_at
        UPDATE public.chats 
        SET last_message_at = NOW() 
        WHERE id = chat_id;
        
        RAISE NOTICE 'Created test chat with ID: %', chat_id;
    ELSE
        RAISE NOTICE 'Need at least 2 users to create test chat. Current users: %', (SELECT COUNT(*) FROM public.users);
    END IF;
END $$;

-- 6. Verify the test data was created
SELECT 'After test data creation:' as status;

SELECT 
    c.id as chat_id,
    c.participants,
    c.last_message_at,
    COUNT(m.id) as message_count
FROM public.chats c
LEFT JOIN public.messages m ON c.id = m.chat_id
GROUP BY c.id, c.participants, c.last_message_at
ORDER BY c.last_message_at DESC;

-- 7. Test the query that your app will use
-- This simulates what your useChats hook will do
SELECT 
    c.*,
    (
        SELECT row_to_json(last_msg)
        FROM (
            SELECT 
                m.content,
                m.created_at,
                m.sender_id,
                u.display_name as sender_name,
                u.email as sender_email
            FROM public.messages m
            JOIN public.users u ON m.sender_id = u.id
            WHERE m.chat_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
        ) last_msg
    ) as last_message
FROM public.chats c
ORDER BY c.last_message_at DESC; 