-- Create memories table for storing user photos taken in the app
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type VARCHAR(20) DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption TEXT DEFAULT '',
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);

-- Enable Row Level Security
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own memories
CREATE POLICY "Users can view own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy for users to insert their own memories
CREATE POLICY "Users can insert own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own memories
CREATE POLICY "Users can update own memories" ON memories
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy for users to delete their own memories
CREATE POLICY "Users can delete own memories" ON memories
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_memories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_memories_updated_at(); 