import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  UserCheck, 
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowRight,
  Check,
  Award,
  Package,
  CreditCard,
  Layers,
  Mail,
  Users,
  Shield,
  Palette,
  Sparkles,
  Sliders,
  Bot,
  Activity,
  FileSpreadsheet,
  ShieldAlert,
  MessageSquare,
  FileText,
  Image,
  Globe,
  Smartphone,
  Briefcase,
  Map,
  LayoutDashboard,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { getImageUrl } from '../utils/constants';
import api from '../utils/api';
import Drawer from '../components/Drawer';

const StaffRoles = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { user: authUser } = useSelector((state) => state.auth);

  const [staffList, setStaffList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  
  // Drawer state for Role Creation / Editing
  const [isRoleDrawerOpen, setIsRoleDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('add'); // 'add' or 'edit'
  const [currentRole, setCurrentRole] = useState(null);
  const [savingRole, setSavingRole] = useState(false);
  
  const [roleForm, setRoleForm] = useState({
    name: '',
    badge: 'CUSTOM ROLE',
    color: '#4f46e5',
    description: '',
    permissions: []
  });

  // Pre-curated Theme Swatches
  const colorSwatches = [
    { hex: '#4f46e5', name: 'Indigo' },
    { hex: '#8b5cf6', name: 'Violet' },
    { hex: '#3b82f6', name: 'Blue' },
    { hex: '#10b981', name: 'Emerald' },
    { hex: '#f59e0b', name: 'Amber' },
    { hex: '#ec4899', name: 'Rose' },
    { hex: '#06b6d4', name: 'Cyan' },
    { hex: '#ef4444', name: 'Crimson' }
  ];

  // System Permission Categories List
  const permissionCategories = [
    {
      category: 'Core Admin & Security',
      icon: <Shield size={16} color="var(--primary)" />,
      permissions: [
        { id: 'manage_dashboard', label: 'Platform Dashboard & Insights', desc: 'Access global analytics, system metrics, and executive overview.' },
        { id: 'manage_vendors', label: 'Vendor Partner Control', desc: 'Verify, approve, edit, and manage registered vendor agency profiles.' },
        { id: 'manage_users', label: 'Traveler & User Accounts', desc: 'View, verify, or suspend registered traveler customer accounts.' },
        { id: 'manage_policies', label: 'Platform Policies & Terms', desc: 'Edit Terms & Conditions, Privacy, and Cancellation policy rules.' },
        { id: 'manage_settings', label: 'System Preferences & Passkeys', desc: 'Modify passkey requirements and global security preferences.' },
        { id: 'manage_security_logs', label: 'Security Audit & Logs', desc: 'Audit system access logs, passkey authorization, and session activities.' }
      ]
    },
    {
      category: 'Catalog, Packages & AI Builder',
      icon: <Package size={16} color="#8b5cf6" />,
      permissions: [
        { id: 'manage_packages', label: 'Packages & Setup', desc: 'Create, edit, price, and publish travel itineraries and packages.' },
        { id: 'manage_services', label: 'Services Catalog & Categories', desc: 'Manage main categories, sub-services, and catalog offerings.' },
        { id: 'manage_destinations', label: 'Geo Locations & Destinations', desc: 'Manage countries, states, and destination landing pages.' },
        { id: 'manage_ai_builder', label: 'AI Package Setup Builder', desc: 'Access NextGen AI form builder and custom package itinerary generator.' }
      ]
    },
    {
      category: 'Finance, Operations & Exports',
      icon: <CreditCard size={16} color="#10b981" />,
      permissions: [
        { id: 'manage_bookings', label: 'Bookings & Reservations', desc: 'Process, confirm, or modify customer tour bookings.' },
        { id: 'manage_payments', label: 'Transactions & Financials', desc: 'Audit payment records, payouts, and revenue streams.' },
        { id: 'manage_subscriptions', label: 'Vendor Subscriptions & Tiers', desc: 'Manage vendor subscription pricing plans and tier features.' },
        { id: 'manage_complaints', label: 'Disputes & Incident Resolution', desc: 'Handle vendor and traveler support tickets and complaints.' },
        { id: 'manage_vendor_staff', label: 'Vendor Agency Staff Oversight', desc: 'Monitor vendor agency team members and internal sub-accounts.' },
        { id: 'manage_exports', label: 'Analytics & CSV Data Export', desc: 'Download CSV and PDF reports for bookings, revenue, and users.' }
      ]
    },
    {
      category: 'Platform Studio & Content',
      icon: <Layers size={16} color="#f59e0b" />,
      permissions: [
        { id: 'manage_banners', label: 'Web Banners & Promotions', desc: 'Manage homepage hero carousels and promotional graphics.' },
        { id: 'manage_blogs', label: 'Travel Blogs & Articles', desc: 'Publish, edit, and curate platform travel stories and articles.' },
        { id: 'manage_testimonials', label: 'Customer Reviews Moderation', desc: 'Approve, feature, or remove traveler reviews and feedback.' },
        { id: 'manage_reels', label: 'Reels & Video Shows', desc: 'Curate short video reels and promotional media shows.' },
        { id: 'manage_brands', label: 'Social & Brand Partners', desc: 'Manage featured client logos and brand partner badges.' }
      ]
    },
    {
      category: 'Communication & Customer Leads',
      icon: <Mail size={16} color="#ec4899" />,
      permissions: [
        { id: 'manage_enquiries', label: 'Web Enquiries & Leads', desc: 'Respond to and track custom holiday trip request leads.' },
        { id: 'manage_contact_us', label: 'Contact Messages & Support', desc: 'Manage customer contact form submissions and inquiries.' }
      ]
    }
  ];

  const allPermissionsList = permissionCategories.flatMap(c => c.permissions);

  useEffect(() => {
    fetchRoles();
    fetchStaffList();
  }, []);

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await api.get('/roles');
      if (response.data?.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles from backend:', error);
      showToast('Error', 'Failed to load system roles from server', 'error');
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchStaffList = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      if (response.data?.success) {
        const subAdmins = response.data.data.filter(u => u.role === 'Sub-Admin');
        setStaffList(subAdmins);
      }
    } catch (error) {
      console.error('Error fetching staff list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddRole = () => {
    setDrawerMode('add');
    setCurrentRole(null);
    setRoleForm({
      name: '',
      badge: 'CUSTOM ROLE',
      color: '#4f46e5',
      description: '',
      permissions: []
    });
    setIsRoleDrawerOpen(true);
  };

  const handleOpenEditRole = (role) => {
    if (role.isSystem) {
      return showToast('System Protected', 'Super Admin role profile cannot be edited.', 'info');
    }
    setDrawerMode('edit');
    setCurrentRole(role);
    setRoleForm({
      name: role.name,
      badge: role.badge || 'CUSTOM ROLE',
      color: role.color || '#4f46e5',
      description: role.description || '',
      permissions: [...role.permissions]
    });
    setIsRoleDrawerOpen(true);
  };

  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      return showToast('Protected', 'System core roles cannot be deleted.', 'error');
    }

    const isConfirmed = await confirm(
      'Delete Role Profile?',
      `Are you sure you want to delete the role profile "${role.name}" from backend database?`
    );

    if (isConfirmed) {
      try {
        const response = await api.delete(`/roles/${role._id}`);
        if (response.data?.success) {
          showToast('Role Deleted', 'Role template removed successfully.', 'success');
          setRoles(prev => prev.filter(r => r._id !== role._id));
        }
      } catch (error) {
        showToast('Error', error.response?.data?.message || 'Failed to delete role', 'error');
      }
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      return showToast('Error', 'Role profile name is required', 'error');
    }

    setSavingRole(true);
    try {
      if (drawerMode === 'add') {
        const response = await api.post('/roles', roleForm);
        if (response.data?.success) {
          showToast('Role Created', `New role profile "${response.data.data.name}" created successfully.`, 'success');
          setRoles(prev => [...prev, response.data.data]);
          setIsRoleDrawerOpen(false);
        }
      } else {
        const response = await api.put(`/roles/${currentRole._id}`, roleForm);
        if (response.data?.success) {
          showToast('Role Updated', `Role profile "${response.data.data.name}" updated successfully.`, 'success');
          setRoles(prev => prev.map(r => r._id === currentRole._id ? response.data.data : r));
          setIsRoleDrawerOpen(false);
        }
      }
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to save role profile', 'error');
    } finally {
      setSavingRole(false);
    }
  };

  const handleTogglePermission = (permId) => {
    if (roleForm.permissions.includes(permId)) {
      setRoleForm({
        ...roleForm,
        permissions: roleForm.permissions.filter(p => p !== permId)
      });
    } else {
      setRoleForm({
        ...roleForm,
        permissions: [...roleForm.permissions, permId]
      });
    }
  };

  const handleSelectCategoryPermissions = (categoryPerms) => {
    const permIds = categoryPerms.map(p => p.id);
    const allSelected = permIds.every(id => roleForm.permissions.includes(id));

    if (allSelected) {
      setRoleForm({
        ...roleForm,
        permissions: roleForm.permissions.filter(id => !permIds.includes(id))
      });
    } else {
      const merged = Array.from(new Set([...roleForm.permissions, ...permIds]));
      setRoleForm({
        ...roleForm,
        permissions: merged
      });
    }
  };

  const handleSelectAll = () => {
    setRoleForm({ ...roleForm, permissions: allPermissionsList.map(p => p.id) });
  };

  const handleClearAll = () => {
    setRoleForm({ ...roleForm, permissions: [] });
  };

  const handleAssignRoleToStaff = async (staffUser, rolePreset) => {
    try {
      const targetPermissions = rolePreset.permissions.includes('ALL') 
        ? allPermissionsList.map(p => p.id)
        : rolePreset.permissions;

      const response = await api.put(`/users/${staffUser._id}`, {
        permissions: JSON.stringify(targetPermissions)
      });

      if (response.data?.success || response.status === 200) {
        showToast(
          'Role Assigned', 
          `Role "${rolePreset.name}" assigned to ${staffUser.name}. Permissions synced.`, 
          'success'
        );
        setStaffList(prev => prev.map(s => s._id === staffUser._id ? { ...s, permissions: targetPermissions } : s));
      }
    } catch (error) {
      showToast('Error', 'Failed to assign role to staff member.', 'error');
    }
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                ADMINISTRATION & GOVERNANCE
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', margin: 0 }}>
              Staff Roles & <span style={{ color: 'var(--primary)' }}>Role Profiles</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px', margin: 0 }}>
              Create custom role definitions in MongoDB, assign permission templates, and manage administrative access.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleOpenAddRole}
              style={{ padding: '0 20px', height: '44px', fontWeight: '800', borderRadius: '12px', gap: '8px' }}
            >
              <Plus size={18} /> Create New Role Profile
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: ROLE PROFILES DIRECTORY */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Award size={20} color="var(--primary)" />
          <h2 style={{ fontSize: '19px', fontWeight: '800', margin: 0 }}>Backend Roles Directory ({roles.length})</h2>
        </div>

        {rolesLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading roles from backend...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {roles.map((role) => (
              <div key={role._id || role.id} style={{ 
                background: role.isSystem ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(30, 27, 75, 0.02) 100%)' : 'var(--bg-card)',
                border: role.isSystem ? '1.5px solid rgba(79, 70, 229, 0.3)' : '1px solid var(--border)',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: 'var(--shadow-premium)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <span style={{ 
                      fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', 
                      background: role.isSystem ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)', color: role.isSystem ? '#ffffff' : (role.color || 'var(--primary)'), 
                      letterSpacing: '0.5px' 
                    }}>
                      {role.badge || 'ROLE'}
                    </span>
                    {role.isSystem && (
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: 'rgba(79, 70, 229, 0.15)', color: 'var(--primary)' }}>
                        SYSTEM CORE
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px', color: 'var(--text-main)' }}>{role.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '0 0 16px' }}>{role.description}</p>
                </div>

                <div>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Permissions Included:</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: role.color || 'var(--primary)' }}>
                      {role.permissions.includes('ALL') ? 'All 23 Modules' : `${role.permissions.length} Modules`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {!role.isSystem && (
                      <>
                        <button 
                          onClick={() => handleOpenEditRole(role)}
                          className="btn btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '8px', gap: '4px' }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteRole(role)}
                          className="btn btn-outline danger" 
                          style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700', borderRadius: '8px', gap: '4px', color: '#ef4444' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      {/* ULTRA-MODERN DRAWER FOR CREATING / EDITING CUSTOM ROLE PROFILES */}
      <Drawer
        isOpen={isRoleDrawerOpen}
        onClose={() => setIsRoleDrawerOpen(false)}
        title={drawerMode === 'add' ? 'Create Custom Staff Role Profile' : `Edit Role Profile - ${currentRole?.name || ''}`}
        subtitle="Configure role credentials, accent badge colors, and module authorization."
        size="lg"
      >
        <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          {/* SCROLLABLE INNER CONTAINER WITH SLEEK STYLING */}
          <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            
            {/* REAL-TIME DYNAMIC LIVE ROLE PREVIEW CARD */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(30, 27, 75, 0.02) 100%)',
              border: '1.5px solid',
              borderColor: roleForm.color || 'var(--primary)',
              borderRadius: '18px',
              padding: '20px 24px',
              marginBottom: '28px',
              boxShadow: 'var(--shadow-premium)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  LIVE ROLE PREVIEW CARD
                </span>
                <span style={{ 
                  fontSize: '11px', fontWeight: '800', padding: '4px 12px', borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.9)', color: roleForm.color || 'var(--primary)', 
                  letterSpacing: '0.5px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' 
                }}>
                  {roleForm.badge || 'CUSTOM ROLE'}
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>
                {roleForm.name || 'Role Profile Name'}
              </h3>
              <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {roleForm.description || 'Role scope description will appear here as you type...'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '800', color: roleForm.color || 'var(--primary)' }}>
                <Sparkles size={14} /> {roleForm.permissions.length} of {allPermissionsList.length} Permissions Authorized
              </div>
            </div>

            {/* SECTION 1: ROLE IDENTITY & ACCENT STYLING */}
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '18px', background: 'var(--bg-card)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <Shield size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Role Profile Credentials</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                    Role Profile Title <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input 
                    type="text" className="form-control" required placeholder="e.g., Senior Operations Lead"
                    style={{ height: '46px', borderRadius: '12px', fontWeight: '600', fontSize: '14px' }}
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                    Badge Tag Label
                  </label>
                  <input 
                    type="text" className="form-control" placeholder="e.g., REGIONAL LEAD"
                    style={{ height: '46px', borderRadius: '12px', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}
                    value={roleForm.badge}
                    onChange={(e) => setRoleForm({ ...roleForm, badge: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              {/* ACCENT COLOR PRESET SWATCHES */}
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '13px', fontWeight: '700' }}>
                  <Palette size={15} color="var(--primary)" /> Role Theme Accent Color
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setRoleForm({ ...roleForm, color: swatch.hex })}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: swatch.hex,
                        border: roleForm.color === swatch.hex ? '3px solid var(--text-main)' : '2px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        transform: roleForm.color === swatch.hex ? 'scale(1.15)' : 'scale(1)'
                      }}
                      title={swatch.name}
                    />
                  ))}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
                    <input 
                      type="color" className="form-control"
                      style={{ width: '40px', height: '34px', borderRadius: '8px', padding: '2px', cursor: 'pointer', border: '1px solid var(--border)' }}
                      value={roleForm.color}
                      onChange={(e) => setRoleForm({ ...roleForm, color: e.target.value })}
                    />
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-muted)' }}>
                      {roleForm.color}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: ROLE DESCRIPTION */}
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '18px', background: 'var(--bg-card)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Role Scope & Description</h3>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <textarea 
                  className="form-control" rows="3" placeholder="Specify key responsibilities and module authorization rules for this role..."
                  style={{ borderRadius: '12px', padding: '14px', fontWeight: '500', fontSize: '13px', lineHeight: '1.5', resize: 'none', overflow: 'hidden', minHeight: '90px' }}
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                />
              </div>
            </div>

            {/* SECTION 3: SYSTEM PERMISSIONS CHECKLIST */}
            <div style={{ padding: '24px', border: '1px solid var(--border)', borderRadius: '18px', background: 'var(--bg-card)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Module Permission Grants</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                    Check modules to grant access ({roleForm.permissions.length} of {allPermissionsList.length} Enabled).
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={handleSelectAll} style={{ fontSize: '12px', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', cursor: 'pointer' }}>
                    Select All
                  </button>
                  <button type="button" onClick={handleClearAll} style={{ fontSize: '12px', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', cursor: 'pointer' }}>
                    Clear All
                  </button>
                </div>
              </div>

              {/* CATEGORIZED PERMISSION CARDS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {permissionCategories.map((cat, idx) => {
                  const catPermIds = cat.permissions.map(p => p.id);
                  const isCatAllSelected = catPermIds.every(id => roleForm.permissions.includes(id));
                  
                  return (
                    <div key={idx} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {cat.icon}
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: 'var(--text-main)' }}>{cat.category}</h4>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleSelectCategoryPermissions(cat.permissions)}
                          style={{ fontSize: '11px', fontWeight: '800', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                        >
                          {isCatAllSelected ? 'Deselect Category' : 'Select Category'}
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                        {cat.permissions.map((perm) => {
                          const isChecked = roleForm.permissions.includes(perm.id);
                          return (
                            <div 
                              key={perm.id} 
                              onClick={() => handleTogglePermission(perm.id)}
                              style={{ 
                                padding: '12px 14px', 
                                borderRadius: '12px', 
                                border: '1.5px solid',
                                borderColor: isChecked ? roleForm.color || 'var(--primary)' : 'var(--border)',
                                background: isChecked ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-card)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                boxShadow: isChecked ? '0 4px 12px -2px rgba(var(--primary-rgb), 0.15)' : 'none'
                              }}
                            >
                              <div style={{ 
                                width: '20px', height: '20px', borderRadius: '6px', 
                                border: '2px solid', 
                                borderColor: isChecked ? roleForm.color || 'var(--primary)' : '#cbd5e1',
                                background: isChecked ? roleForm.color || 'var(--primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: '2px', flexShrink: 0
                              }}>
                                {isChecked && <Check size={13} color="#ffffff" strokeWidth={3} />}
                              </div>
                              <div>
                                <h5 style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '800', color: isChecked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                  {perm.label}
                                </h5>
                                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                                  {perm.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

          {/* STICKY GLASS ACTION FOOTER BAR */}
          <div style={{ 
            padding: '18px 28px', 
            background: 'var(--glass-bg)', 
            backdropFilter: 'blur(16px)', 
            borderTop: '1px solid var(--border)', 
            display: 'flex', 
            justify: 'flex-end', 
            gap: '12px',
            flexShrink: 0
          }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRoleDrawerOpen(false)} style={{ padding: '10px 22px', fontSize: '13px', borderRadius: '10px', fontWeight: '700' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={savingRole} style={{ padding: '10px 28px', fontSize: '13px', fontWeight: '800', borderRadius: '10px', gap: '8px' }}>
              {savingRole ? 'Saving Role Profile...' : <><Save size={16} /> Save Role Profile</>}
            </button>
          </div>
        </form>
      </Drawer>

    </div>
  );
};

export default StaffRoles;
