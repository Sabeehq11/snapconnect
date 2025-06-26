-- Add category and type columns to stories table
ALTER TABLE stories 
ADD COLUMN category VARCHAR(50) DEFAULT 'my_story',
ADD COLUMN story_type VARCHAR(20) DEFAULT 'personal';

-- Create index for better query performance
CREATE INDEX idx_stories_category ON stories(category);
CREATE INDEX idx_stories_type ON stories(story_type);

-- Update existing stories to have default category
UPDATE stories 
SET category = 'my_story', story_type = 'personal' 
WHERE category IS NULL OR story_type IS NULL; 