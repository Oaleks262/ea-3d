import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { projectsAPI } from '../utils/api';
import Cursor from '../components/Cursor/Cursor';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import '../styles/pages/ProjectCase.scss';

function ProjectCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProject();
    fetchAllProjects();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(id);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setAllProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;

    // Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1`;
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const youtubeId = url.includes('youtu.be')
        ? url.split('/').pop()
        : new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1`;
    }

    return null;
  };

  const getNextProject = () => {
    const currentIndex = allProjects.findIndex((p) => p.id === id);
    return allProjects[(currentIndex + 1) % allProjects.length];
  };

  const getPrevProject = () => {
    const currentIndex = allProjects.findIndex((p) => p.id === id);
    return allProjects[(currentIndex - 1 + allProjects.length) % allProjects.length];
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!project) return null;

  const embedUrl = getVideoEmbedUrl(project.fullVideoUrl);
  const nextProject = getNextProject();
  const prevProject = getPrevProject();

  return (
    <>
      <Helmet>
        <title>{project.title} — Elizaveta Antoniuk</title>
        <meta name="description" content={project.description} />
      </Helmet>

      <Cursor />
      <Navbar />

      <motion.div
        className="project-case"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back Button */}
        <div className="container">
          <Link to="/#works" className="project-case__back">
            ← Повернутися до Робіт
          </Link>
        </div>

        {/* Hero Video */}
        {embedUrl && (
          <div className="project-case__hero">
            <iframe
              src={embedUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={project.title}
            ></iframe>
          </div>
        )}

        {/* Content */}
        <div className="container">
          <div className="project-case__header">
            <div className="badge">{project.category}</div>
            <h1 className="project-case__title">{project.title}</h1>
            <p className="project-case__description">{project.description}</p>
          </div>

          {/* Challenge & Solution */}
          <div className="project-case__grid">
            <div className="project-case__section">
              <h3>Завдання</h3>
              <p>{project.challenge || 'Буде оновлено...'}</p>
            </div>

            <div className="project-case__section">
              <h3>Рішення</h3>
              <p>{project.solution || 'Буде оновлено...'}</p>
            </div>
          </div>

          {/* Tools Used */}
          {project.tools && project.tools.length > 0 && (
            <div className="project-case__tools">
              <h3>Інструменти & Технології</h3>
              <div className="tools-list">
                {project.tools.map((tool) => (
                  <span key={tool} className="tool-badge">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="project-case__navigation">
            {prevProject && (
              <Link to={`/project/${prevProject.id}`} className="nav-project nav-project--prev">
                <span className="nav-label">← Попередній</span>
                <span className="nav-title">{prevProject.title}</span>
              </Link>
            )}

            {nextProject && (
              <Link to={`/project/${nextProject.id}`} className="nav-project nav-project--next">
                <span className="nav-label">Наступний →</span>
                <span className="nav-title">{nextProject.title}</span>
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      <Footer />
    </>
  );
}

export default ProjectCase;
