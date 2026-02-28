import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { projectsAPI } from '../../utils/api';
import AdminLayout from './AdminLayout';
import ProjectForm from './ProjectForm';

function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

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

  const handleAddNew = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити цей проєкт?')) return;

    try {
      await projectsAPI.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Не вдалося видалити проєкт');
    }
  };

  const handleSave = (savedProject) => {
    if (editingProject) {
      // Update existing
      setProjects(projects.map(p => p.id === savedProject.id ? savedProject : p));
    } else {
      // Add new
      setProjects([...projects, savedProject]);
    }
  };

  return (
    <>
      <Helmet>
        <title>Проєкти — Адмін</title>
      </Helmet>

      <AdminLayout>
        <div className="admin-header">
          <h1 className="admin-title">Проєкти</h1>
          <button className="btn btn-primary" onClick={handleAddNew}>
            + Додати проєкт
          </button>
        </div>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="admin-empty">
            <p>Поки що немає проєктів. Створіть перший проєкт!</p>
            <button className="btn btn-primary" onClick={handleAddNew} style={{ marginTop: '1rem' }}>
              Додати перший проєкт
            </button>
          </div>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Мініатюра</th>
                  <th>Назва</th>
                  <th>Категорія</th>
                  <th>Обране</th>
                  <th>Порядок</th>
                  <th>Дії</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id}>
                    <td>
                      {project.thumbnailUrl ? (
                        <img
                          src={project.thumbnailUrl}
                          alt={project.title}
                          style={{
                            width: '80px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '80px',
                          height: '60px',
                          background: '#333',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: '#666'
                        }}>
                          Немає фото
                        </div>
                      )}
                    </td>
                    <td><strong>{project.title}</strong></td>
                    <td><span className="badge">{project.category}</span></td>
                    <td>{project.featured ? '★ Так' : 'Ні'}</td>
                    <td>{project.order}</td>
                    <td>
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(project)}
                        title="Редагувати"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => handleDelete(project.id)}
                        title="Видалити"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showForm && (
          <ProjectForm
            project={editingProject}
            onClose={() => setShowForm(false)}
            onSave={handleSave}
          />
        )}
      </AdminLayout>
    </>
  );
}

export default AdminProjects;
