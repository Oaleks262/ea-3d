import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to load settings
function loadSettings() {
  const settingsPath = path.join(__dirname, '../data/settings.json');
  const data = fs.readFileSync(settingsPath, 'utf-8');
  return JSON.parse(data);
}

// Helper to save settings
function saveSettings(settings) {
  const settingsPath = path.join(__dirname, '../data/settings.json');
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

/**
 * POST /api/auth/login
 * Admin login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Load settings to check for stored credentials
    const settings = loadSettings();

    // Use settings credentials if available, otherwise fall back to env
    const adminEmail = settings.adminEmail || process.env.ADMIN_EMAIL;
    const adminPasswordHash = settings.adminPasswordHash || process.env.ADMIN_PASSWORD_HASH;

    // Verify email
    if (email !== adminEmail) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/verify
 * Verify JWT token
 */
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * POST /api/auth/change-password
 * Change admin password
 */
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Load settings
    const settings = loadSettings();
    const adminPasswordHash = settings.adminPasswordHash || process.env.ADMIN_PASSWORD_HASH;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, adminPasswordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update settings
    settings.adminPasswordHash = newPasswordHash;
    saveSettings(settings);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

/**
 * POST /api/auth/generate-hash
 * Helper endpoint to generate password hash (development only)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/generate-hash', async (req, res) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }

      const hash = await bcrypt.hash(password, 10);

      res.json({
        password,
        hash,
        instruction: 'Add this hash to your .env file as ADMIN_PASSWORD_HASH'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate hash' });
    }
  });
}

export default router;
