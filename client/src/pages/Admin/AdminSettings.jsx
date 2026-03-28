import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { settingsAPI, authAPI } from '../../utils/api';
import AdminLayout from './AdminLayout';
import axios from 'axios';

function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleStatsChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      stats: { ...prev.stats, [field]: parseInt(value) || 0 }
    }));
  };

  const handleSocialChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value }
    }));
  };

  const handleSmtpChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      smtp: { ...prev.smtp, [field]: value }
    }));
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    setSettings(prev => ({
      ...prev,
      skills: [...(prev.skills || []), trimmed]
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (index) => {
    setSettings(prev => ({
      ...prev,
      skills: (prev.skills || []).filter((_, i) => i !== index)
    }));
  };

  const handleProcessStepChange = (index, field, value) => {
    setSettings(prev => {
      const steps = [...(prev.processSteps || [])];
      steps[index] = { ...steps[index], [field]: value };
      return { ...prev, processSteps: steps };
    });
  };

  const handleAddProcessStep = () => {
    setSettings(prev => ({
      ...prev,
      processSteps: [...(prev.processSteps || []), { title: '', description: '' }]
    }));
  };

  const handleRemoveProcessStep = (index) => {
    setSettings(prev => ({
      ...prev,
      processSteps: (prev.processSteps || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await settingsAPI.update(settings);

      // Update CSS variables for colors
      document.documentElement.style.setProperty('--color-primary', settings.colorPrimary);
      document.documentElement.style.setProperty('--color-accent', settings.colorAccent);

      // Gradients will update automatically since they use var(--color-primary) and var(--color-accent)

      alert('Налаштування збережено успішно!');

      // Reload page to apply colors everywhere
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Не вдалося зберегти налаштування');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Паролі не співпадають');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Пароль має бути не менше 6 символів');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      alert('Пароль змінено успішно!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      if (error.response?.status === 401) {
        setPasswordError('Поточний пароль невірний');
      } else {
        setPasswordError('Не вдалося змінити пароль. Спробуйте ще раз.');
      }
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
        <title>Налаштування — Адмін</title>
      </Helmet>

      <AdminLayout>
        <h1 className="admin-title">Налаштування</h1>

        <form onSubmit={handleSubmit} className="admin-form">
          <h3>Hero Секція</h3>

          <div className="form-group">
            <label>Заголовок Hero</label>
            <input
              type="text"
              className="input"
              value={settings.heroTitle || ''}
              onChange={(e) => handleChange('heroTitle', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Підзаголовок Hero</label>
            <input
              type="text"
              className="input"
              value={settings.heroSubtitle || ''}
              onChange={(e) => handleChange('heroSubtitle', e.target.value)}
            />
          </div>

          <h3>Про мене</h3>

          <div className="form-group">
            <label>Біографія</label>
            <textarea
              className="textarea"
              rows="4"
              value={settings.aboutBio || ''}
              onChange={(e) => handleChange('aboutBio', e.target.value)}
            ></textarea>
          </div>

          <h3>Заголовок секції Про мене</h3>

          <div className="form-group">
            <label>Основний текст заголовку</label>
            <input
              type="text"
              className="input"
              value={settings.aboutTitleMain || ''}
              onChange={(e) => handleChange('aboutTitleMain', e.target.value)}
              placeholder="Створюю Візуальні Історії Через"
            />
          </div>

          <div className="form-group">
            <label>Акцентний текст заголовку (виділяється градієнтом)</label>
            <input
              type="text"
              className="input"
              value={settings.aboutTitleAccent || ''}
              onChange={(e) => handleChange('aboutTitleAccent', e.target.value)}
              placeholder="3D & Motion"
            />
          </div>

          <h3>Навички</h3>

          <div className="form-group">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              {(settings.skills || []).map((skill, index) => (
                <div
                  key={index}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.3rem 0.7rem',
                    background: 'rgba(123,47,247,0.15)',
                    border: '1px solid rgba(123,47,247,0.4)',
                    borderRadius: '20px',
                    fontSize: '0.875rem'
                  }}
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#FF2FD1',
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      lineHeight: 1,
                      padding: 0
                    }}
                    aria-label={`Видалити ${skill}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="input"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                placeholder="Назва навички"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleAddSkill}
              >
                Додати
              </button>
            </div>
          </div>

          <h3>Статистика</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Кількість проектів</label>
              <input
                type="number"
                className="input"
                value={settings.stats?.projects || 0}
                onChange={(e) => handleStatsChange('projects', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Кількість клієнтів</label>
              <input
                type="number"
                className="input"
                value={settings.stats?.clients || 0}
                onChange={(e) => handleStatsChange('clients', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Років досвіду</label>
              <input
                type="number"
                className="input"
                value={settings.stats?.years || 0}
                onChange={(e) => handleStatsChange('years', e.target.value)}
              />
            </div>
          </div>

          <h3>Процес</h3>

          <div className="form-group">
            <label>Заголовок секції</label>
            <input
              type="text"
              className="input"
              value={settings.processTitle || ''}
              onChange={(e) => handleChange('processTitle', e.target.value)}
              placeholder="Від Концепції до Реальності"
            />
          </div>

          {(settings.processSteps || []).map((step, index) => (
            <div
              key={index}
              style={{
                padding: '1rem',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ opacity: 0.7 }}>Крок {String(index + 1).padStart(2, '0')}</strong>
                {(settings.processSteps || []).length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => handleRemoveProcessStep(index)}
                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: '#FF2FD1' }}
                  >
                    Видалити
                  </button>
                )}
              </div>
              <div className="form-group">
                <label>Назва</label>
                <input
                  type="text"
                  className="input"
                  value={step.title || ''}
                  onChange={(e) => handleProcessStepChange(index, 'title', e.target.value)}
                  placeholder="Назва кроку"
                />
              </div>
              <div className="form-group">
                <label>Опис</label>
                <textarea
                  className="textarea"
                  rows="3"
                  value={step.description || ''}
                  onChange={(e) => handleProcessStepChange(index, 'description', e.target.value)}
                  placeholder="Опис кроку"
                ></textarea>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleAddProcessStep}
            style={{ marginBottom: '1.5rem' }}
          >
            + Додати крок
          </button>

          <h3>Соціальні мережі</h3>

          <div className="form-group">
            <label>Behance URL</label>
            <input
              type="url"
              className="input"
              value={settings.socialLinks?.behance || ''}
              onChange={(e) => handleSocialChange('behance', e.target.value)}
              placeholder="https://behance.net/username"
            />
          </div>

          <div className="form-group">
            <label>Instagram URL</label>
            <input
              type="url"
              className="input"
              value={settings.socialLinks?.instagram || ''}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              placeholder="https://instagram.com/username"
            />
          </div>

          <div className="form-group">
            <label>LinkedIn URL</label>
            <input
              type="url"
              className="input"
              value={settings.socialLinks?.linkedin || ''}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <h3>Налаштування Email (SMTP)</h3>

          <div className="form-group">
            <label>Email адміністратора (куди будуть приходити повідомлення)</label>
            <input
              type="email"
              className="input"
              value={settings.adminEmail || ''}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label>SMTP Хост</label>
            <input
              type="text"
              className="input"
              value={settings.smtp?.host || ''}
              onChange={(e) => handleSmtpChange('host', e.target.value)}
              placeholder="smtp.gmail.com"
            />
            <small>Наприклад: smtp.gmail.com, smtp.ukr.net, smtp-mail.outlook.com</small>
          </div>

          <div className="form-group">
            <label>SMTP Порт</label>
            <input
              type="number"
              className="input"
              value={settings.smtp?.port || '587'}
              onChange={(e) => handleSmtpChange('port', e.target.value)}
              placeholder="587"
            />
            <small>Зазвичай 587 (TLS) або 465 (SSL)</small>
          </div>

          <div className="form-group">
            <label>Email відправника</label>
            <input
              type="email"
              className="input"
              value={settings.smtp?.user || ''}
              onChange={(e) => handleSmtpChange('user', e.target.value)}
              placeholder="your-email@gmail.com"
            />
            <small>Email з якого будуть відправлятись листи</small>
          </div>

          <div className="form-group">
            <label>Пароль SMTP</label>
            <input
              type="password"
              className="input"
              value={settings.smtp?.password || ''}
              onChange={(e) => handleSmtpChange('password', e.target.value)}
              placeholder="••••••••"
            />
            <small>Для Gmail використовуйте App Password (пароль програми), не основний пароль</small>
          </div>

          <h3>Колористика сайту</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Основний колір (Primary)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={settings.colorPrimary || '#7B2FF7'}
                  onChange={(e) => handleChange('colorPrimary', e.target.value)}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="input"
                  value={settings.colorPrimary || '#7B2FF7'}
                  onChange={(e) => handleChange('colorPrimary', e.target.value)}
                  placeholder="#7B2FF7"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Акцентний колір (Accent)</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={settings.colorAccent || '#FF2FD1'}
                  onChange={(e) => handleChange('colorAccent', e.target.value)}
                  style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="input"
                  value={settings.colorAccent || '#FF2FD1'}
                  onChange={(e) => handleChange('colorAccent', e.target.value)}
                  placeholder="#FF2FD1"
                />
              </div>
            </div>
          </div>

          <div className="color-preview" style={{
            marginTop: '1rem',
            padding: '1rem',
            background: `linear-gradient(135deg, ${settings.colorPrimary || '#7B2FF7'} 0%, ${settings.colorAccent || '#FF2FD1'} 100%)`,
            borderRadius: '8px',
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            Попередній перегляд градієнту
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '2rem' }}>
            {saving ? 'Збереження...' : 'Зберегти налаштування'}
          </button>
        </form>

        <hr style={{ margin: '3rem 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

        <div className="password-section">
          <h2 style={{ marginBottom: '1rem' }}>Безпека</h2>

          {!showPasswordForm ? (
            <button
              className="btn btn-outline"
              onClick={() => setShowPasswordForm(true)}
            >
              Змінити пароль
            </button>
          ) : (
            <form onSubmit={handlePasswordChange} className="admin-form" style={{ maxWidth: '500px' }}>
              <div className="form-group">
                <label>Поточний пароль</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Новий пароль</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label>Підтвердити новий пароль</label>
                <input
                  type="password"
                  className="input"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              {passwordError && <div className="form-error">{passwordError}</div>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">
                  Змінити пароль
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordError('');
                  }}
                >
                  Скасувати
                </button>
              </div>
            </form>
          )}
        </div>
      </AdminLayout>
    </>
  );
}

export default AdminSettings;
