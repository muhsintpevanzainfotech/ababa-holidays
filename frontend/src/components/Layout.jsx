import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile } from '../store/slices/authSlice';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  useEffect(() => {
    if (user && !user.avatar) {
      dispatch(getProfile());
    }
  }, [user, dispatch]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Strictly protect dashboard for Admin and Sub-Admin roles only
  if (user.role !== 'Admin' && user.role !== 'Sub-Admin') {
    return <Navigate to="/login" />;
  }

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className={`layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onToggleCollapse={toggleSidebar}
      />
      <div className={`main-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
