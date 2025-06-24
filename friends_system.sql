-- Simple Friends System for SnapConnect
-- Copy and paste this ENTIRE script into your Supabase SQL Editor

-- 1. Create friend requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- 2. Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

-- 3. Enable RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view their friend requests" 
ON public.friend_requests FOR ALL 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can view their friendships" 
ON public.friendships FOR ALL 
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 5. Simple function to get user friends
CREATE OR REPLACE FUNCTION public.get_user_friends()
RETURNS TABLE (
    id UUID,
    email TEXT,
    username TEXT,
    display_name TEXT,
    photo_url TEXT,
    snap_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id, u.email, u.username, u.display_name, u.photo_url, u.snap_score, u.created_at
    FROM public.users u
    INNER JOIN public.friendships f ON (
        (f.user1_id = auth.uid() AND f.user2_id = u.id) OR
        (f.user2_id = auth.uid() AND f.user1_id = u.id)
    )
    WHERE u.id != auth.uid()
    ORDER BY u.display_name, u.username;
END;
$$;

-- 6. Function to send friend request
CREATE OR REPLACE FUNCTION public.send_friend_request(
    receiver_email TEXT,
    request_message TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    receiver_user public.users%ROWTYPE;
    result JSON;
BEGIN
    -- Find receiver by email or username
    SELECT * INTO receiver_user 
    FROM public.users 
    WHERE email = receiver_email OR username = receiver_email
    LIMIT 1;
    
    IF receiver_user IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Check if trying to send to self
    IF receiver_user.id = auth.uid() THEN
        RETURN json_build_object('success', false, 'error', 'Cannot send friend request to yourself');
    END IF;
    
    -- Check if friendship already exists
    IF EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE (user1_id = LEAST(auth.uid(), receiver_user.id) AND user2_id = GREATEST(auth.uid(), receiver_user.id))
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Already friends');
    END IF;
    
    -- Check if request already exists
    IF EXISTS (
        SELECT 1 FROM public.friend_requests 
        WHERE (sender_id = auth.uid() AND receiver_id = receiver_user.id AND status = 'pending')
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Friend request already pending');
    END IF;
    
    -- Create new request
    INSERT INTO public.friend_requests (sender_id, receiver_id, message)
    VALUES (auth.uid(), receiver_user.id, request_message);
    
    RETURN json_build_object(
        'success', true, 
        'receiver', json_build_object('display_name', receiver_user.display_name, 'username', receiver_user.username)
    );
END;
$$;

-- 7. Function to respond to friend request
CREATE OR REPLACE FUNCTION public.respond_to_friend_request(
    request_id UUID,
    response TEXT
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    friend_request public.friend_requests%ROWTYPE;
BEGIN
    -- Get the friend request
    SELECT * INTO friend_request
    FROM public.friend_requests
    WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
    
    IF friend_request IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Friend request not found');
    END IF;
    
    -- Update request status
    UPDATE public.friend_requests
    SET status = CASE WHEN response = 'accept' THEN 'accepted' ELSE 'rejected' END
    WHERE id = request_id;
    
    -- If accepted, create friendship
    IF response = 'accept' THEN
        INSERT INTO public.friendships (user1_id, user2_id)
        VALUES (
            LEAST(friend_request.sender_id, friend_request.receiver_id),
            GREATEST(friend_request.sender_id, friend_request.receiver_id)
        );
        
        RETURN json_build_object('success', true, 'action', 'accepted');
    ELSE
        RETURN json_build_object('success', true, 'action', 'rejected');
    END IF;
END;
$$;

-- 8. Function to get pending friend requests
CREATE OR REPLACE FUNCTION public.get_pending_friend_requests(request_type TEXT DEFAULT 'received')
RETURNS TABLE (
    id UUID,
    sender_id UUID,
    receiver_id UUID,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    sender_display_name TEXT,
    sender_username TEXT,
    sender_email TEXT,
    receiver_display_name TEXT,
    receiver_username TEXT,
    receiver_email TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    IF request_type = 'received' THEN
        RETURN QUERY
        SELECT 
            fr.id, fr.sender_id, fr.receiver_id, fr.message, fr.created_at,
            sender.display_name, sender.username, sender.email,
            receiver.display_name, receiver.username, receiver.email
        FROM public.friend_requests fr
        JOIN public.users sender ON fr.sender_id = sender.id
        JOIN public.users receiver ON fr.receiver_id = receiver.id
        WHERE fr.receiver_id = auth.uid() AND fr.status = 'pending'
        ORDER BY fr.created_at DESC;
    ELSE
        RETURN QUERY
        SELECT 
            fr.id, fr.sender_id, fr.receiver_id, fr.message, fr.created_at,
            sender.display_name, sender.username, sender.email,
            receiver.display_name, receiver.username, receiver.email
        FROM public.friend_requests fr
        JOIN public.users sender ON fr.sender_id = sender.id
        JOIN public.users receiver ON fr.receiver_id = receiver.id
        WHERE fr.sender_id = auth.uid() AND fr.status = 'pending'
        ORDER BY fr.created_at DESC;
    END IF;
END;
$$; 