import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/Admin.scss';

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('admin_saved_email');
    const savedPassword = localStorage.getItem('admin_saved_password');
    if (savedEmail && savedPassword) {
      setFormData({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);

    if (result.success) {
      // Save credentials if remember me is checked
      if (rememberMe) {
        localStorage.setItem('admin_saved_email', formData.email);
        localStorage.setItem('admin_saved_password', formData.password);
      } else {
        localStorage.removeItem('admin_saved_email');
        localStorage.removeItem('admin_saved_password');
      }
      navigate('/admin');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login — Elizaveta Antoniuk</title>
      </Helmet>

      <div className="admin-login">
        <motion.div
          className="admin-login__card glass"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="admin-login__header">
            <img src="/logo.png" alt="Logo" className="admin-login__logo" />
            <h1>Admin Portal</h1>
            <p>Sign in to manage your portfolio</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Запам'ятати мене</span>
              </label>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Вхід...' : 'Увійти'}
            </button>

            <Link to="/" className="btn btn-ghost" style={{ width: '100%', marginTop: '1rem' }}>
              ← Повернутись до сайту
            </Link>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default AdminLogin;
