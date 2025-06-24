# 🔧 Fix Guide: Image Sharing Issues

## 🚨 Issues Identified from Your Logs

1. **Storage RLS Policy Error**: `new row violates row-level security policy`
2. **Navigation Error**: Cannot navigate to 'Chat' screen
3. **Deprecated API**: ImagePicker.MediaTypeOptions warning
4. **Images showing as black screens** on receiver's device

## ✅ Fixes Applied

### 1. **Updated Storage Policies** (`storage_setup.sql`)
- Fixed RLS policies to allow proper upload/download
- Made the bucket truly public for easier access
- Added proper folder structure: `userId/snap_TIMESTAMP.jpg`

### 2. **Enhanced Upload Function**
- Added detailed logging to track upload process
- Proper public URL generation with verification
- Better error handling (no more fallbacks that hide issues)
- File path structure: `${userId}/snap_${timestamp}.jpg`

### 3. **Fixed Navigation**
- Changed from `navigation.navigate('Chat')` to `navigation.navigate('MainTabs', { screen: 'Chat' })`

### 4. **Fixed Deprecated API**
- Updated `ImagePicker.MediaTypeOptions.Images` to `ImagePicker.MediaType.Images`

## 🚀 Next Steps to Fix Your Issue

### Step 1: Run the Updated SQL Script

**Go to your Supabase Dashboard → SQL Editor and run this:**

```sql
-- Storage setup for media files
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own media" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own media" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Create policy to allow authenticated users to upload their own files
CREATE POLICY "Allow authenticated upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow anyone to view files in media bucket (since it's public)
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Create policy to allow users to update their own files
CREATE POLICY "Allow authenticated update" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create policy to allow users to delete their own files
CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Step 2: Test the Upload Process

1. **Reload your app** (shake device → Reload)
2. **Take or select a photo**
3. **Check the logs** for these messages:
   ```
   🔄 Starting image upload for URI: [local_uri]
   📁 Uploading to path: [user_id]/snap_[timestamp].jpg
   ✅ Upload successful: [upload_data]
   🔗 Generated public URL: [public_url]
   ✅ Public URL verified as accessible
   ```

### Step 3: Verify Public URL Generation

The new upload function now:
- Creates files with path: `userId/snap_timestamp.jpg`
- Generates proper public URLs
- Verifies URL accessibility
- Stores the public URL in your database

### Step 4: Check Image Rendering

In your chat, image messages should now:
- Show thumbnail previews properly
- Display full-screen when tapped
- Work for both sender and receiver

## 🔍 Debugging Tips

### If Upload Still Fails:
1. Check if the 'media' bucket exists in Supabase Storage
2. Verify bucket is set to "Public"
3. Confirm the SQL policies were applied successfully

### If Images Still Show Black:
1. Check the generated public URL in logs
2. Try opening the URL in your browser
3. Verify the receiving user's ChatScreen can access the URL

### Test the Public URL:
```javascript
// You can test this in your browser console or app logs
fetch('https://your-project.supabase.co/storage/v1/object/public/media/user_id/snap_timestamp.jpg')
  .then(response => console.log('URL accessible:', response.ok))
  .catch(error => console.log('URL not accessible:', error));
```

## 📱 Expected Behavior After Fix

1. **Sender**: Take photo → See preview → Select friends → Send → Success message
2. **Receiver**: See image thumbnail in chat → Tap to view full-screen → Image displays properly
3. **Logs**: Clear success messages throughout the upload process
4. **Storage**: Files organized as `userId/snap_timestamp.jpg`

## 🚨 If Problems Persist

1. **Clear app data** and try again
2. **Check Supabase dashboard** for uploaded files
3. **Verify bucket settings** are Public
4. **Test URL accessibility** manually in browser

The key fix is ensuring the **public URL generation works correctly** and **storage policies allow public access** to the media bucket. This should resolve the black screen issue on the receiver's end! 