import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Search,
  Bell,
  User as UserIcon,
  Menu,
  LogOut,
  Settings,
  LayoutGrid,
  Shield,
  Activity,
  Command,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useUI } from '../context/UIContext';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onToggleSidebar, isCollapsed }) => {
  const { user } = useSelector((state) => state.auth);
  const { 
    isDarkMode, 
    toggleTheme, 
    isNotificationsEnabled 
  } = useUI();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      if (!user) return;
      const { data } = await api.get('/notifications');
      if (data?.data) {
        const unread = data.data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      // Silently handle if unauthenticated
    }
  };

  const getInitials = (name) => {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/packages?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="header" style={{ height: '72px', borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)', backdropFilter: 'blur(16px)' }}>
      {/* LEFT AREA: ANIMATED SIDEBAR TOGGLE & GLOBAL SEARCH */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '500px' }}>
        
        {/* Animated Sidebar Toggle Button */}
        <button 
          className="toggle-sidebar-btn" 
          onClick={onToggleSidebar}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>


        <form onSubmit={handleSearchSubmit} className="search-wrapper" style={{ flex: 1, maxWidth: '380px' }}>
          <input 
            type="text" 
            className="form-control search-input" 
            placeholder="Search packages, vendors, bookings..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              background: 'var(--bg-main)', 
              borderRadius: '14px', 
              fontSize: '13px', 
              fontWeight: '500',
              paddingRight: '48px'
            }}
          />
          <Search size={18} />
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            padding: '2px 6px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '700',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }}>
            <Command size={10} /> K
          </div>
        </form>
      </div>

      {/* RIGHT AREA: STATUS BADGE, THEME, NOTIFICATIONS & REDESIGNED USER DIV */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Live System Health Badge */}
        <div 
          className="desktop-only" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 14px', 
            borderRadius: '20px', 
            background: 'rgba(34, 197, 94, 0.08)', 
            border: '1px solid rgba(34, 197, 94, 0.2)',
            fontSize: '12px',
            fontWeight: '700',
            color: '#16a34a'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }}></span>
          <span>System Active</span>
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          style={{ 
            background: 'var(--bg-main)', 
            border: '1px solid var(--border)', 
            color: 'var(--text-main)', 
            cursor: 'pointer', 
            width: '40px', 
            height: '40px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#6366f1" />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              background: 'var(--bg-main)', 
              border: '1px solid var(--border)', 
              color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-main)', 
              cursor: 'pointer', 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.2s ease'
            }}
            title="Notifications"
          >
            <Bell size={19} />
            {isNotificationsEnabled && unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '-2px', right: '-2px', width: '18px', height: '18px', 
                background: '#ef4444', color: '#ffffff', borderRadius: '50%', border: '2px solid var(--bg-card)',
                fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown 
            isOpen={showNotifications} 
            onClose={() => setShowNotifications(false)} 
            onUpdateCount={(count) => setUnreadCount(count)} 
          />
        </div>

        {/* TOPBAR USER PROFILE CARD: SMALL ROUND AVATAR & STACKED TEXT (NAME TOP, ROLE DOWN) */}
        <div style={{ position: 'relative' }}>
          <div 
            className="topbar-user-card"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {/* Small Round Avatar */}
            <div className="user-avatar-round">
              <div className="user-avatar-round-inner">
                {user?.avatar ? (
                  <img 
                    src={getImageUrl(user.avatar)} 
                    alt="" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <span className="user-online-badge"></span>
            </div>

            {/* Stacked Name (Top) & Role (Down Small) */}
            <div className="user-text-container desktop-only">
              <span className="user-name-text">
                {user?.name || 'Muhsin Admin'}
              </span>
              <span className="user-role-text">
                {user?.role || 'ADMIN'}
              </span>
            </div>

            <ChevronDown 
              size={14} 
              style={{ 
                color: 'var(--text-muted)', 
                transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' 
              }} 
            />
          </div>

          {/* User Profile Dropdown */}
          {showDropdown && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                onClick={() => setShowDropdown(false)} 
              />
              <div className="dropdown-menu fade-in" style={{ minWidth: '260px', top: 'calc(100% + 12px)', right: 0 }}>
                {/* Header card inside dropdown */}
                <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{ fontSize: '14px', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{user?.name || 'Administrator'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@ababa-travels.com'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '8px', borderTop: '1px solid var(--border)', marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} /> Active Admin Session
                    </span>
                  </div>
                </div>

                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/dashboard'); }}>
                  <LayoutGrid size={16} />
                  <span>Dashboard Hub</span>
                </button>

                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings/profile'); }}>
                  <UserIcon size={16} />
                  <span>Account Profile</span>
                </button>
                
                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings/general'); }}>
                  <Settings size={16} />
                  <span>System Settings</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />

                <button className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
