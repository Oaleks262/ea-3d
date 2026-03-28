import express from 'express';
import { readJSON, writeJSON } from '../utils/fileUtils.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/settings
 * Get public settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await readJSON('settings.json');

    // Return public settings only (no sensitive data)
    const publicSettings = {
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
      aboutBio: settings.aboutBio,
      aboutTitleMain: settings.aboutTitleMain,
      aboutTitleAccent: settings.aboutTitleAccent,
      skills: settings.skills,
      processTitle: settings.processTitle,
      processSteps: settings.processSteps,
      stats: settings.stats,
      socialLinks: settings.socialLinks,
      colorPrimary: settings.colorPrimary,
      colorAccent: settings.colorAccent
    };

    res.json(publicSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/settings
 * Update settings (auth required)
 */
router.put('/', verifyToken, async (req, res) => {
  try {
    const currentSettings = await readJSON('settings.json');

    const updatedSettings = {
      ...currentSettings,
      ...req.body,
      // Preserve admin email from env
      adminEmail: currentSettings.adminEmail
    };

    await writeJSON('settings.json', updatedSettings);

    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
