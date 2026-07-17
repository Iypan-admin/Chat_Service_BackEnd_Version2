-- Add user_id column to chats table to track who sent each message
-- This allows displaying correct sender name (main teacher, sub teacher, assistant tutor, or student)

ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_user_id 
ON public.chats(user_id);

-- Add comment for documentation
COMMENT ON COLUMN public.chats.user_id IS 'User ID of the message sender (teacher or student). Used to fetch sender name for display.';

