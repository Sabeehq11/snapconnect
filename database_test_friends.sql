-- Test script to verify friends system is working
-- Run this in your Supabase SQL Editor to diagnose the friends system

-- 1. Check if tables exist
SELECT 'Checking tables...' as test_step;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('friend_requests', 'friendships', 'users');

-- 2. Check if functions exist
SELECT 'Checking functions...' as test_step;
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_friends', 'send_friend_request', 'respond_to_friend_request', 'get_pending_friend_requests');

-- 3. Check current user
SELECT 'Current user:' as test_step, auth.uid() as user_id;

-- 4. Check user's friendships
SELECT 'User friendships:' as test_step;
SELECT * FROM friendships WHERE user1_id = auth.uid() OR user2_id = auth.uid();

-- 5. Test get_user_friends function
SELECT 'Testing get_user_friends function:' as test_step;
SELECT * FROM get_user_friends();

-- 6. Count friends
SELECT 'Friend count:' as test_step, COUNT(*) as friend_count
FROM get_user_friends();

-- 7. Check friend requests
SELECT 'Friend requests received:' as test_step;
SELECT * FROM friend_requests WHERE receiver_id = auth.uid() AND status = 'pending';

SELECT 'Friend requests sent:' as test_step;
SELECT * FROM friend_requests WHERE sender_id = auth.uid() AND status = 'pending';

-- 8. Check RLS policies
SELECT 'RLS policies:' as test_step;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('friendships', 'friend_requests');

-- If you get no results from get_user_friends(), it means:
-- 1. No friendships exist for your user, OR
-- 2. The function has an issue, OR  
-- 3. RLS is blocking the results

-- To create a test friendship manually (replace with actual user IDs):
-- INSERT INTO friendships (user1_id, user2_id) 
-- VALUES (
--   LEAST(auth.uid(), 'other-user-id-here'),
--   GREATEST(auth.uid(), 'other-user-id-here')
-- ); 