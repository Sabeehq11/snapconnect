-- SnapConnect Group Chat Schema Update
-- Run this in your Supabase SQL Editor to add group chat functionality

-- Add group chat columns to existing chats table
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS group_name TEXT,
ADD COLUMN IF NOT EXISTS is_group_chat BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS group_description TEXT,
ADD COLUMN IF NOT EXISTS group_avatar_url TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_is_group_chat ON public.chats(is_group_chat);
CREATE INDEX IF NOT EXISTS idx_chats_created_by ON public.chats(created_by);
CREATE INDEX IF NOT EXISTS idx_chats_group_name ON public.chats(group_name);

-- Update RLS policies to handle group chats
-- The existing policies should work for group chats since they use the participants array

-- Add a helper function to get chat display name
CREATE OR REPLACE FUNCTION get_chat_display_name(
    chat_participants UUID[],
    current_user_id UUID,
    group_name TEXT DEFAULT NULL,
    is_group BOOLEAN DEFAULT false
)
RETURNS TEXT AS $$
DECLARE
    other_user_id UUID;
    other_user_name TEXT;
BEGIN
    -- If it's a group chat, return the group name
    IF is_group AND group_name IS NOT NULL THEN
        RETURN group_name;
    END IF;
    
    -- For direct messages, find the other participant
    SELECT unnest(chat_participants) INTO other_user_id 
    WHERE unnest(chat_participants) != current_user_id 
    LIMIT 1;
    
    -- Get the other user's display name
    SELECT COALESCE(display_name, username, email) 
    INTO other_user_name 
    FROM public.users 
    WHERE id = other_user_id;
    
    RETURN COALESCE(other_user_name, 'Unknown User');
END;
$$ LANGUAGE plpgsql;

-- Add a function to get group chat participants info
CREATE OR REPLACE FUNCTION get_chat_participants_info(chat_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', u.id,
            'display_name', u.display_name,
            'username', u.username,
            'email', u.email,
            'photo_url', u.photo_url
        )
    )
    INTO result
    FROM public.chats c
    JOIN public.users u ON u.id = ANY(c.participants)
    WHERE c.id = chat_id;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create a view for easier chat querying
CREATE OR REPLACE VIEW chat_list_view AS
SELECT 
    c.*,
    get_chat_display_name(c.participants, auth.uid(), c.group_name, c.is_group_chat) as display_name,
    get_chat_participants_info(c.id) as participants_info,
    (
        SELECT jsonb_build_object(
            'content', m.content,
            'created_at', m.created_at,
            'sender_id', m.sender_id,
            'message_type', m.message_type,
            'sender_name', u.display_name
        )
        FROM public.messages m
        JOIN public.users u ON m.sender_id = u.id
        WHERE m.chat_id = c.id
        AND NOT m.is_disappeared
        ORDER BY m.created_at DESC
        LIMIT 1
    ) as last_message
FROM public.chats c
WHERE auth.uid() = ANY(c.participants)
ORDER BY c.last_message_at DESC;

-- Grant access to the view
GRANT SELECT ON chat_list_view TO authenticated;

-- Create RLS policy for the view
ALTER VIEW chat_list_view SET (security_barrier = true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Group chat schema update completed successfully!';
    RAISE NOTICE 'New features added:';
    RAISE NOTICE '1. Group chat names and descriptions';
    RAISE NOTICE '2. Group creation tracking';
    RAISE NOTICE '3. Helper functions for chat display';
    RAISE NOTICE '4. Optimized chat list view';
END
$$; 