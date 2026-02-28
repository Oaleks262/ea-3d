import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Works.scss';

function ProjectCard({ project, index }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && project.previewVideoUrl) {
      videoRef.current.play().catch(() => {
        // Handle autoplay block silently
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <motion.article
      className="project-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      <div className="card-media">
        {/* Thumbnail Image */}
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className={`card-thumbnail ${isHovered ? 'hidden' : 'visible'}`}
          loading="lazy"
        />

        {/* Preview Video (shown on hover) */}
        {project.previewVideoUrl && (
          <video
            ref={videoRef}
            src={project.previewVideoUrl}
            className={`card-preview ${isHovered ? 'visible' : 'hidden'}`}
            muted
            loop
            playsInline
            preload="none"
          />
        )}

        {/* Glow Border on Hover */}
        <div className={`card-glow ${isHovered ? 'active' : ''}`}></div>
      </div>

      <div className="card-overlay">
        <span className="category">{project.category}</span>
        <h3 className="title">{project.title}</h3>
        <div className="view-btn">
          Переглянути <span>→</span>
        </div>
      </div>

      {project.featured && (
        <div className="featured-badge">
          <span>★ Рекомендований</span>
        </div>
      )}
    </motion.article>
  );
}

export default ProjectCard;
