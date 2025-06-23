-- SnapConnect Database Setup Script
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT UNIQUE,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    friends UUID[] DEFAULT '{}',
    snap_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    participants UUID[] NOT NULL,
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table with disappearing functionality
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'video'
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_by UUID[] DEFAULT '{}',
    -- Disappearing message fields
    view_count INTEGER DEFAULT 0,
    max_views INTEGER DEFAULT 1, -- How many times it can be viewed before disappearing
    viewed_by JSONB DEFAULT '[]', -- Array of objects with user_id and viewed_at timestamp
    is_disappeared BOOLEAN DEFAULT FALSE,
    disappear_after_seconds INTEGER DEFAULT 10, -- Auto-disappear after X seconds of first view
    expires_at TIMESTAMP WITH TIME ZONE -- When the message should disappear
);

-- Create stories table
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL, -- 'image', 'video'
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    views UUID[] DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can read user profiles" ON public.users;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.users;

DROP POLICY IF EXISTS "Users can read chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;

DROP POLICY IF EXISTS "Users can read messages from their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can update messages in their chats" ON public.messages;

DROP POLICY IF EXISTS "Anyone can read non-expired stories" ON public.stories;
DROP POLICY IF EXISTS "Users can create their own stories" ON public.stories;
DROP POLICY IF EXISTS "Users can delete their own stories" ON public.stories;

-- Create policies for users table
CREATE POLICY "Users can read their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can read user profiles" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for chats table
CREATE POLICY "Users can read chats they participate in" ON public.chats
    FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Users can create chats" ON public.chats
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Create policies for messages table
CREATE POLICY "Users can read messages from their chats" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE id = messages.chat_id 
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Users can send messages to their chats" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE id = messages.chat_id 
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Users can update messages in their chats" ON public.messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.chats 
            WHERE id = messages.chat_id 
            AND auth.uid() = ANY(participants)
        )
    );

-- Create policies for stories table
CREATE POLICY "Anyone can read non-expired stories" ON public.stories
    FOR SELECT USING (expires_at > NOW());

CREATE POLICY "Users can create their own stories" ON public.stories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" ON public.stories
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
DROP TRIGGER IF EXISTS check_message_disappearance ON public.messages;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically mark messages as disappeared
CREATE OR REPLACE FUNCTION mark_message_as_disappeared()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark message as disappeared if it has been viewed the maximum number of times
    IF jsonb_array_length(NEW.viewed_by) >= NEW.max_views THEN
        NEW.is_disappeared = TRUE;
    END IF;
    
    -- Set expiration time on first view if not already set
    IF OLD.view_count = 0 AND NEW.view_count > 0 AND NEW.expires_at IS NULL THEN
        NEW.expires_at = NOW() + (NEW.disappear_after_seconds || ' seconds')::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for disappearing messages
CREATE TRIGGER check_message_disappearance BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION mark_message_as_disappeared();

-- Function to cleanup expired messages
CREATE OR REPLACE FUNCTION cleanup_expired_messages()
RETURNS void AS $$
BEGIN
    UPDATE public.messages 
    SET is_disappeared = TRUE 
    WHERE expires_at < NOW() AND is_disappeared = FALSE;
END;
$$ language 'plpgsql';

-- Function to handle new user registration
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;

-- Optional: Create some test data (uncomment if you want sample data)
/*
-- Insert test users (these will only work if you have users with these IDs)
INSERT INTO public.users (id, email, display_name, snap_score) VALUES
    ('test-user-1', 'user1@example.com', 'Test User 1', 100),
    ('test-user-2', 'user2@example.com', 'Test User 2', 150)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    snap_score = EXCLUDED.snap_score;
*/

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'SnapConnect database setup completed successfully!';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '1. Test user registration and login';
    RAISE NOTICE '2. Create chats between users';
    RAISE NOTICE '3. Send disappearing messages';
    RAISE NOTICE '4. Test the real-time functionality';
END
$$;

-- Migration: Add username column if it doesn't exist
DO $$
BEGIN
    -- Check if username column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'username' 
        AND table_schema = 'public'
    ) THEN
        -- Add username column
        ALTER TABLE public.users ADD COLUMN username TEXT UNIQUE;
        
        -- Create index for username
        CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
        
        RAISE NOTICE 'Added username column to users table';
    ELSE
        RAISE NOTICE 'Username column already exists';
    END IF;
END
$$; 