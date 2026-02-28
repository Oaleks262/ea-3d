import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from '../utils/fileUtils.js';
import { sendContactEmails } from '../utils/mailer.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/messages
 * Submit contact form (public)
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, requestType, message } = req.body;

    // Validation
    if (!name || !email || !requestType || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const messages = await readJSON('messages.json');

    const newMessage = {
      id: uuidv4(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      requestType,
      message: message.trim(),
      read: false,
      receivedAt: new Date().toISOString()
    };

    messages.unshift(newMessage); // Add to beginning of array
    await writeJSON('messages.json', messages);

    // Send emails (don't wait for completion)
    sendContactEmails(newMessage).catch(err => {
      console.error('Email sending failed:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error submitting message:', error);
    res.status(500).json({ error: 'Failed to submit message' });
  }
});

/**
 * GET /api/messages
 * Get all messages (auth required)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const messages = await readJSON('messages.json');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * PATCH /api/messages/:id/read
 * Mark message as read (auth required)
 */
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const messages = await readJSON('messages.json');
    const message = messages.find(m => m.id === req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.read = true;
    await writeJSON('messages.json', messages);

    res.json(message);
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ error: 'Failed to update message' });
  }
});

/**
 * DELETE /api/messages/:id
 * Delete message (auth required)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const messages = await readJSON('messages.json');
    const index = messages.findIndex(m => m.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Message not found' });
    }

    messages.splice(index, 1);
    await writeJSON('messages.json', messages);

    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;
