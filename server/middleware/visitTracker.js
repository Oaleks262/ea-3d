import { readJSON, writeJSON } from '../utils/fileUtils.js';

/**
 * Track page visits for analytics
 */
export async function visitTracker(req, res, next) {
  try {
    // Skip tracking for API routes and static files
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const page = req.path;

    const visits = await readJSON('visits.json');

    // Find or create today's entry
    let todayVisit = visits.find(v => v.date === today);

    if (!todayVisit) {
      todayVisit = {
        date: today,
        count: 0,
        pages: {}
      };
      visits.push(todayVisit);
    }

    // Increment counters
    todayVisit.count++;
    todayVisit.pages[page] = (todayVisit.pages[page] || 0) + 1;

    // Keep only last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const filteredVisits = visits.filter(v => new Date(v.date) >= ninetyDaysAgo);

    await writeJSON('visits.json', filteredVisits);
  } catch (error) {
    console.error('Visit tracking error:', error);
  }

  next();
}
