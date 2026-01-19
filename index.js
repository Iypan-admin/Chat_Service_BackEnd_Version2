const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// Create a new chat message
app.post('/chats', async (req, res) => {
    const { text, batch_id, sender, user_id, recipient_id } = req.body;

    if (!text || !batch_id) {
        return res.status(400).json({ error: 'Text and batch_id are required' });
    }

    // Check if batch is part of a merge group (only for batch-wide messages)
    let merge_group_id = null;
    if (!recipient_id) {
    const { data: mergeMember } = await supabase
        .from('batch_merge_members')
        .select('merge_group_id')
        .eq('batch_id', batch_id)
        .single();

    if (mergeMember) {
        merge_group_id = mergeMember.merge_group_id;
        }
    }

    const { data, error } = await supabase
        .from('chats')
        .insert([{ 
            text, 
            batch_id, 
            merge_group_id,
            sender: sender || 'teacher',
            user_id: user_id || null,
            recipient_id: recipient_id || null
        }])
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ 
        message: 'Chat message created successfully',
        success: true,
        data: data
    });
});

// Fetch previous messages for a batch or individual student
app.get('/chats/:batch_id', async (req, res) => {
    const { batch_id } = req.params;
    const { recipient_id } = req.query; // Optional: for individual student chats

    let query = supabase
        .from('chats')
        .select(`
            *,
            sender_user:users(id, name, full_name),
            recipient:students(student_id, name, registration_number)
        `);

    // If recipient_id is provided, get individual chat messages
    if (recipient_id) {
        // Get messages for this specific student (both direct and batch-wide)
        query = query
            .eq('batch_id', batch_id)
            .or(`recipient_id.eq.${recipient_id},recipient_id.is.null`)
            .order('created_at', { ascending: true });
    } else {
        // Batch-wide messages only (recipient_id is NULL)
        // Check if batch is part of a merge group
        const { data: mergeMember } = await supabase
            .from('batch_merge_members')
            .select('merge_group_id')
            .eq('batch_id', batch_id)
            .single();

        if (mergeMember && mergeMember.merge_group_id) {
            query = query
                .eq('merge_group_id', mergeMember.merge_group_id)
                .is('recipient_id', null);
        } else {
            query = query
                .eq('batch_id', batch_id)
                .is('recipient_id', null);
        }
        
        query = query.order('created_at', { ascending: true });
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    // Transform the data to include sender_name and recipient_name
    const transformedData = (data || []).map(msg => ({
        ...msg,
        sender_name: msg.sender_user 
            ? (msg.sender_user.full_name || msg.sender_user.name || 'Unknown')
            : null,
        recipient_name: msg.recipient 
            ? (msg.recipient.name || 'Unknown')
            : null,
        sender_user: undefined, // Remove nested object
        recipient: undefined // Remove nested object
    }));

    res.json(transformedData);
});

// Update a chat message
app.put('/chats/:id', async (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const { error } = await supabase
        .from('chats')
        .update({ text })
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Chat message updated successfully' });
});

// Delete a chat message
app.delete('/chats/:id', async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Chat message deleted successfully' });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));