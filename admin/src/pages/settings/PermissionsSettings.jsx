import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Shield, 
  UserCheck, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sliders,
  Edit,
  Save,
  Search,
  Check,
  LayoutDashboard,
  Package,
  Briefcase,
  Map,
  CreditCard,
  Layers,
  ShieldAlert,
  MessageSquare,
  Mail,
  FileText,
  Image,
  Globe,
  Smartphone,
  Bot,
  FileSpreadsheet,
  Activity,
  Award,
  Sparkles
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/constants';
import api from '../../utils/api';
import Drawer from '../../components/Drawer';

const PermissionsSettings = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: authUser } = useSelector((state) => state.auth);

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer / Modal for editing permissions of a staff member
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editPermissions, setEditPermissions] = useState([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // PRESET ROLE TEMPLATES
  const roleTemplates = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      badge: 'MASTER CONTROL',
      color: 'var(--primary)',
      bg: 'rgba(var(--primary-rgb), 0.1)',
      icon: <ShieldCheck size={20} color="var(--primary)" />,
      desc: 'Unrestricted access to all 22 system modules, global configuration, passkeys, and user management.',
      permissions: ['ALL']
    },
    {
      id: 'ops_manager',
      name: 'Operations & Catalog Manager',
      badge: 'OPERATIONS',
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      icon: <Package size={20} color="#8b5cf6" />,
      desc: 'Manages packages, services catalog, destinations, bookings, and AI package builders.',
      permissions: ['manage_dashboard', 'manage_packages', 'manage_services', 'manage_destinations', 'manage_bookings', 'manage_ai_builder']
    },
    {
      id: 'vendor_manager',
      name: 'Vendor Relationship Manager',
      badge: 'VENDOR HUB',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      icon: <Users size={20} color="#3b82f6" />,
      desc: 'Approves vendor registrations, manages subscriptions, vendor staff, and dispute complaints.',
      permissions: ['manage_vendors', 'manage_subscriptions', 'manage_vendor_staff', 'manage_complaints', 'manage_enquiries']
    },
    {
      id: 'finance_exec',
      name: 'Finance & Accounts Executive',
      badge: 'FINANCE',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      icon: <CreditCard size={20} color="#10b981" />,
      desc: 'Access payment transactions, revenue reporting, vendor subscription tiers, and CSV exports.',
      permissions: ['manage_dashboard', 'manage_payments', 'manage_subscriptions', 'manage_bookings', 'manage_exports']
    },
    {
      id: 'content_editor',
      name: 'Content & Studio Specialist',
      badge: 'CMS & MEDIA',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      icon: <Layers size={20} color="#f59e0b" />,
      desc: 'Curates homepage banners, blogs, reviews moderation, reels, and featured brand partners.',
      permissions: ['manage_banners', 'manage_blogs', 'manage_testimonials', 'manage_reels', 'manage_brands']
    },
    {
      id: 'support_agent',
      name: 'Support & Leads Specialist',
      badge: 'CUSTOMER LEADS',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.1)',
      icon: <Mail size={20} color="#ec4899" />,
      desc: 'Handles customer web enquiries, contact messages, dispute tickets, and traveler accounts.',
      permissions: ['manage_users', 'manage_enquiries', 'manage_contact_us', 'manage_complaints']
    }
  ];

  // ALL 22 SYSTEM PERMISSION CATEGORIES & KEYS
  const systemPermissionCategories = [
    {
      category: 'Core Administration & Security',
      icon: <Shield size={18} color="var(--primary)" />,
      permissions: [
        { id: 'manage_dashboard', label: 'Platform Dashboard & Insights', icon: <LayoutDashboard size={16} />, desc: 'Access executive metrics, real-time analytics, and platform status.' },
        { id: 'manage_vendors', label: 'Vendor Partner Control', icon: <Users size={16} />, desc: 'Verify, approve, edit, and manage registered vendor agency profiles.' },
        { id: 'manage_users', label: 'Traveler & User Accounts', icon: <Users size={16} />, desc: 'View, verify, or suspend registered traveler customer accounts.' },
        { id: 'manage_policies', label: 'Platform Policies & Terms', icon: <ShieldCheck size={16} />, desc: 'Edit Terms & Conditions, Privacy, and Cancellation policy rules.' },
        { id: 'manage_settings', label: 'System Preferences & Passkeys', icon: <Sliders size={16} />, desc: 'Modify passkey requirements and global security preferences.' },
        { id: 'manage_security_logs', label: 'Security Audit & Logs', icon: <Activity size={16} />, desc: 'Audit system access logs, passkey authorization, and session activities.' }
      ]
    },
    {
      category: 'Catalog, Packages & AI Builder',
      icon: <Package size={18} color="#8b5cf6" />,
      permissions: [
        { id: 'manage_packages', label: 'Packages & Setup', icon: <Package size={16} />, desc: 'Create, edit, price, and publish travel itineraries and packages.' },
        { id: 'manage_services', label: 'Services Catalog & Categories', icon: <Briefcase size={16} />, desc: 'Manage main categories, sub-services, and catalog offerings.' },
        { id: 'manage_destinations', label: 'Geo Locations & Destinations', icon: <Map size={16} />, desc: 'Manage countries, states, and destination landing pages.' },
        { id: 'manage_ai_builder', label: 'AI Package Setup Builder', icon: <Bot size={16} />, desc: 'Access NextGen AI form builder and custom package itinerary generator.' }
      ]
    },
    {
      category: 'Finance, Operations & Exports',
      icon: <CreditCard size={18} color="#10b981" />,
      permissions: [
        { id: 'manage_bookings', label: 'Bookings & Reservations', icon: <Briefcase size={16} />, desc: 'Process, confirm, or modify customer tour bookings.' },
        { id: 'manage_payments', label: 'Transactions & Financials', icon: <CreditCard size={16} />, desc: 'Audit payment records, payouts, and revenue streams.' },
        { id: 'manage_subscriptions', label: 'Vendor Subscriptions & Tiers', icon: <CreditCard size={16} />, desc: 'Manage vendor subscription pricing plans and tier features.' },
        { id: 'manage_complaints', label: 'Disputes & Incident Resolution', icon: <ShieldAlert size={16} />, desc: 'Handle vendor and traveler support tickets and complaints.' },
        { id: 'manage_vendor_staff', label: 'Vendor Agency Staff Oversight', icon: <Users size={16} />, desc: 'Monitor vendor agency team members and internal sub-accounts.' },
        { id: 'manage_exports', label: 'Analytics & CSV Data Export', icon: <FileSpreadsheet size={16} />, desc: 'Download CSV and PDF reports for bookings, revenue, and users.' }
      ]
    },
    {
      category: 'Platform Studio & Media Content',
      icon: <Layers size={18} color="#f59e0b" />,
      permissions: [
        { id: 'manage_banners', label: 'Web Banners & Promotions', icon: <Image size={16} />, desc: 'Manage homepage hero carousels and promotional graphics.' },
        { id: 'manage_blogs', label: 'Travel Blogs & Articles', icon: <FileText size={16} />, desc: 'Publish, edit, and curate platform travel stories and articles.' },
        { id: 'manage_testimonials', label: 'Customer Reviews Moderation', icon: <MessageSquare size={16} />, desc: 'Approve, feature, or remove traveler reviews and feedback.' },
        { id: 'manage_reels', label: 'Reels & Video Shows', icon: <Smartphone size={16} />, desc: 'Curate short video reels and promotional media shows.' },
        { id: 'manage_brands', label: 'Social & Brand Partners', icon: <Globe size={16} />, desc: 'Manage featured client logos and brand partner badges.' }
      ]
    },
    {
      category: 'Communication & Customer Leads',
      icon: <Mail size={18} color="#ec4899" />,
      permissions: [
        { id: 'manage_enquiries', label: 'Web Enquiries & Leads', icon: <MessageSquare size={16} />, desc: 'Respond to and track custom holiday trip request leads.' },
        { id: 'manage_contact_us', label: 'Contact Messages & Support', icon: <Mail size={16} />, desc: 'Manage customer contact form submissions and inquiries.' }
      ]
    }
  ];

  const allPermissionsList = systemPermissionCategories.flatMap(c => c.permissions);

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      if (response.data?.success) {
        const subAdmins = response.data.data.filter(u => u.role === 'Sub-Admin');
        setStaffList(subAdmins);
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      showToast('Error', 'Failed to load sub-admin staff list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditDrawer = (staff) => {
    setSelectedStaff(staff);
    setEditPermissions(staff.permissions || []);
    setIsDrawerOpen(true);
  };

  const handleApplyRolePreset = (presetPermissions) => {
    if (presetPermissions.includes('ALL')) {
      setEditPermissions(allPermissionsList.map(p => p.id));
    } else {
      setEditPermissions(presetPermissions);
    }
    showToast('Role Preset Applied', 'Selected role permission template applied.', 'info');
  };

  const handleTogglePermission = (permId) => {
    if (editPermissions.includes(permId)) {
      setEditPermissions(editPermissions.filter(id => id !== permId));
    } else {
      setEditPermissions([...editPermissions, permId]);
    }
  };

  const handleSelectAllPermissions = () => {
    setEditPermissions(allPermissionsList.map(p => p.id));
  };

  const handleDeselectAllPermissions = () => {
    setEditPermissions([]);
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    setSavingPermissions(true);
    try {
      const response = await api.put(`/users/${selectedStaff._id}`, {
        permissions: JSON.stringify(editPermissions)
      });
      if (response.data?.success || response.status === 200) {
        showToast('Permissions Saved', `Permissions for ${selectedStaff.name} updated successfully.`, 'success');
        setStaffList(prev => prev.map(s => s._id === selectedStaff._id ? { ...s, permissions: editPermissions } : s));
        setIsDrawerOpen(false);
      }
    } catch (error) {
      showToast('Error', error.response?.data?.message || 'Failed to update permissions', 'error');
    } finally {
      setSavingPermissions(false);
    }
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.customId && s.customId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fade-in" style={{ paddingBottom: '60px' }}>
      
      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', letterSpacing: '0.5px' }}>
              SECURITY & GOVERNANCE CONTROL
            </span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Module Permissions <span style={{ color: 'var(--primary)' }}>Matrix</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Configure granular sub-admin permissions, audit system flags, and delegate module authority.
          </p>
        </div>
      </div>

      {/* SECTION 1: SUB-ADMIN STAFF PERMISSIONS MANAGER */}
      <div className="card fade-in" style={{ padding: '28px', borderRadius: '22px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '19px', fontWeight: '800', margin: 0 }}>Sub-Admin Staff User Permissions</h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Configure module access rights directly for individual sub-admin team members.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search staff user..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ height: '40px', paddingLeft: '36px', borderRadius: '10px', fontSize: '13px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <button className="btn btn-primary" onClick={() => navigate('/staff')} style={{ height: '40px', padding: '0 16px', fontSize: '13px', fontWeight: '700', borderRadius: '10px' }}>
              Manage Staff Directory <ArrowRight size={14} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>

        {/* STAFF LIST TABLE */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading staff permissions...</div>
        ) : filteredStaff.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-main)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <UserCheck size={36} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>No Sub-Admin Staff Found</p>
            <p style={{ margin: '4px 0 12px', fontSize: '12px', color: 'var(--text-muted)' }}>Create sub-admin staff accounts in the Staff Management page to assign permissions.</p>
            <button className="btn btn-primary" onClick={() => navigate('/staff')} style={{ padding: '8px 16px', fontSize: '12px' }}>
              Go to Staff Page
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredStaff.map((staff) => {
              const assignedCount = staff.permissions ? staff.permissions.length : 0;
              const totalCount = allPermissionsList.length;
              return (
                <div key={staff._id} style={{ 
                  padding: '16px 20px', 
                  border: '1px solid var(--border)', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  background: 'var(--bg-card)',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--bg-main)', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {staff.avatar ? (
                        <img src={getImageUrl(staff.avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontWeight: '800', color: 'var(--primary)' }}>{staff.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{staff.name}</h4>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>
                          {staff.customId || 'SAD'}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{staff.email}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Permissions Assigned</span>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: assignedCount > 0 ? '#10b981' : '#ef4444' }}>
                        {assignedCount} / {totalCount} Modules Granted
                      </span>
                    </div>

                    <button 
                      onClick={() => handleOpenEditDrawer(staff)}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '700', borderRadius: '10px', gap: '6px' }}
                    >
                      <Edit size={14} /> Configure Permissions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: SYSTEM PERMISSIONS MATRIX BY CATEGORY */}
      <div className="card fade-in" style={{ padding: '28px', borderRadius: '22px' }}>
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '19px', fontWeight: '800', margin: 0 }}>All System Permissions Matrix ({allPermissionsList.length} Keys)</h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Complete dictionary of all system permission flags enforced across ABABA Travels.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {systemPermissionCategories.map((cat, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                {cat.icon}
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{cat.category}</h3>
                <span style={{ fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
                  {cat.permissions.length} Modules
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                {cat.permissions.map((perm) => (
                  <div key={perm.id} style={{ 
                    padding: '16px', 
                    border: '1px solid var(--border)', 
                    borderRadius: '14px', 
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <div style={{ color: 'var(--primary)' }}>{perm.icon}</div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{perm.label}</h4>
                      </div>
                      <p style={{ margin: '0 0 12px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>{perm.desc}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: '8px', borderTop: '1px dashed var(--border)', marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px' }}>
                        {perm.id}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Super Admin
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ULTRA-MODERN DRAWER FOR EDITING SUB-ADMIN PERMISSIONS WITH QUICK ROLE PRESETS */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`Configure Permissions - ${selectedStaff?.name || ''}`}
        subtitle="1-Click role presets or granular module selection."
        size="lg"
      >
        {selectedStaff && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* STICKY PRESET QUICK-APPLY BAR */}
            <div style={{ padding: '16px 24px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                QUICK ROLE PRESETS (1-CLICK APPLY)
              </p>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {roleTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleApplyRolePreset(t.permissions)}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                      background: t.bg, color: t.color, fontSize: '11px', fontWeight: '800',
                      cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{selectedStaff.email}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                  {editPermissions.length} of {allPermissionsList.length} Modules Authorized
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={handleSelectAllPermissions} style={{ fontSize: '12px', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', cursor: 'pointer' }}>
                  Select All
                </button>
                <button type="button" onClick={handleDeselectAllPermissions} style={{ fontSize: '12px', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', cursor: 'pointer' }}>
                  Clear All
                </button>
              </div>
            </div>

            {/* SCROLLABLE PERMISSIONS CHECKLIST */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {systemPermissionCategories.map((cat, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      {cat.icon}
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-main)' }}>
                        {cat.category}
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      {cat.permissions.map((perm) => {
                        const isChecked = editPermissions.includes(perm.id);
                        return (
                          <div 
                            key={perm.id} 
                            onClick={() => handleTogglePermission(perm.id)}
                            style={{ 
                              padding: '12px 14px', 
                              borderRadius: '12px', 
                              border: '1.5px solid',
                              borderColor: isChecked ? 'var(--primary)' : 'var(--border)',
                              background: isChecked ? 'rgba(var(--primary-rgb), 0.05)' : 'var(--bg-card)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justify: 'space-between',
                              transition: '0.2s ease',
                              boxShadow: isChecked ? '0 4px 12px -2px rgba(var(--primary-rgb), 0.15)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ 
                                width: '18px', height: '18px', borderRadius: '5px', 
                                border: '2px solid', 
                                borderColor: isChecked ? 'var(--primary)' : '#cbd5e1',
                                background: isChecked ? 'var(--primary)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                              }}>
                                {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: '700', color: isChecked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                {perm.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* STICKY GLASS ACTION FOOTER */}
            <div style={{ 
              padding: '18px 24px', 
              background: 'var(--glass-bg)', 
              backdropFilter: 'blur(16px)', 
              borderTop: '1px solid var(--border)', 
              display: 'flex', 
              justify: 'flex-end', 
              gap: '12px',
              flexShrink: 0 
            }}>
              <button className="btn btn-secondary" onClick={() => setIsDrawerOpen(false)} style={{ padding: '10px 22px', fontSize: '13px', borderRadius: '10px', fontWeight: '700' }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSavePermissions} disabled={savingPermissions} style={{ padding: '10px 28px', fontSize: '13px', fontWeight: '800', borderRadius: '10px', gap: '8px' }}>
                {savingPermissions ? 'Saving Permissions...' : <><Save size={16} /> Save Permissions</>}
              </button>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
};

export default PermissionsSettings;
