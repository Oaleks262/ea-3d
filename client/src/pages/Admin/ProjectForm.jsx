import { useState, useEffect } from 'react';
import { projectsAPI, uploadAPI, settingsAPI } from '../../utils/api';

function ProjectForm({ project, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '3D Animation',
    description: '',
    challenge: '',
    solution: '',
    tools: [],
    thumbnailUrl: '',
    previewVideoUrl: '',
    fullVideoUrl: '',
    featured: false,
    order: 0
  });

  const [categories, setCategories] = useState(['3D Animation', 'Motion', 'Commercial', 'Branding']);
  const [toolInput, setToolInput] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData(project);
    }
    settingsAPI.get().then(res => {
      if (res.data.projectCategories?.length) {
        setCategories(res.data.projectCategories);
      }
    }).catch(() => {});
  }, [project]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTool = () => {
    if (toolInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tools: [...prev.tools, toolInput.trim()]
      }));
      setToolInput('');
    }
  };

  const handleRemoveTool = (index) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index)
    }));
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) return;

    setUploading(true);
    try {
      const response = await uploadAPI.thumbnail(thumbnailFile);
      setFormData(prev => ({ ...prev, thumbnailUrl: response.data.thumbnailUrl }));
      setThumbnailFile(null);
      alert('Мініатюру завантажено успішно!');
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Невідома помилка';
      alert('Помилка завантаження мініатюри: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handlePreviewUpload = async () => {
    if (!previewFile) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const response = await uploadAPI.preview(previewFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      setFormData(prev => ({ ...prev, previewVideoUrl: response.data.previewVideoUrl }));
      setPreviewFile(null);
      setUploadProgress(0);
      alert('Попереднє відео завантажено успішно!');
    } catch (error) {
      console.error('Preview video upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Невідома помилка';
      alert('Помилка завантаження відео: ' + errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title) {
      alert('Будь ласка, введіть назву проєкту');
      return;
    }

    if (!formData.category) {
      alert('Будь ласка, оберіть категорію');
      return;
    }

    if (!formData.description) {
      alert('Будь ласка, введіть опис проєкту');
      return;
    }

    if (!formData.thumbnailUrl) {
      alert('Будь ласка, завантажте мініатюру (фото)');
      return;
    }

    if (!formData.fullVideoUrl) {
      alert('Будь ласка, введіть URL повного відео');
      return;
    }

    setSaving(true);
    try {
      let savedProject;
      if (project) {
        const response = await projectsAPI.update(project.id, formData);
        savedProject = response.data;
      } else {
        const response = await projectsAPI.create(formData);
        savedProject = response.data;
      }
      onSave(savedProject);
      onClose();
      alert('Проєкт успішно збережено!');
    } catch (error) {
      console.error('Project save error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Невідома помилка';
      alert('Помилка збереження проєкту: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="project-form-overlay" onClick={onClose}>
      <div className="project-form" onClick={(e) => e.stopPropagation()}>
        <div className="project-form__header">
          <h2>{project ? 'Редагувати проєкт' : 'Додати проєкт'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
          <div className="form-group">
            <label>Назва *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Категорія *</label>
            <select
              className="select"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Опис *</label>
            <textarea
              className="textarea"
              rows="3"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label>Завдання</label>
            <textarea
              className="textarea"
              rows="3"
              value={formData.challenge}
              onChange={(e) => handleChange('challenge', e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Рішення</label>
            <textarea
              className="textarea"
              rows="3"
              value={formData.solution}
              onChange={(e) => handleChange('solution', e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Інструменти</label>
            <div className="tools-input">
              <input
                type="text"
                className="input"
                value={toolInput}
                onChange={(e) => setToolInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTool())}
                placeholder="Додати інструмент..."
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={handleAddTool}>
                Додати
              </button>
            </div>
            <div className="tools-list">
              {formData.tools.map((tool, index) => (
                <span key={index} className="tool-tag">
                  {tool}
                  <button type="button" onClick={() => handleRemoveTool(index)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <hr />
          <h3>Медіа файли</h3>

          <div className="form-group">
            <label>Мініатюра (фото) *</label>
            {formData.thumbnailUrl && (
              <div className="media-preview">
                <img src={formData.thumbnailUrl} alt="Thumbnail" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              disabled={uploading}
            />
            {thumbnailFile && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleThumbnailUpload}
                disabled={uploading}
              >
                {uploading ? 'Завантаження...' : 'Завантажити мініатюру'}
              </button>
            )}
            <small>Будь-який формат зображення. Автоматично конвертується в WebP.</small>
          </div>

          <div className="form-group">
            <label>Попереднє відео</label>
            {formData.previewVideoUrl && (
              <div className="media-preview">
                <video src={formData.previewVideoUrl} controls muted />
              </div>
            )}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setPreviewFile(e.target.files[0])}
              disabled={uploading}
            />
            {previewFile && (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handlePreviewUpload}
                  disabled={uploading}
                >
                  {uploading ? `Завантаження... ${uploadProgress}%` : 'Завантажити відео'}
                </button>
                {uploadProgress > 0 && (
                  <div className="upload-progress">
                    <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}
              </>
            )}
            <small>Будь-який формат відео. Автоматично конвертується в WebM.</small>
          </div>

          <div className="form-group">
            <label>Повне відео URL (Vimeo/YouTube) *</label>
            <input
              type="url"
              className="input"
              value={formData.fullVideoUrl}
              onChange={(e) => handleChange('fullVideoUrl', e.target.value)}
              placeholder="https://vimeo.com/... або https://youtube.com/..."
              required
            />
          </div>

          <hr />

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => handleChange('featured', e.target.checked)}
                />
                <span>Featured (рекомендований)</span>
              </label>
            </div>

            <div className="form-group">
              <label>Порядок</label>
              <input
                type="number"
                className="input"
                value={formData.order}
                onChange={(e) => handleChange('order', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Скасувати
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
              {saving ? 'Збереження...' : 'Зберегти'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;
