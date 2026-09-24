import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  LayoutDashboard,
  Image,
  Users,
  Package,
  Tag,
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
  Sparkles,
  Zap,
  UserCog,
  BellOff,
  Lock,
  UserCheck,
  Landmark
} from 'lucide-react';
import { getImageUrl } from '../utils/constants';
import { fetchServicesRequest } from '../store/slices/servicesSlice';

const Sidebar = ({ isCollapsed, isMobileOpen, onCloseMobile, onToggleCollapse }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { services } = useSelector((state) => state.services || { services: [] });

  const isPackagesRoute = location.pathname === '/packages' || (location.pathname.startsWith('/packages') && !location.pathname.startsWith('/packages/setup'));

  const [packagesOpen, setPackagesOpen] = React.useState(isPackagesRoute);
  const [locationsOpen, setLocationsOpen] = React.useState(location.pathname.startsWith('/destinations'));
  const [servicesOpen, setServicesOpen] = React.useState(
    location.pathname.startsWith('/services') ||
    location.pathname.startsWith('/categories') ||
    location.pathname.startsWith('/sub-services')
  );
  const [studioOpen, setStudioOpen] = React.useState(location.pathname.startsWith('/website'));
  const [hubOpen, setHubOpen] = React.useState(location.pathname.startsWith('/vendor'));
  const [settingsOpen, setSettingsOpen] = React.useState(location.pathname.startsWith('/settings'));
  const [staffOpen, setStaffOpen] = React.useState(
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/roles') ||
    location.pathname.startsWith('/permissions')
  );

  const [flyoutState, setFlyoutState] = React.useState({ id: null, top: 0 });

  const handleMouseEnterItem = (id, e) => {
    if (isCollapsed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const menuHeight = id === 'settings' ? 200 : (id === 'studio' ? 290 : 180);
      let top = rect.top - 4;
      if (top + menuHeight > window.innerHeight - 12) {
        top = Math.max(10, window.innerHeight - menuHeight - 12);
      }
      setFlyoutState({ id, top });
    }
  };

  const handleMouseLeaveItem = () => {
    if (isCollapsed) {
      setFlyoutState({ id: null, top: 0 });
    }
  };

  React.useEffect(() => {
    if (!services || services.length === 0) {
      dispatch(fetchServicesRequest());
    }
  }, [dispatch, services]);

  React.useEffect(() => {
    setPackagesOpen(location.pathname === '/packages' || (location.pathname.startsWith('/packages') && !location.pathname.startsWith('/packages/setup')));
    setLocationsOpen(location.pathname.startsWith('/destinations'));
    setServicesOpen(
      location.pathname.startsWith('/services') ||
      location.pathname.startsWith('/categories') ||
      location.pathname.startsWith('/sub-services')
    );
    setStudioOpen(location.pathname.startsWith('/website'));
    setHubOpen(location.pathname.startsWith('/vendor'));
    setSettingsOpen(location.pathname.startsWith('/settings'));
    setStaffOpen(
      location.pathname.startsWith('/staff') ||
      location.pathname.startsWith('/roles') ||
      location.pathname.startsWith('/permissions')
    );
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
    return true;
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* BRANDING HEADER */}
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: '#ffffff',
            padding: '3px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            flexShrink: 0
          }}>
            <img src="/logo.png" alt="Ababa Travels Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }} />
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '-0.3px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                  ABABA <span style={{ color: 'var(--primary)' }}>TRAVELS</span>
                </span>
                <span style={{ fontSize: '8px', fontWeight: '800', padding: '1px 5px', borderRadius: '4px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  PRO
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Admin Command Center</p>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={onCloseMobile}
            className="mobile-close"
            style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="sidebar-nav">

        {/* SECTION: OVERVIEW */}
        {!isCollapsed && <div className="sidebar-section-title">CORE MANAGEMENT</div>}

        <NavLink to="/dashboard" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {hasPermission('manage_vendors') && (
          <NavLink to="/vendors" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={20} />
            <span>Vendor Partners</span>
          </NavLink>
        )}

        {hasPermission('manage_users') && (
          <NavLink to="/users" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Users size={20} />
            <span>Travelers</span>
          </NavLink>
        )}

        {/* SECTION: PACKAGES & SERVICES */}
        {!isCollapsed && <div className="sidebar-section-title" style={{ marginTop: '16px' }}>LISTINGS & CATALOG</div>}

        {hasPermission('manage_packages') && (
          <div
            className="nav-item-wrapper"
            onMouseEnter={(e) => handleMouseEnterItem('packages', e)}
            onMouseLeave={handleMouseLeaveItem}
          >
            <div
              className={`nav-link ${location.pathname === '/packages' || (location.pathname.startsWith('/packages') && !location.pathname.startsWith('/packages/setup')) ? 'active' : ''}`}
              onClick={() => setPackagesOpen(!packagesOpen)}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package size={20} />
                <span>Packages</span>
              </div>
              {!isCollapsed && (
                <span>
                  {packagesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </div>

            <div
              className={`nav-submenu ${packagesOpen || isCollapsed ? 'open' : ''} ${isCollapsed && flyoutState.id === 'packages' ? 'flyout-show' : ''}`}
              style={isCollapsed && flyoutState.id === 'packages' ? { position: 'fixed', left: '76px', top: `${flyoutState.top}px` } : {}}
            >
              <NavLink
                to="/packages"
                onClick={handleLinkClick}
                className={() => (location.pathname === '/packages' && !(new URLSearchParams(location.search)).get('service')) ? 'submenu-link active' : 'submenu-link'}
              >
                <Package size={14} />
                <span>All Packages</span>
              </NavLink>

              {services && services.length > 0 && services.map((svc) => {
                const slug = svc.title ? svc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'service';
                const customId = svc.customId || svc._id;
                const svcPath = `/packages/${customId}/${slug}`;
                return (
                  <NavLink
                    key={svc._id}
                    to={svcPath}
                    onClick={handleLinkClick}
                    className={() => (location.pathname.startsWith(`/packages/${customId}`)) ? 'submenu-link active' : 'submenu-link'}
                  >
                    <Briefcase size={14} />
                    <span>{svc.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}

        {hasPermission('manage_packages') && (
          <NavLink to="/packages/setup" onClick={handleLinkClick} className={({ isActive }) => location.pathname.startsWith('/packages/setup') ? 'nav-link active' : 'nav-link'}>
            <Sparkles size={20} />
            <span>Package Setup</span>
          </NavLink>
        )}

        {hasPermission('manage_packages') && (
          <NavLink to="/coupons" onClick={handleLinkClick} className={({ isActive }) => location.pathname.startsWith('/coupons') || location.pathname.startsWith('/packages/coupons') ? 'nav-link active' : 'nav-link'}>
            <Tag size={20} />
            <span>Package Coupons</span>
          </NavLink>
        )}

        {hasPermission('manage_services') && (
          <div
            className="nav-item-wrapper"
            onMouseEnter={(e) => handleMouseEnterItem('services', e)}
            onMouseLeave={handleMouseLeaveItem}
          >
            <div
              className={`nav-link ${location.pathname.startsWith('/services') || location.pathname.startsWith('/categories') || location.pathname.startsWith('/sub-services') ? 'active' : ''}`}
              onClick={() => setServicesOpen(!servicesOpen)}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Briefcase size={20} />
                <span>Services Catalog</span>
              </div>
              {!isCollapsed && (
                <span>
                  {servicesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </div>

            <div
              className={`nav-submenu ${servicesOpen || isCollapsed ? 'open' : ''} ${isCollapsed && flyoutState.id === 'services' ? 'flyout-show' : ''}`}
              style={isCollapsed && flyoutState.id === 'services' ? { position: 'fixed', left: '76px', top: `${flyoutState.top}px` } : {}}
            >
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
          <div
            className="nav-item-wrapper"
            onMouseEnter={(e) => handleMouseEnterItem('destinations', e)}
            onMouseLeave={handleMouseLeaveItem}
          >
            <div
              className={`nav-link ${location.pathname.startsWith('/destinations') ? 'active' : ''}`}
              onClick={() => setLocationsOpen(!locationsOpen)}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Map size={20} />
                <span>Destinations</span>
              </div>
              {!isCollapsed && (
                <span>
                  {locationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </div>

            <div
              className={`nav-submenu ${locationsOpen || isCollapsed ? 'open' : ''} ${isCollapsed && flyoutState.id === 'destinations' ? 'flyout-show' : ''}`}
              style={isCollapsed && flyoutState.id === 'destinations' ? { position: 'fixed', left: '76px', top: `${flyoutState.top}px` } : {}}
            >
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

        {/* SECTION: BOOKINGS & TRANSACTIONS */}
        {!isCollapsed && <div className="sidebar-section-title" style={{ marginTop: '16px' }}>FINANCE & OPERATIONS</div>}

        {hasPermission('manage_bookings') && (
          <NavLink to="/bookings" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Calendar size={20} />
            <span>Bookings Center</span>
          </NavLink>
        )}

        {hasPermission('manage_payments') && (
          <NavLink to="/payments" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <CreditCard size={20} />
            <span>Transactions</span>
          </NavLink>
        )}

        {hasPermission('manage_subscriptions') && (
          <NavLink to="/subscriptions" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <CreditCard size={20} />
            <span>Subscriptions</span>
          </NavLink>
        )}

        {hasPermission('manage_vendors') && (
          <NavLink to="/vendor-banks" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <Landmark size={20} />
            <span>Vendor Bank List</span>
          </NavLink>
        )}

        {/* SECTION: PLATFORM STUDIO & CONTENT */}
        {(user?.role === 'Admin' || user?.role === 'Sub-Admin') && (
          <>
            {!isCollapsed && <div className="sidebar-section-title" style={{ marginTop: '16px' }}>STUDIO & CMS</div>}

            <div
              className="nav-item-wrapper"
              onMouseEnter={(e) => handleMouseEnterItem('studio', e)}
              onMouseLeave={handleMouseLeaveItem}
            >
              <div
                className={`nav-link ${location.pathname.startsWith('/website') ? 'active' : ''}`}
                onClick={() => setStudioOpen(!studioOpen)}
                style={{ cursor: 'pointer', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Layers size={20} />
                  <span>Platform Studio</span>
                </div>
                {!isCollapsed && (
                  <span>
                    {studioOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                )}
              </div>

              <div
                className={`nav-submenu ${studioOpen || isCollapsed ? 'open' : ''} ${isCollapsed && flyoutState.id === 'studio' ? 'flyout-show' : ''}`}
                style={isCollapsed && flyoutState.id === 'studio' ? { position: 'fixed', left: '76px', top: `${flyoutState.top}px` } : {}}
              >
                {hasPermission('manage_banners') && (
                  <NavLink to="/website/banners" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                    <Image size={14} />
                    <span>Banners</span>
                  </NavLink>
                )}
                {hasPermission('manage_blogs') && (
                  <NavLink to="/website/blogs" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                    <FileText size={14} />
                    <span>Blogs</span>
                  </NavLink>
                )}
                {hasPermission('manage_testimonials') && (
                  <NavLink to="/website/testimonials" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                    <MessageSquare size={14} />
                    <span>Reviews</span>
                  </NavLink>
                )}
                {hasPermission('manage_reels') && (
                  <NavLink to="/website/shows" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                    <Smartphone size={14} />
                    <span>Reels & Shows</span>
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
            </div>
          </>
        )}

        {/* SECTION: SYSTEM & POLICIES */}
        {!isCollapsed && <div className="sidebar-section-title" style={{ marginTop: '16px' }}>SYSTEM & COMPLIANCE</div>}

        {user?.role === 'Admin' && (
          <div
            className="nav-item-wrapper"
            onMouseEnter={(e) => handleMouseEnterItem('staff', e)}
            onMouseLeave={handleMouseLeaveItem}
          >
            <div
              className={`nav-link ${location.pathname.startsWith('/staff') || location.pathname.startsWith('/roles-permissions') || location.pathname === '/settings/permissions' ? 'active' : ''}`}
              onClick={() => setStaffOpen(!staffOpen)}
              style={{ cursor: 'pointer', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={20} />
                <span>Staff & Access Control</span>
              </div>
              {!isCollapsed && (
                <span>
                  {staffOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
              )}
            </div>

            <div
              className={`nav-submenu ${staffOpen || isCollapsed ? 'open' : ''} ${isCollapsed && flyoutState.id === 'staff' ? 'flyout-show' : ''}`}
              style={isCollapsed && flyoutState.id === 'staff' ? { position: 'fixed', left: '76px', top: `${flyoutState.top}px` } : {}}
            >
              <NavLink to="/staff" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
                <Users size={14} />
                <span>Admin Staff Members</span>
              </NavLink>
              <NavLink to="/roles" onClick={handleLinkClick} className={({ isActive }) => (isActive || location.pathname === '/roles' || location.pathname === '/staff-roles') ? 'submenu-link active' : 'submenu-link'}>
                <UserCheck size={14} />
                <span>Staff Roles</span>
              </NavLink>
              <NavLink to="/permissions" onClick={handleLinkClick} className={({ isActive }) => (isActive || location.pathname === '/permissions' || location.pathname === '/settings/permissions') ? 'submenu-link active' : 'submenu-link'}>
                <Lock size={14} />
                <span>Module Permissions</span>
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
            <span>Platform Policies</span>
          </NavLink>
        )}

        <div
          className="nav-item-wrapper"
          onMouseEnter={(e) => handleMouseEnterItem('settings', e)}
          onMouseLeave={handleMouseLeaveItem}
        >
          <div
            className={`nav-link ${location.pathname.startsWith('/settings') ? 'active' : ''}`}
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Settings size={20} />
              <span>System Settings</span>
            </div>
            {!isCollapsed && (
              <span>
                {settingsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </div>
          <div
            className={`nav-submenu ${settingsOpen || isCollapsed ? 'open' : ''} ${isCollapsed && flyoutState.id === 'settings' ? 'flyout-show' : ''}`}
            style={isCollapsed && flyoutState.id === 'settings' ? { position: 'fixed', left: '76px', top: `${flyoutState.top}px` } : {}}
          >
            <NavLink to="/settings/profile" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <UserCog size={14} />
              <span>Account Profile</span>
            </NavLink>
            <NavLink to="/settings/general" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <BellOff size={14} />
              <span>General Preferences</span>
            </NavLink>
            <NavLink to="/settings/security" onClick={handleLinkClick} className={({ isActive }) => isActive ? 'submenu-link active' : 'submenu-link'}>
              <Lock size={14} />
              <span>Security & Password</span>
            </NavLink>
            <NavLink to="/settings/payments" onClick={handleLinkClick} className={({ isActive }) => (isActive || location.pathname === '/admin/settings/payments') ? 'submenu-link active' : 'submenu-link'}>
              <CreditCard size={14} />
              <span>Payment Gateway</span>
            </NavLink>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
