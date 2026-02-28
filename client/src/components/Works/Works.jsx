import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { projectsAPI } from '../../utils/api';
import ProjectCard from './ProjectCard';
import './Works.scss';

function Works() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Усі');

  const filters = ['Усі', '3D Анімація', 'Motion', 'Комерційні', 'Брендинг'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map Ukrainian filter names to English category names
  const categoryMap = {
    'Усі': 'All',
    '3D Анімація': '3D Animation',
    'Motion': 'Motion',
    'Комерційні': 'Commercial',
    'Брендинг': 'Branding'
  };

  const filteredProjects =
    activeFilter === 'Усі'
      ? projects
      : projects.filter((p) => p.category === categoryMap[activeFilter] || p.category === activeFilter);

  return (
    <section id="works" className="works section">
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="works__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge">Портфоліо</div>
          <h2 className="works__title">
            Обрані <span className="gradient-text">Роботи</span>
          </h2>
          <p className="works__subtitle">
            Ознайомтеся з моїми останніми проєктами в 3D анімації, motion дизайні та візуальних ефектах
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          className="works__filters"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filters.map((filter) => (
            <button
              key={filter}
              className={`works__filter ${
                activeFilter === filter ? 'works__filter--active' : ''
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        {loading ? (
          <div className="works__loading">
            <div className="spinner"></div>
            <p>Завантаження проєктів...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            className="works__empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p>У цій категорії немає проєктів.</p>
          </motion.div>
        ) : (
          <div className="works__grid">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Works;
