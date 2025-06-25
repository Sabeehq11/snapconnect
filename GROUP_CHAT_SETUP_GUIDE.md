# Group Chat Setup and Troubleshooting Guide

## Issue Description
Group chat functionality shows group name input but no friends list for selection.

## Root Cause Analysis
The issue is likely one of the following:
1. Friends system database not properly set up
2. No friends added to the account
3. Database functions missing or not working
4. Modal not properly receiving friends data

## Step-by-Step Fix

### 1. Ensure Database Schema is Applied

First, apply the friends system database schema by running the following SQL in your Supabase SQL Editor:

**Copy and paste the entire `friends_system.sql` file** into your Supabase SQL Editor and run it.

### 2. Apply Group Chat Schema

Then, apply the group chat schema by running the `group_chat_schema.sql` file in your Supabase SQL Editor.

### 3. Verify Database Setup

Run this SQL query to verify the tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('friend_requests', 'friendships', 'chats');
```

### 4. Test Friends Functionality

1. **Add Friends First**: Before creating group chats, you need to have friends
   - Go to the chat list screen
   - Tap the "+" button to create a new chat
   - Switch to "Add Friends" tab
   - Send friend requests to other users
   - Accept friend requests from other users

2. **Verify Friends List**: 
   - Check that friends appear in the regular chat creation modal
   - Check that friends appear in your profile screen

### 5. Test Group Chat Creation

Once you have friends:
1. Go to the chat list screen
2. Tap the group icon (people icon) in the header
3. You should now see:
   - Group name input field
   - List of your friends with checkboxes
   - "Create Group Chat" button (enabled only when name + 2+ friends selected)

## Debug Information

The CreateGroupChatModal now includes debug logging. Check your React Native debugger/console for:
- "CreateGroupChatModal opened"
- "Friends loaded: [array of friends]"
- "Friends count: X"

If friends count is 0, the issue is with the friends system, not the group chat modal.

## Common Issues and Solutions

### Issue: "No friends found" message
**Solution**: Add friends first using the regular chat creation modal

### Issue: Friends system functions not working
**Solution**: Ensure you've run the complete `friends_system.sql` script in Supabase

### Issue: Group chat not appearing in chat list
**Solution**: The group chat should appear automatically after creation. Check the `useChats` hook is properly handling group chats.

### Issue: Database permissions
**Solution**: Ensure RLS policies are properly set for the current user

## Verification Steps

1. **Check Database Tables**:
   ```sql
   SELECT COUNT(*) FROM friendships WHERE user1_id = auth.uid() OR user2_id = auth.uid();
   ```

2. **Check Friends Function**:
   ```sql
   SELECT * FROM get_user_friends();
   ```

3. **Check Group Chats**:
   ```sql
   SELECT * FROM chats WHERE is_group_chat = true AND auth.uid() = ANY(participants);
   ```

## Expected Behavior

After proper setup:
1. Tap group chat icon → Modal opens with group name input
2. Friends list appears with checkboxes
3. Select 2+ friends + enter group name → Create button becomes enabled
4. Tap Create → Group chat is created and appears in chat list
5. Navigate to group chat → Can send messages to all participants

The implementation is already complete and functional - the issue is likely missing database setup or no friends added yet. 