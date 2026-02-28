import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './Hero.scss';

function Hero({ settings }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let animationId;

    // Set canvas size
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
          this.speedX *= -1;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY *= -1;
        }

        // Mouse interaction (parallax)
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          this.x -= dx * 0.01;
          this.y -= dy * 0.01;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(123, 47, 247, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.strokeStyle = `rgba(123, 47, 247, ${
              0.2 * (1 - distance / 120)
            })`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    }
    animate();

    // Mouse move handler
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToWorks = () => {
    const element = document.getElementById('works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' }
    }
  };

  return (
    <section id="hero" className="hero">
      <canvas ref={canvasRef} className="hero__canvas"></canvas>

      <div className="container">
        <motion.div
          className="hero__content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero__label" variants={itemVariants}>
            3D Аніматор & Motion Дизайнер
          </motion.div>

          <motion.h1 className="hero__title" variants={itemVariants}>
            <span className="gradient-text">
              {settings?.heroTitle || 'ELIZAVETA ANTONIUK'}
            </span>
          </motion.h1>

          <motion.p className="hero__subtitle" variants={itemVariants}>
            {settings?.heroSubtitle || 'Creating high-end visual experiences'}
          </motion.p>

          <motion.div className="hero__buttons" variants={itemVariants}>
            <button className="btn btn-primary" onClick={scrollToWorks}>
              Переглянути Роботи
            </button>
            <button className="btn btn-outline" onClick={scrollToContact}>
              Зв'язатися
            </button>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll-indicator"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7 }}
      >
        <div className="hero__scroll-arrow animate-bounce">↓</div>
        <span>Прокрутіть для огляду</span>
      </motion.div>
    </section>
  );
}

export default Hero;
