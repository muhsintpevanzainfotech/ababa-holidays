import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  Bell, Check, Trash2, Clock, Info, AlertTriangle, 
  CheckCircle, XCircle, ChevronRight, Briefcase, Building, 
  Package, UserCheck, HelpCircle 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const NotificationDropdown = ({ isOpen, onClose, onUpdateCount }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const rawData = res.data?.data || res.data || [];
      const list = Array.isArray(rawData) ? rawData : [];
      const sorted = list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNotifications(sorted);
      if (onUpdateCount) {
        onUpdateCount(sorted.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveAdminNotificationLink = (notif) => {
    if (notif?.link) {
      if (notif.link === '/enquiries') return '/website/enquiries';
      if (notif.link === '/contact' || notif.link === '/contacts' || notif.link === '/contact-us') return '/website/contact-us';
      if (notif.link === '/reviews' || notif.link === '/testimonials') return '/website/testimonials';
      return notif.link;
    }
    const cat = (notif?.category || '').toLowerCase();
    const title = (notif?.title || '').toLowerCase();
    if (cat.includes('vendor') || cat.includes('partner') || title.includes('vendor') || title.includes('partner')) return '/vendors';
    if (cat.includes('enquiry')) return '/website/enquiries';
    if (cat.includes('contact')) return '/website/contact-us';
    if (cat.includes('booking')) return '/bookings';
    if (cat.includes('request') || cat.includes('complaint')) return '/complaints';
    if (cat.includes('review') || cat.includes('testimonial')) return '/website/testimonials';
    if (cat.includes('payment') || cat.includes('wallet')) return '/payments';
    if (cat.includes('user')) return '/users';
    return '/dashboard';
  };

  const markAsRead = async (id, targetLink) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => {
        const next = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
        if (onUpdateCount) {
          onUpdateCount(next.filter(n => !n.isRead).length);
        }
        return next;
      });
      if (targetLink) {
        navigate(targetLink);
        onClose();
      }
    } catch (error) {
      showToast('Error', 'Failed to mark notification as read', 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      if (onUpdateCount) onUpdateCount(0);
      showToast('Success', 'All notifications marked as read', 'success');
    } catch (error) {
      showToast('Error', 'Failed to mark all as read', 'error');
    }
  };

  const clearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      if (onUpdateCount) onUpdateCount(0);
      showToast('Success', 'Notifications cleared', 'success');
    } catch (error) {
      showToast('Error', 'Failed to clear notifications', 'error');
    }
  };

  const getIcon = (type, category = '', title = '') => {
    const cat = (category || '').toLowerCase();
    const t = (title || '').toLowerCase();
    if (cat.includes('vendor') || cat.includes('partner') || t.includes('vendor') || t.includes('partner')) {
      return <Briefcase size={16} color="var(--primary)" />;
    }
    if (cat.includes('booking') || t.includes('booking')) {
      return <Package size={16} color="#10b981" />;
    }
    if (cat.includes('enquiry') || t.includes('enquiry')) {
      return <HelpCircle size={16} color="#8b5cf6" />;
    }
    switch (type) {
      case 'success': return <CheckCircle size={16} color="#10b981" />;
      case 'warning': return <AlertTriangle size={16} color="#f59e0b" />;
      case 'error': return <XCircle size={16} color="#ef4444" />;
      default: return <Info size={16} color="#3b82f6" />;
    }
  };

  const getCategoryBadge = (category = '', title = '') => {
    const cat = (category || '').toLowerCase();
    const t = (title || '').toLowerCase();
    if (cat.includes('vendor') || cat.includes('partner') || t.includes('vendor') || t.includes('partner')) {
      return { label: 'VENDOR', bg: 'rgba(var(--primary-rgb), 0.12)', color: 'var(--primary)' };
    }
    if (cat.includes('booking') || t.includes('booking')) {
      return { label: 'BOOKING', bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981' };
    }
    if (cat.includes('enquiry') || t.includes('enquiry')) {
      return { label: 'ENQUIRY', bg: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' };
    }
    if (cat.includes('contact') || t.includes('contact')) {
      return { label: 'CONTACT', bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706' };
    }
    return null;
  };


  const formatTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  const displayList = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={onClose} />
      <div className="scale-up" style={{ 
        position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '380px', 
        background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.25)', zIndex: 100, overflow: 'hidden'
      }}>
        {/* Header Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>System Notifications</h3>
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px' }}>
                {unreadCount} NEW
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={markAllRead} 
              title="Mark all as read" 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--primary)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
            >
              <Check size={16} />
            </button>
            <button 
              onClick={clearAll} 
              title="Clear all notifications" 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-main)', padding: '4px' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              flex: 1, padding: '6px 12px', border: 'none', background: filter === 'all' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'all' ? 'var(--text-main)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            style={{
              flex: 1, padding: '6px 12px', border: 'none', background: filter === 'unread' ? 'var(--bg-card)' : 'transparent',
              color: filter === 'unread' ? '#ef4444' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: '700', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notification List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Loading notifications...
            </div>
          ) : displayList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={24} color="var(--text-muted)" />
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '700', margin: 0 }}>No Notifications</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
                {filter === 'unread' ? 'You have read all notifications!' : 'Your notification log is clear.'}
              </p>
            </div>
          ) : (
            displayList.map((notif) => (
              <div 
                key={notif._id} 
                onClick={() => markAsRead(notif._id, resolveAdminNotificationLink(notif))}
                style={{ 
                  padding: '14px 18px', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: notif.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                  transition: 'background 0.2s ease', position: 'relative'
                }}
              >
                {!notif.isRead && (
                  <div style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                )}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px', padding: '6px', borderRadius: '8px', background: 'var(--bg-main)', flexShrink: 0 }}>
                    {getIcon(notif.type, notif.category, notif.title)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                        {(() => {
                          const badge = getCategoryBadge(notif.category, notif.title);
                          return badge ? (
                            <span style={{ 
                              fontSize: '9px', 
                              fontWeight: '800', 
                              padding: '1px 5px', 
                              borderRadius: '4px', 
                              background: badge.bg, 
                              color: badge.color, 
                              letterSpacing: '0.04em',
                              flexShrink: 0 
                            }}>
                              {badge.label}
                            </span>
                          ) : null;
                        })()}
                        <p style={{ fontSize: '13px', fontWeight: '800', margin: 0, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {notif.title}
                        </p>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                        <Clock size={10} /> {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {notif.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Link */}
        <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border)', background: 'var(--bg-main)' }}>
          <button 
            onClick={() => { navigate('/website/enquiries'); onClose(); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All Enquiries & Messages</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
