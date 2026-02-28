import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/Admin.scss';

function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <img src="/logo.png" alt="Logo" />
          <h3>Панель адміністратора</h3>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'active' : ''}>
            Панель керування
          </NavLink>
          <NavLink to="/admin/projects" className={({ isActive }) => isActive ? 'active' : ''}>
            Проєкти
          </NavLink>
          <NavLink to="/admin/messages" className={({ isActive }) => isActive ? 'active' : ''}>
            Повідомлення
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            Налаштування
          </NavLink>
        </nav>

        <button onClick={handleLogout} className="admin-logout">
          Вийти
        </button>
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
