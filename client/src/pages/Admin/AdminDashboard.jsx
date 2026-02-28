import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { statsAPI } from '../../utils/api';
import AdminLayout from './AdminLayout';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.get();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-center" style={{ minHeight: '400px' }}>
          <div className="spinner"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Панель керування — Адмін</title>
      </Helmet>

      <AdminLayout>
        <h1 className="admin-title">Панель керування</h1>

        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Всього відвідувань</div>
            <div className="stat-value">{stats?.totalVisits || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Всього проєктів</div>
            <div className="stat-value">{stats?.totalProjects || 0}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Непрочитані повідомлення</div>
            <div className="stat-value">{stats?.unreadMessages || 0}</div>
            {stats?.unreadMessages > 0 && (
              <Link to="/admin/messages" className="stat-link">Переглянути повідомлення →</Link>
            )}
          </div>

          <div className="stat-card">
            <div className="stat-label">Найпопулярніший проєкт</div>
            <div className="stat-value">{stats?.mostViewedProject?.title || 'Немає даних'}</div>
            {stats?.mostViewedProject && (
              <div className="stat-meta">{stats.mostViewedProject.views} переглядів</div>
            )}
          </div>
        </div>

        <div className="admin-quick-actions">
          <h2>Швидкі дії</h2>
          <div className="quick-actions-grid">
            <Link to="/admin/projects" className="btn btn-primary">
              Керувати проєктами
            </Link>
            <Link to="/admin/messages" className="btn btn-outline">
              Переглянути повідомлення
            </Link>
            <Link to="/admin/settings" className="btn btn-ghost">
              Налаштування
            </Link>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}

export default AdminDashboard;
