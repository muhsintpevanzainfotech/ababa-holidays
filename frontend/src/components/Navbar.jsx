import React from 'react';
import { useSelector } from 'react-redux';
import { 
  ChevronDown,
  Moon,
  Sun,
  Search,
  Bell,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Lock,
  LayoutGrid,
  BellOff,
  Settings
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import NotificationDropdown from './NotificationDropdown';

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useSelector((state) => state.auth);
  const { 
    isDarkMode, 
    toggleTheme, 
    isNotificationsEnabled, 
    toggleNotifications
  } = useUI();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      if (!user) return;
      
      const { data } = await api.get('/notifications');
      const unread = data.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch unread count', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="nav-icon" 
          onClick={onToggleSidebar}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
        >
          <Menu size={20} />
        </button>
        
        <div className="search-wrapper" style={{ maxWidth: '400px' }}>
          <input 
            type="text" 
            className="form-control search-input" 
            placeholder="Search everything..." 
            style={{ background: 'var(--bg-main)' }}
          />
          <Search size={18} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button 
          className="nav-icon" 
          onClick={toggleTheme}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div style={{ position: 'relative' }}>
          <button 
            className="nav-icon" 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              background: 'none', border: 'none', color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)', 
              position: 'relative', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center',
              transition: 'var(--transition)'
            }}
          >
            <Bell size={20} />
            {isNotificationsEnabled && unreadCount > 0 && (
              <span className="pulse" style={{ 
                position: 'absolute', top: '4px', right: '4px', width: '18px', height: '18px', 
                background: '#ef4444', color: 'white', borderRadius: '50%', border: '2px solid var(--bg-card)',
                fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.2)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NotificationDropdown isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
        </div>

        <div style={{ position: 'relative' }}>
          <div 
            className="navbar-profile"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ cursor: 'pointer' }}
          >
            <div className="profile-avatar-wrapper">
              {user?.avatar ? (
                <img 
                  src={getImageUrl(user.avatar)} 
                  alt="" 
                  loading="lazy"
                  className="profile-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=4f46e5&color=fff`;
                  }}
                />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: '0.3s', transform: showDropdown ? 'rotate(180deg)' : 'none' }} />
          </div>

          {showDropdown && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                onClick={() => setShowDropdown(false)} 
              />
              <div className="dropdown-menu" style={{ minWidth: '220px', top: 'calc(100% + 12px)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{user?.email}</p>
                </div>
                
                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/dashboard'); }}>
                  <LayoutGrid size={16} />
                  <span>Dashboard</span>
                </button>

                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings?tab=profile'); }}>
                  <UserIcon size={16} />
                  <span>Account Profile</span>
                </button>
                
                <button className="dropdown-item" onClick={() => { setShowDropdown(false); navigate('/settings'); }}>
                  <Settings size={16} />
                  <span>System Settings</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border)', margin: '4px 6px' }} />

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
