import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON, deleteUploadedFile } from '../utils/fileUtils.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/projects
 * Get all projects (public)
 */
router.get('/', async (req, res) => {
  try {
    const projects = await readJSON('projects.json');

    // Sort by order and featured status
    const sortedProjects = projects.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.order - b.order;
    });

    res.json(sortedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:id
 * Get single project (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const projects = await readJSON('projects.json');
    const project = projects.find(p => p.id === req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * POST /api/projects
 * Create new project (auth required)
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const projects = await readJSON('projects.json');

    const newProject = {
      id: uuidv4(),
      title: req.body.title,
      category: req.body.category,
      description: req.body.description || '',
      challenge: req.body.challenge || '',
      solution: req.body.solution || '',
      tools: req.body.tools || [],
      thumbnailUrl: req.body.thumbnailUrl || '',
      previewVideoUrl: req.body.previewVideoUrl || '',
      fullVideoUrl: req.body.fullVideoUrl || '',
      featured: req.body.featured || false,
      order: req.body.order || projects.length,
      createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    await writeJSON('projects.json', projects);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * PUT /api/projects/:id
 * Update project (auth required)
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const projects = await readJSON('projects.json');
    const index = projects.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const oldProject = projects[index];

    // If thumbnailUrl or previewVideoUrl changed, delete old files
    if (req.body.thumbnailUrl && req.body.thumbnailUrl !== oldProject.thumbnailUrl) {
      await deleteUploadedFile(oldProject.thumbnailUrl);
    }
    if (req.body.previewVideoUrl && req.body.previewVideoUrl !== oldProject.previewVideoUrl) {
      await deleteUploadedFile(oldProject.previewVideoUrl);
    }

    // Update project
    projects[index] = {
      ...oldProject,
      ...req.body,
      id: oldProject.id, // Preserve ID
      createdAt: oldProject.createdAt // Preserve creation date
    };

    await writeJSON('projects.json', projects);

    res.json(projects[index]);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project and associated files (auth required)
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const projects = await readJSON('projects.json');
    const index = projects.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projects[index];

    // Delete associated files
    await deleteUploadedFile(project.thumbnailUrl);
    await deleteUploadedFile(project.previewVideoUrl);

    // Remove from array
    projects.splice(index, 1);
    await writeJSON('projects.json', projects);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
