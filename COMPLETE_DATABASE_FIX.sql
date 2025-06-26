-- SnapConnect Complete Database Fix
-- Run this entire script in your Supabase SQL Editor to fix all issues

-- =====================================================
-- SECTION 1: DROP EXISTING CONSTRAINTS (Clean Start)
-- =====================================================

-- Drop existing foreign key constraints if they exist
ALTER TABLE IF EXISTS public.messages DROP CONSTRAINT IF EXISTS fk_messages_sender;
ALTER TABLE IF EXISTS public.messages DROP CONSTRAINT IF EXISTS fk_messages_chat;
ALTER TABLE IF EXISTS public.chats DROP CONSTRAINT IF EXISTS fk_chats_last_message;

-- =====================================================
-- SECTION 2: ENSURE ALL TABLES EXIST WITH CORRECT STRUCTURE
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    photo_url TEXT,
    snap_score INTEGER DEFAULT 0,
    friends UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participants UUID[] NOT NULL,
    last_message_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    disappear_after_seconds INTEGER DEFAULT 10,
    view_count INTEGER DEFAULT 0,
    viewed_by JSONB DEFAULT '[]',
    is_disappeared BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add username column if missing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- =====================================================
-- SECTION 3: CREATE PROPER FOREIGN KEY RELATIONSHIPS
-- =====================================================

-- Messages -> Users (sender_id)
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_sender 
FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Messages -> Chats (chat_id)
ALTER TABLE public.messages 
ADD CONSTRAINT fk_messages_chat 
FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;

-- Chats -> Messages (last_message_id) - Optional
ALTER TABLE public.chats 
ADD CONSTRAINT fk_chats_last_message 
FOREIGN KEY (last_message_id) REFERENCES public.messages(id) ON DELETE SET NULL;

-- =====================================================
-- SECTION 4: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_display_name ON public.users(display_name);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats USING GIN(participants);

-- =====================================================
-- SECTION 5: FIX RLS POLICIES
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for chat participants" ON public.chats;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.chats;
DROP POLICY IF EXISTS "Enable update for chat participants" ON public.chats;
DROP POLICY IF EXISTS "Enable read access for message participants" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for chat participants" ON public.messages;
DROP POLICY IF EXISTS "Enable update for message sender" ON public.messages;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Enable read access for authenticated users" 
ON public.users FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- Chats policies
CREATE POLICY "Enable read access for chat participants" 
ON public.chats FOR SELECT 
USING (auth.uid() = ANY(participants));

CREATE POLICY "Enable insert for authenticated users" 
ON public.chats FOR INSERT 
WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Enable update for chat participants" 
ON public.chats FOR UPDATE 
USING (auth.uid() = ANY(participants));

-- Messages policies
CREATE POLICY "Enable read access for message participants" 
ON public.messages FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.chats 
        WHERE chats.id = messages.chat_id 
        AND auth.uid() = ANY(chats.participants)
    )
);

CREATE POLICY "Enable insert for chat participants" 
ON public.messages FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chats 
        WHERE chats.id = messages.chat_id 
        AND auth.uid() = ANY(chats.participants)
    )
);

CREATE POLICY "Enable update for message sender" 
ON public.messages FOR UPDATE 
USING (auth.uid() = sender_id);

-- Allow users to delete their own messages
CREATE POLICY "Enable delete for message sender" 
ON public.messages FOR DELETE 
USING (auth.uid() = sender_id);

-- =====================================================
-- SECTION 6: UPDATE EXISTING DATA
-- =====================================================

-- Generate usernames for users who don't have them
UPDATE public.users 
SET username = LOWER(REPLACE(COALESCE(display_name, SPLIT_PART(email, '@', 1)), ' ', '_')) || '_' || RIGHT(id::text, 6)
WHERE username IS NULL OR username = '';

-- =====================================================
-- SECTION 7: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SECTION 8: VERIFICATION QUERIES
-- =====================================================

-- Check that foreign keys were created
SELECT 
    'Foreign Key Constraints:' as info,
    COUNT(*) as constraint_count
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
AND table_name IN ('messages', 'chats');

-- Check users
SELECT 
    'Users Status:' as info,
    COUNT(*) as total_users,
    COUNT(username) as users_with_username
FROM public.users;

-- Check RLS policies
SELECT 
    'RLS Policies:' as info,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'chats', 'messages')
GROUP BY tablename
ORDER BY tablename;

-- Display current users for testing
SELECT 'Current Users for Testing:' as section;
SELECT 
    id, 
    email, 
    username, 
    display_name,
    created_at
FROM public.users
ORDER BY created_at DESC;

-- Success message
SELECT '✅ DATABASE SETUP COMPLETE!' as status;
SELECT 'You can now restart your app: npx expo start --clear' as next_step;
SELECT 'The foreign key errors should be resolved!' as final_note; 