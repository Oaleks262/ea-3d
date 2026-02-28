import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import { deleteUploadedFile } from '../utils/fileUtils.js';
import { verifyToken } from '../middleware/authMiddleware.js';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure temporary storage for uploads
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/temp'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images - accept all image types
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Файл має бути зображенням'), false);
  }
};

// File filter for videos - accept all video types
const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Файл має бути відео'), false);
  }
};

// Multer instances with increased limits
const uploadThumbnail = multer({
  storage: tempStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

const uploadPreview = multer({
  storage: tempStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB
});

/**
 * POST /api/upload/thumbnail
 * Upload and convert image to WebP
 */
router.post('/thumbnail', verifyToken, uploadThumbnail.single('file'), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    tempFilePath = req.file.path;
    const outputFilename = `${uuidv4()}.webp`;
    const outputPath = path.join(__dirname, '../uploads/projects/thumbnails', outputFilename);

    // Convert to WebP with compression
    await sharp(tempFilePath)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    // Delete temp file
    fs.unlinkSync(tempFilePath);

    const thumbnailUrl = `/uploads/projects/thumbnails/${outputFilename}`;

    res.json({
      success: true,
      thumbnailUrl,
      filename: outputFilename
    });
  } catch (error) {
    console.error('Thumbnail processing error:', error);

    // Clean up temp file if exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.status(500).json({ error: 'Помилка обробки зображення' });
  }
});

/**
 * POST /api/upload/preview
 * Upload and convert video to WebM
 */
router.post('/preview', verifyToken, uploadPreview.single('file'), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не завантажено' });
    }

    tempFilePath = req.file.path;
    const outputFilename = `${uuidv4()}.webm`;
    const outputPath = path.join(__dirname, '../uploads/projects/previews', outputFilename);

    // Convert to WebM
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .outputOptions([
          '-c:v libvpx-vp9',
          '-crf 30',
          '-b:v 0',
          '-b:a 128k',
          '-c:a libopus',
          '-vf scale=1280:-2',
          '-deadline good',
          '-cpu-used 2'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Delete temp file
    fs.unlinkSync(tempFilePath);

    const previewVideoUrl = `/uploads/projects/previews/${outputFilename}`;

    res.json({
      success: true,
      previewVideoUrl,
      filename: outputFilename
    });
  } catch (error) {
    console.error('Video processing error:', error);

    // Clean up temp file if exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.status(500).json({ error: 'Помилка обробки відео: ' + error.message });
  }
});

/**
 * DELETE /api/upload/:type/:filename
 * Delete uploaded file
 */
router.delete('/:type/:filename', verifyToken, async (req, res) => {
  try {
    const { type, filename } = req.params;

    if (!['thumbnails', 'previews'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const fileUrl = `/uploads/projects/${type}/${filename}`;
    await deleteUploadedFile(fileUrl);

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Error handling for multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Файл занадто великий',
        maxSize: err.field === 'thumbnail' ? '100MB' : '500MB'
      });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
});

export default router;
