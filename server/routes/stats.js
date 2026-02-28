import express from 'express';
import { readJSON } from '../utils/fileUtils.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/stats
 * Get visit statistics (auth required)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const visits = await readJSON('visits.json');
    const projects = await readJSON('projects.json');
    const messages = await readJSON('messages.json');

    // Calculate total visits
    const totalVisits = visits.reduce((sum, day) => sum + day.count, 0);

    // Get last 7 days for chart
    const last7Days = visits.slice(-7).map(day => ({
      date: day.date,
      visits: day.count
    }));

    // Calculate most viewed project
    let mostViewedProject = null;
    const projectPageViews = {};

    visits.forEach(day => {
      Object.keys(day.pages).forEach(page => {
        if (page.startsWith('/project/')) {
          const projectId = page.split('/')[2];
          projectPageViews[projectId] = (projectPageViews[projectId] || 0) + day.pages[page];
        }
      });
    });

    if (Object.keys(projectPageViews).length > 0) {
      const mostViewedId = Object.keys(projectPageViews).reduce((a, b) =>
        projectPageViews[a] > projectPageViews[b] ? a : b
      );
      const project = projects.find(p => p.id === mostViewedId);
      if (project) {
        mostViewedProject = {
          id: project.id,
          title: project.title,
          views: projectPageViews[mostViewedId]
        };
      }
    }

    // Count unread messages
    const unreadMessages = messages.filter(m => !m.read).length;

    // Response
    res.json({
      totalVisits,
      totalProjects: projects.length,
      unreadMessages,
      mostViewedProject,
      last7Days,
      visitsByPage: visits.slice(-30).reduce((acc, day) => {
        Object.keys(day.pages).forEach(page => {
          acc[page] = (acc[page] || 0) + day.pages[page];
        });
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
