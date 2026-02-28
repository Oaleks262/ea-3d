import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { messagesAPI } from '../../utils/api';
import AdminLayout from './AdminLayout';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await messagesAPI.getAll();
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await messagesAPI.markRead(id);
      setMessages(messages.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Ви впевнені, що хочете видалити це повідомлення?')) return;

    try {
      await messagesAPI.delete(id);
      setMessages(messages.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Повідомлення — Адмін</title>
      </Helmet>

      <AdminLayout>
        <h1 className="admin-title">Повідомлення</h1>

        {loading ? (
          <div className="flex-center" style={{ minHeight: '400px' }}>
            <div className="spinner"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="admin-empty">
            <p>Поки що немає повідомлень.</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(message => (
              <div key={message.id} className={`message-card ${message.read ? 'read' : 'unread'}`}>
                <div className="message-header">
                  <div>
                    <strong>{message.name}</strong>
                    <span className="badge">{message.requestType}</span>
                  </div>
                  <span className="message-date">{new Date(message.receivedAt).toLocaleDateString('uk-UA')}</span>
                </div>
                <div className="message-email">{message.email}</div>
                <div className="message-text">{message.message}</div>
                <div className="message-actions">
                  <a href={`mailto:${message.email}`} className="btn btn-primary btn-sm">Відповісти</a>
                  {!message.read && (
                    <button onClick={() => handleMarkRead(message.id)} className="btn btn-ghost btn-sm">
                      Позначити як прочитане
                    </button>
                  )}
                  <button onClick={() => handleDelete(message.id)} className="btn btn-ghost btn-sm">
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
}

export default AdminMessages;
