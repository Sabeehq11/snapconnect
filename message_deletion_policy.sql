-- Add DELETE policy for messages
-- This allows users to delete only their own messages

-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Enable delete for message sender" ON public.messages;

-- Create new DELETE policy
CREATE POLICY "Enable delete for message sender" 
ON public.messages FOR DELETE 
USING (auth.uid() = sender_id);

-- Verify the policy was created
SELECT 
    'Message Delete Policy Status:' as info,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'messages'
AND cmd = 'DELETE';

-- Success message
SELECT '✅ DELETE POLICY ADDED!' as status;
SELECT 'Users can now delete their own messages by long-pressing them in chat.' as instructions; 