-- Storage setup for media files
-- This should be run in your Supabase dashboard SQL editor

-- Create a bucket for media files (public bucket for easier access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

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

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 