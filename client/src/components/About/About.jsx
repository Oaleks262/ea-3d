import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './About.scss';

function About({ settings }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const [counters, setCounters] = useState({
    projects: 0,
    clients: 0,
    years: 0
  });

  const stats = settings?.stats || { projects: 47, clients: 32, years: 5 };

  // Animate counters when in view
  useEffect(() => {
    if (!isInView) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const interval = duration / steps;

    const animate = (key, target) => {
      let current = 0;
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCounters((prev) => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setCounters((prev) => ({ ...prev, [key]: Math.floor(current) }));
        }
      }, interval);

      return timer;
    };

    const timers = [
      animate('projects', stats.projects),
      animate('clients', stats.clients),
      animate('years', stats.years)
    ];

    return () => timers.forEach(clearInterval);
  }, [isInView, stats]);

  const skills = settings?.skills || [
    'Blender',
    'Cinema 4D',
    'After Effects',
    'Unreal Engine',
    'ZBrush',
    'Houdini',
    'Substance Painter',
    'DaVinci Resolve'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section id="about" className="about section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="about__grid"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Left Column - Text Content */}
          <motion.div className="about__content" variants={itemVariants}>
            <div className="badge">Про мене</div>

            <h2 className="about__title">
              {settings?.aboutTitleMain || 'Створюю Візуальні Історії Через'}{' '}
              <span className="gradient-text">{settings?.aboutTitleAccent || '3D & Motion'}</span>
            </h2>

            <p className="about__bio">
              {settings?.aboutBio ||
                "I'm a passionate 3D Animator and Motion Designer with years of experience creating stunning visual content for brands and agencies worldwide. I specialize in bringing ideas to life through cutting-edge animation and design."}
            </p>

            {/* Skills */}
            <motion.div className="about__skills" variants={itemVariants}>
              {skills.map((skill, index) => (
                <motion.span
                  key={skill}
                  className="about__skill"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                >
                  {skill}
                </motion.span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div className="about__stats" variants={itemVariants}>
              <div className="about__stat">
                <div className="about__stat-number">{counters.projects}+</div>
                <div className="about__stat-label">Виконаних Проєктів</div>
              </div>

              <div className="about__stat">
                <div className="about__stat-number">{counters.clients}+</div>
                <div className="about__stat-label">Задоволених Клієнтів</div>
              </div>

              <div className="about__stat">
                <div className="about__stat-number">{counters.years}+</div>
                <div className="about__stat-label">Років Досвіду</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Avatar Placeholder */}
          <motion.div className="about__visual" variants={itemVariants}>
            <div className="about__avatar-frame">
              <div className="about__avatar-glow"></div>
              <div className="about__avatar-content">
                <div className="about__avatar-icon">EA</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default About;
