import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeData } from './utils/fileUtils.js';
import { visitTracker } from './middleware/visitTracker.js';

// Import routes (will be created in next steps)
import projectsRouter from './routes/projects.js';
import messagesRouter from './routes/messages.js';
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';
import uploadRouter from './routes/upload.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Visit tracking
app.use(visitTracker);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/stats', statsRouter);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize data files and start server
async function startServer() {
  try {
    await initializeData();

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// For Vercel serverless
if (process.env.VERCEL) {
  initializeData().catch(console.error);
} else {
  // For local development
  startServer();
}

// Export for Vercel
export default app;
