-- Add recipient_id column to chats table for individual student chats
-- If recipient_id is NULL, message goes to entire batch
-- If recipient_id is set, message is for that specific student only

ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS recipient_id uuid REFERENCES students(student_id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_recipient_id 
ON public.chats(recipient_id);

-- Add comment for documentation
COMMENT ON COLUMN public.chats.recipient_id IS 'Student ID for individual chats. NULL means message is for entire batch.';

