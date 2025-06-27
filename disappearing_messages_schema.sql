-- =====================================================
-- DISAPPEARING MESSAGES FEATURE - DATABASE SCHEMA
-- =====================================================

-- Add disappearing_setting to chats table to store per-chat settings
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS disappearing_setting TEXT DEFAULT 'none' 
CHECK (disappearing_setting IN ('none', 'after_viewing', '24_hours'));

-- Update existing chats to have the default setting
UPDATE public.chats 
SET disappearing_setting = 'none' 
WHERE disappearing_setting IS NULL;

-- Add created_at index for efficient 24-hour cleanup
CREATE INDEX IF NOT EXISTS idx_messages_created_at_24h ON public.messages(created_at) 
WHERE disappear_after_seconds IS NOT NULL;

-- Drop existing function if it exists (to handle return type changes)
DROP FUNCTION IF EXISTS cleanup_expired_messages();

-- Add function to clean up 24-hour expired messages
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Mark messages as disappeared if they're older than 24 hours
    -- and belong to chats with 24_hours setting
    UPDATE public.messages 
    SET is_disappeared = true
    WHERE is_disappeared = false
    AND created_at < NOW() - INTERVAL '24 hours'
    AND chat_id IN (
        SELECT id FROM public.chats 
        WHERE disappearing_setting = '24_hours'
    );
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled cleanup function (to be called by cron or app logic)
COMMENT ON FUNCTION cleanup_expired_messages() IS 'Cleans up messages that have expired after 24 hours for chats with 24_hours disappearing setting';

-- Add RLS policy for chat settings
CREATE POLICY "Enable update for chat participants - disappearing setting" 
ON public.chats FOR UPDATE 
USING (auth.uid() = ANY(participants))
WITH CHECK (auth.uid() = ANY(participants));

-- Success message
SELECT 'Disappearing messages schema created successfully!' as status; 