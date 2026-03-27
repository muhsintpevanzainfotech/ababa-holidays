import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { 
  LayoutDashboard, 
  Image, 
  Users, 
  Package, 
  Settings, 
  LogOut,
  Map,
  MapPin,
  CreditCard,
  Briefcase,
  Layers,
  Wrench,
  ShieldCheck,
  X,
  ChevronsLeft,
  ChevronsRight,
  Plane,
  ChevronDown,
  ChevronRight,
  Globe,
  FileText,
  MessageSquare,
  Calendar,
} from 'lucide-react';

const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [locationsOpen, setLocationsOpen] = React.useState(location.pathname.startsWith('/destinations'));
  const [servicesOpen, setServicesOpen] = React.useState(
    location.pathname.startsWith('/services') || 
    location.pathname.startsWith('/categories') || 
    location.pathname.startsWith('/sub-services')
  );

  React.useEffect(() => {
    if (!location.pathname.startsWith('/destinations')) {
      setLocationsOpen(false);
    } else {
      setLocationsOpen(true);
    }

    if (!location.pathname.startsWith('/services') && 
        !location.pathname.startsWith('/categories') && 
        !location.pathname.startsWith('/sub-services')) {
      setServicesOpen(false);
    } else {
      setServicesOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' 
          }}>
            <Plane size={20} />
          </div>
          {!isCollapsed && (
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              ABABA <span style={{ color: 'var(--primary)' }}>TRAVELS</span>
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button 
            onClick={onCloseMobile} 
            className="mobile-close"
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
        )}
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/vendors" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} />
          <span>Vendors</span>
        </NavLink>

        {user?.role === 'Admin' && (
          <NavLink to="/staff" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <ShieldCheck size={20} />
            <span>Admins</span>
          </NavLink>
        )}

        <NavLink to="/users" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} />
          <span>Users</span>
        </NavLink>

        <NavLink to="/banners" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Image size={20} />
          <span>Banners</span>
        </NavLink>

        <NavLink to="/subscriptions" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <CreditCard size={20} />
          <span>Subscriptions</span>
        </NavLink>

        <NavLink to="/packages" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Package size={20} />
          <span>Packages</span>
        </NavLink>

        <NavLink to="/bookings" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Calendar size={20} />
          <span>Bookings</span>
        </NavLink>

        <NavLink to="/payments" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <CreditCard size={20} />
          <span>Payments</span>
        </NavLink>
                
        <NavLink to="/blogs" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <FileText size={20} />
          <span>Blogs</span>
        </NavLink>

        <NavLink to="/testimonials" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <MessageSquare size={20} />
          <span>Testimonials</span>
        </NavLink>

        <div className="nav-item-wrapper">
          <NavLink 
            to="/services"
            className={`nav-link ${location.pathname.startsWith('/services') || location.pathname.startsWith('/categories') || location.pathname.startsWith('/sub-services') ? 'active' : ''}`}
            onClick={() => {
              setServicesOpen(true);
              handleLinkClick();
            }}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Briefcase size={20} />
              {!isCollapsed && <span>Services</span>}
            </div>
            {!isCollapsed && (
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setServicesOpen(!servicesOpen);
                }}
                style={{ padding: '4px' }}
              >
                {servicesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} /> }
              </span>
            )}
          </NavLink>

          <div className={`nav-submenu ${servicesOpen || isCollapsed ? 'open' : ''}`}>
            <NavLink to="/services" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <Briefcase size={14} />
              <span>All Services</span>
            </NavLink>
            <NavLink to="/sub-services" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <Wrench size={14} />
              <span>Sub-Services</span>
            </NavLink>
            <NavLink to="/categories" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <Layers size={14} />
              <span>Categories</span>
            </NavLink>
          </div>
        </div>

        <div className="nav-item-wrapper">
          <NavLink 
            to="/destinations/countries"
            className={`nav-link ${location.pathname.startsWith('/destinations') ? 'active' : ''}`}
            onClick={() => {
              setLocationsOpen(true);
              handleLinkClick();
            }}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Map size={20} />
              {!isCollapsed && <span>Locations</span>}
            </div>
            {!isCollapsed && (
              <span 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLocationsOpen(!locationsOpen);
                }}
                style={{ padding: '4px' }}
              >
                {locationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} /> }
              </span>
            )}
          </NavLink>
          
          <div className={`nav-submenu ${locationsOpen || isCollapsed ? 'open' : ''}`}>
            <NavLink to="/destinations/countries" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <Globe size={14} />
              <span>Countries</span>
            </NavLink>
            <NavLink to="/destinations/states" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <Map size={14} />
              <span>States</span>
            </NavLink>
            <NavLink to="/destinations/list" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <MapPin size={14} />
              <span>Destinations</span>
            </NavLink>
          </div>
        </div>

        <NavLink to="/settings" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button 
          onClick={onToggleCollapse} 
          className="nav-link toggle-btn collapse-desktop-btn" 
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
        >
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          <span>Collapse Sidebar</span>
        </button>

        <button onClick={handleLogout} className="nav-link logout-btn" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
