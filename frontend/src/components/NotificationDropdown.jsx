import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Bell, Check, Trash2, Clock, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      showToast('Error', 'Failed to mark as read', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      showToast('Success', 'All notifications marked as read', 'success');
    } catch (error) {
      showToast('Error', 'Failed to mark all as read', 'error');
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      showToast('Success', 'Notifications cleared', 'success');
    } catch (error) {
      showToast('Error', 'Failed to clear notifications', 'error');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      case 'warning': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'error': return <XCircle size={16} color="#ef4444" />;
      default: return <Info size={16} color="#3b82f6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
      <div className="scale-up" style={{ 
        position: 'absolute', top: '120%', right: 0, width: '350px', 
        background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-main)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Notifications</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={markAllRead} title="Mark all as read" style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Check size={18} />
            </button>
            <button onClick={clearAll} title="Clear all" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Bell size={40} color="var(--border)" style={{ marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>All caught up!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif._id} 
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                style={{ 
                  padding: '16px 20px', borderBottom: '1px solid var(--border)',
                  cursor: notif.isRead ? 'default' : 'pointer',
                  background: notif.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.05)',
                  transition: '0.2s', position: 'relative'
                }}
              >
                {!notif.isRead && (
                  <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                )}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '4px' }}>
                  <div style={{ marginTop: '2px' }}>{getIcon(notif.type)}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' }}>{notif.title}</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: '1.4' }}>{notif.message}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} /> {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            View Full History
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
