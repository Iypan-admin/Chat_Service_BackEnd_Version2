-- Create chats table for teacher-student messaging
CREATE TABLE IF NOT EXISTS chats (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    text text NOT NULL,
    batch_id uuid NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    sender text NOT NULL CHECK (sender IN ('teacher', 'student')),
    created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_batch_id ON chats(batch_id);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at);
CREATE INDEX IF NOT EXISTS idx_chats_sender ON chats(sender);

-- Add comments for documentation
COMMENT ON TABLE chats IS 'Stores chat messages between teachers and students for specific batches';
COMMENT ON COLUMN chats.text IS 'The message content';
COMMENT ON COLUMN chats.batch_id IS 'Foreign key to batches table - determines which batch this message belongs to';
COMMENT ON COLUMN chats.sender IS 'Who sent the message - either teacher or student';
COMMENT ON COLUMN chats.created_at IS 'When the message was created';








