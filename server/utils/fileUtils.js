import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

/**
 * Read JSON file
 */
export async function readJSON(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Write JSON file
 */
export async function writeJSON(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing JSON:', error);
    throw error;
  }
}

/**
 * Delete uploaded file
 */
export async function deleteUploadedFile(fileUrl) {
  try {
    if (!fileUrl) return;

    // Extract path from URL (e.g., "/uploads/projects/thumbnails/file.webp")
    const relativePath = fileUrl.replace('/uploads/', '');
    const filePath = path.join(UPLOADS_DIR, relativePath);

    await fs.unlink(filePath);
    console.log('Deleted file:', filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting file:', error);
    }
  }
}

/**
 * Initialize data directory and files if they don't exist
 */
export async function initializeData() {
  try {
    // Ensure data directory exists
    await fs.mkdir(DATA_DIR, { recursive: true });

    // Initialize projects.json
    const projectsFile = path.join(DATA_DIR, 'projects.json');
    try {
      await fs.access(projectsFile);
    } catch {
      await fs.writeFile(projectsFile, JSON.stringify([], null, 2));
    }

    // Initialize messages.json
    const messagesFile = path.join(DATA_DIR, 'messages.json');
    try {
      await fs.access(messagesFile);
    } catch {
      await fs.writeFile(messagesFile, JSON.stringify([], null, 2));
    }

    // Initialize settings.json
    const settingsFile = path.join(DATA_DIR, 'settings.json');
    try {
      await fs.access(settingsFile);
    } catch {
      const defaultSettings = {
        heroTitle: "ELIZAVETA ANTONIUK",
        heroSubtitle: "Creating high-end visual experiences",
        aboutBio: "I'm a passionate 3D Animator and Motion Designer with years of experience creating stunning visual content for brands and agencies worldwide. I specialize in bringing ideas to life through cutting-edge animation and design.",
        stats: {
          projects: 47,
          clients: 32,
          years: 5
        },
        socialLinks: {
          behance: "https://behance.net",
          instagram: "https://instagram.com",
          linkedin: "https://linkedin.com"
        },
        colorPrimary: "#7B2FF7",
        colorAccent: "#FF2FD1",
        adminEmail: process.env.ADMIN_EMAIL || "elizaveta@example.com"
      };
      await fs.writeFile(settingsFile, JSON.stringify(defaultSettings, null, 2));
    }

    // Initialize visits.json
    const visitsFile = path.join(DATA_DIR, 'visits.json');
    try {
      await fs.access(visitsFile);
    } catch {
      await fs.writeFile(visitsFile, JSON.stringify([], null, 2));
    }

    console.log('Data files initialized successfully');
  } catch (error) {
    console.error('Error initializing data:', error);
    throw error;
  }
}
