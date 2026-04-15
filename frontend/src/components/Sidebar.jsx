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
  Mail,
  Calendar,
  ShieldAlert,
  Smartphone,
  Fingerprint
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
  const [studioOpen, setStudioOpen] = React.useState(location.pathname.startsWith('/website'));
  const [hubOpen, setHubOpen] = React.useState(location.pathname.startsWith('/vendor'));

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

    setStudioOpen(location.pathname.startsWith('/website'));
    setHubOpen(location.pathname.startsWith('/vendor'));
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleLinkClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const hasPermission = (permId) => {
    if (user?.role === 'Admin') return true;
    if (user?.role === 'Sub-Admin') {
      return user?.permissions?.includes(permId);
    }
    return true; // Simple role checks for others
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
        
        {hasPermission('manage_vendors') && (
          <NavLink to="/vendors" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={20} />
            <span>Vendors</span>
          </NavLink>
        )}

        {user?.role === 'Admin' && (
          <NavLink to="/staff" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <ShieldCheck size={20} />
            <span>Admins</span>
          </NavLink>
        )}

        {hasPermission('manage_users') && (
          <NavLink to="/users" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
        )}

        {hasPermission('manage_subscriptions') && (
          <NavLink to="/subscriptions" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <CreditCard size={20} />
            <span>Subscriptions</span>
          </NavLink>
        )}

        {hasPermission('manage_packages') && (
          <NavLink to="/packages" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Package size={20} />
            <span>Packages</span>
          </NavLink>
        )}

        {hasPermission('manage_bookings') && (
          <NavLink to="/bookings" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Calendar size={20} />
            <span>Bookings</span>
          </NavLink>
        )}

        {hasPermission('manage_payments') && (
          <NavLink to="/payments" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <CreditCard size={20} />
            <span>Payments</span>
          </NavLink>
        )}

        {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
          <div className="nav-item-wrapper" style={{ marginTop: '8px' }}>
            {(hasPermission('manage_banners') || hasPermission('manage_blogs') || hasPermission('manage_testimonials')) && (
              <>
                <NavLink 
                  to="/website/banners"
                  className={`nav-link ${location.pathname.startsWith('/website') ? 'active' : ''}`}
                  onClick={() => {
                    setStudioOpen(true);
                    handleLinkClick();
                  }}
                  style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Layers size={20} />
                    {!isCollapsed && <span>Platform Studio</span>}
                  </div>
                  {!isCollapsed && (
                    <span 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setStudioOpen(!studioOpen);
                      }}
                      style={{ padding: '4px' }}
                    >
                      {studioOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} /> }
                    </span>
                  )}
                </NavLink>

                <div className={`nav-submenu ${studioOpen || isCollapsed ? 'open' : ''}`}>
                  {hasPermission('manage_banners') && (
                    <NavLink to="/website/banners" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                      <Image size={14} />
                      <span>Web Banners</span>
                    </NavLink>
                  )}
                  {hasPermission('manage_blogs') && (
                    <NavLink to="/website/blogs" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                      <FileText size={14} />
                      <span>Web Blogs</span>
                    </NavLink>
                  )}
                  {hasPermission('manage_testimonials') && (
                    <NavLink to="/website/testimonials" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                      <MessageSquare size={14} />
                      <span>Web Reviews</span>
                    </NavLink>
                  )}
                  {hasPermission('manage_reels') && (
                    <NavLink to="/website/shows" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                      <Smartphone size={14} />
                      <span>Web Shows</span>
                    </NavLink>
                  )}
                  {hasPermission('manage_brands') && (
                    <NavLink to="/website/brands" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                      <Globe size={14} />
                      <span>Social Brands</span>
                    </NavLink>
                  )}
                  {hasPermission('manage_enquiries') && (
                    <NavLink to="/website/enquiries" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                      <MessageSquare size={14} />
                      <span>Web Enquiries</span>
                    </NavLink>
                  )}
                  {hasPermission('manage_contact_us') && (
                    <NavLink to="/website/contact-us" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                      <Mail size={14} />
                      <span>Contact Messages</span>
                    </NavLink>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Vendor Marketing & Portfolio Hub */}
        {(user?.role === 'Vendor' || user?.role === 'Vendor-Staff') && (
          <div className="nav-item-wrapper" style={{ marginTop: '8px' }}>
             <NavLink 
              to="/vendor/banners"
              className={`nav-link ${location.pathname.startsWith('/vendor') ? 'active' : ''}`}
              onClick={() => {
                setHubOpen(true);
                handleLinkClick();
              }}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Briefcase size={20} />
                {!isCollapsed && <span>Agency Hub</span>}
              </div>
              {!isCollapsed && (
                <span 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHubOpen(!hubOpen);
                  }}
                  style={{ padding: '4px' }}
                >
                  {hubOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} /> }
                </span>
              )}
            </NavLink>

            <div className={`nav-submenu ${hubOpen || isCollapsed ? 'open' : ''}`}>
              <NavLink to="/vendor/banners" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                <Image size={14} />
                <span>Promotions</span>
              </NavLink>
              <NavLink to="/vendor/blogs" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                <FileText size={14} />
                <span>Agency Blog</span>
              </NavLink>
              <NavLink to="/vendor/testimonials" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                <MessageSquare size={14} />
                <span>Feedback</span>
              </NavLink>
              <NavLink to="/vendor/shows" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                <Smartphone size={14} />
                <span>Agency Highlights</span>
              </NavLink>
              <NavLink to="/vendor/brands" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                <Globe size={14} />
                <span>Agency Brand</span>
              </NavLink>
            </div>
          </div>
        )}

        {hasPermission('manage_services') && (
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
        )}

        {hasPermission('manage_destinations') && (
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
        )}

        {hasPermission('manage_complaints') && (
          <NavLink to="/complaints" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <ShieldAlert size={20} />
            <span>Disputes</span>
          </NavLink>
        )}

        {hasPermission('manage_policies') && (
          <NavLink to="/policies" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <ShieldCheck size={20} />
            <span>Policies</span>
          </NavLink>
        )}
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
