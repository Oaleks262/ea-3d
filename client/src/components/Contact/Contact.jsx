import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { messagesAPI } from '../../utils/api';
import './Contact.scss';

function Contact({ settings }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestType: 'Collaboration',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const requestTypes = ['Співпраця', 'Пропозиція роботи', 'Комерційний проєкт', 'Інше'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ім'я обов'язкове";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email обов'язковий";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Невірна email адреса';
    }

    if (!formData.message.trim()) {
      newErrors.message = "Повідомлення обов'язкове";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Повідомлення має бути не менше 10 символів';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await messagesAPI.submit(formData);

      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        requestType: 'Collaboration',
        message: ''
      });
      setErrors({});

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Failed to send message' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <motion.div
          className="contact__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="badge">Зв'яжіться</div>
          <h2 className="contact__title">
            {settings?.contactTitleMain || 'Створимо Щось'}{' '}
            <span className="gradient-text">{settings?.contactTitleAccent || 'Дивовижне'}</span>
          </h2>
          <p className="contact__subtitle">
            {settings?.contactSubtitle || 'Маєте проєкт? Буду рада почути про нього. Напишіть мені і обговоримо, як втілити вашу ідею в життя.'}
          </p>
        </motion.div>

        <motion.form
          className="contact__form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Ім'я *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input ${errors.name ? 'error' : ''}`}
                placeholder="Ваше ім'я"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="your@email.com"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="requestType">Тип запиту</label>
            <select
              id="requestType"
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              className="select"
            >
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="message">Повідомлення *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className={`textarea ${errors.message ? 'error' : ''}`}
              placeholder="Розкажіть про ваш проєкт..."
              rows="6"
            ></textarea>
            {errors.message && <span className="error">{errors.message}</span>}
          </div>

          {errors.submit && <div className="form-error">{errors.submit}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Відправка...' : 'Надіслати'}
          </button>
        </motion.form>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="success-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="success-modal__content">
                <div className="success-icon">✓</div>
                <h3>Повідомлення Надіслано!</h3>
                <p>Дякую за звернення. Відповім вам протягом 24 годин.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default Contact;
