import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import '../styles/pages/NotFound.scss';

function NotFound() {
  return (
    <>
      <Helmet>
        <title>404 — Page Not Found</title>
      </Helmet>

      <div className="not-found">
        <motion.div
          className="not-found__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated 3D Shape */}
          <motion.div
            className="not-found__shape"
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className="shape-cube">
              <div className="cube-face cube-front"></div>
              <div className="cube-face cube-back"></div>
              <div className="cube-face cube-right"></div>
              <div className="cube-face cube-left"></div>
              <div className="cube-face cube-top"></div>
              <div className="cube-face cube-bottom"></div>
            </div>
          </motion.div>

          <h1 className="not-found__title">404</h1>
          <h2 className="not-found__subtitle">Загубилися?</h2>
          <p className="not-found__text">
            Сторінка, яку ви шукаєте, не існує або була переміщена в іншу реальність.
          </p>

          <Link to="/" className="btn btn-primary">
            На Головну
          </Link>
        </motion.div>
      </div>
    </>
  );
}

export default NotFound;
