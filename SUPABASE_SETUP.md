# SnapConnect - Supabase Migration Guide

## 🚀 Supabase Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `snapconnect`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for setup to complete

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Key** (anon/public key)

### 3. Update Your App Configuration

Replace the placeholder values in `supabase.js`:

```javascript
const supabaseUrl = 'YOUR_PROJECT_URL_HERE';
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE';
```

### 4. Create Database Tables

Run the following SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    friends UUID[] DEFAULT '{}',
    snap_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    participants UUID[] NOT NULL,
    last_message_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table with disappearing functionality
CREATE TABLE public.messages (
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
CREATE TABLE public.stories (
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

-- Create policies for users table
CREATE POLICY "Users can read their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can read user profiles" ON public.users
    FOR SELECT USING (true);

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
    IF array_length(NEW.viewed_by::json[], 1) >= NEW.max_views THEN
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

-- Create a cron job to run cleanup every minute (requires pg_cron extension)
-- This will be run manually or via a scheduled function for now
-- SELECT cron.schedule('cleanup-expired-messages', '* * * * *', 'SELECT cleanup_expired_messages();');
```

### 5. Enable Realtime (for chat functionality)

In your Supabase dashboard:
1. Go to **Database** > **Replication**
2. Enable replication for tables:
   - `public.messages`
   - `public.chats`
   - `public.stories`

### 6. Configure Storage (for media files)

1. Go to **Storage** in your Supabase dashboard
2. Create buckets:
   - **Name**: `avatars` (for profile pictures)
   - **Name**: `chat-media` (for chat images/videos)
   - **Name**: `stories` (for story media)
3. Set up storage policies for each bucket as needed

## 🎯 What's Changed

### ✅ Completed
- ✅ Removed Firebase dependencies
- ✅ Added Supabase client
- ✅ Updated AuthContext to use Supabase Auth
- ✅ Maintained same API interface for seamless migration

### 🔄 Next Steps
1. Set up your Supabase project using this guide
2. Update the credentials in `supabase.js`
3. Test authentication (signup/login)
4. Migrate chat functionality to use Supabase realtime
5. Update media storage to use Supabase Storage

### 🐛 Resolved Issues
- ❌ Firebase Auth "runtime not ready" errors
- ❌ Firebase compatibility issues with Expo
- ❌ Complex Firebase setup requirements

### 🎁 New Benefits
- ✅ Full Expo compatibility (no ejecting needed)
- ✅ Built-in realtime subscriptions
- ✅ Integrated file storage
- ✅ PostgreSQL database with full SQL support
- ✅ Row Level Security for data protection
- ✅ Better performance and reliability 