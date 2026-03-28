import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './Process.scss';

function Process({ settings }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const fallbackSteps = [
    {
      title: 'Дослідження',
      description: 'Розуміння цілей проєкту, цільової аудиторії та збір візуальних референсів для створення міцного фундаменту.'
    },
    {
      title: 'Концепція',
      description: 'Розробка початкових ескізів, мудбордів та 3D блокаутів для візуалізації творчого напрямку.'
    },
    {
      title: 'Виробництво',
      description: 'Втілення концепції в життя через моделювання, текстурування, освітлення, анімацію та рендеринг.'
    },
    {
      title: 'Фінальна Обробка',
      description: 'Композитинг, колірна корекція, додавання VFX, звуковий дизайн та фінальний експорт для доставки.'
    }
  ];

  const rawSteps = settings?.processSteps || fallbackSteps;
  const steps = rawSteps.map((step, index) => ({
    ...step,
    number: String(index + 1).padStart(2, '0')
  }));

  const processTitle = settings?.processTitle || 'Від Концепції до Реальності';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  return (
    <section id="process" className="process section" ref={sectionRef}>
      <div className="container">
        <motion.div
          className="process__header"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="badge">Мій Процес</div>
          <h2 className="process__title">
            {processTitle}
          </h2>
        </motion.div>

        <motion.div
          className="process__steps"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="process__step"
              variants={stepVariants}
            >
              <div className="step-number">{step.number}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <svg className="step-connector" viewBox="0 0 100 100">
                  <motion.line
                    x1="50"
                    y1="0"
                    x2="50"
                    y2="100"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={isInView ? { pathLength: 1 } : {}}
                    transition={{ duration: 0.8, delay: index * 0.2 + 0.5 }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'var(--color-primary)' }} />
                      <stop offset="100%" style={{ stopColor: 'var(--color-accent)' }} />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default Process;
