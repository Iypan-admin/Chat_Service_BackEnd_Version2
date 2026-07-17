-- Add sender column to existing chats table
ALTER TABLE public.chats 
ADD COLUMN sender text NOT NULL DEFAULT 'teacher';

-- Add constraint to ensure sender is either 'teacher' or 'student'
ALTER TABLE public.chats 
ADD CONSTRAINT chats_sender_check 
CHECK (sender IN ('teacher', 'student'));

-- Create index for better performance on sender queries
CREATE INDEX IF NOT EXISTS idx_chats_sender ON public.chats(sender);

-- Add comment for documentation
COMMENT ON COLUMN public.chats.sender IS 'Who sent the message - either teacher or student';








