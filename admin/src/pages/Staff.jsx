import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { getImageUrl } from '../utils/constants';
import ActionDropdown from '../components/ActionDropdown';
import Drawer from '../components/Drawer';
import Pagination from '../components/Pagination';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  ShieldCheck,
  Award,
  Edit,
  Trash2,
  Upload,
  Info,
  Eye,
  EyeOff,
  LayoutGrid,
  List,
  X,
  CheckCircle,
  UserX,
  Activity,
  Filter,
  Users,
  UserCheck
} from 'lucide-react';
import FilterSelect from '../components/FilterSelect';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmDialogContext';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchStaffRequest,
  addStaffRequest,
  updateStaffRequest,
  deleteStaffRequest
} from '../store/slices/staffSlice';

const Staff = () => {
  const dispatch = useDispatch();
  const { staff: users, loading, error } = useSelector((state) => state.staff);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const { user: authUser } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState('list'); // 'grid' or 'list'
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
  const [currentUser, setCurrentUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [roles, setRoles] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchStaffRequest());
  }, [dispatch]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get('/roles');
        if (response.data?.success) {
          setRoles(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching roles in Staff page:', err);
      }
    };
    fetchRoles();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    phone: '',
    isSuspended: false,
    avatar: null,
    permissions: []
  });

  const availablePermissions = [
    { id: 'manage_dashboard', label: 'Platform Dashboard & Insights' },
    { id: 'manage_vendors', label: 'Vendor & Agency Control' },
    { id: 'manage_users', label: 'Traveler & User Accounts' },
    { id: 'manage_subscriptions', label: 'Subscription Plans & Revenue' },
    { id: 'manage_services', label: 'Global Services & Categories' },
    { id: 'manage_destinations', label: 'Locations & Geo Management' },
    { id: 'manage_packages', label: 'Travel Inventory & Packages' },
    { id: 'manage_bookings', label: 'Reservation & Booking Control' },
    { id: 'manage_payments', label: 'Financial Reports & Payments' },
    { id: 'manage_complaints', label: 'Dispute & Incident Resolution' },
    { id: 'manage_enquiries', label: 'Web Enquiries & Leads' },
    { id: 'manage_contact_us', label: 'Web Contact Messages' },
    { id: 'manage_banners', label: 'Platform Studio: Web Banners' },
    { id: 'manage_blogs', label: 'Platform Studio: Web Blogs' },
    { id: 'manage_testimonials', label: 'Platform Studio: Global Reviews' },
    { id: 'manage_reels', label: 'Platform Studio: Web Shows (Reels)' },
    { id: 'manage_brands', label: 'Platform Studio: Social Brands' },
    { id: 'manage_policies', label: 'System: Global Policies & Terms' },
  ];

  const handleOpenModal = (type, user = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && user) {
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role || 'Staff',
        phone: user.phone || '',
        password: '',
        isSuspended: user.isSuspended || false,
        avatar: null,
        permissions: user.permissions || []
      });
      setImagePreview(user.avatar ? getImageUrl(user.avatar) : null);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Staff',
        phone: '',
        isSuspended: false,
        avatar: null,
        permissions: []
      });
      setImagePreview(null);
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    if (formData.password) data.append('password', formData.password);
    data.append('role', formData.role);
    data.append('phone', formData.phone);
    data.append('isSuspended', formData.isSuspended);
    data.append('permissions', JSON.stringify(formData.permissions));
    if (formData.avatar) data.append('avatar', formData.avatar);

    if (modalType === 'add') {
      dispatch(addStaffRequest({
        data,
        onSuccess: () => {
          showToast('Success', `${formData.role} added successfully.`, 'success');
          setShowModal(false);
        },
        onError: (msg) => {
          showToast('Warning', msg || 'Email or phone number already exists.', 'error');
        }
      }));
    } else {
      dispatch(updateStaffRequest({
        id: currentUser._id,
        data,
        onSuccess: () => {
          showToast('Success', `${formData.role} updated successfully.`, 'success');
          setShowModal(false);
        },
        onError: (msg) => {
          showToast('Warning', msg || 'Email or phone number already exists.', 'error');
        }
      }));
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm(
      'Delete Staff Account?',
      'Are you sure you want to remove this staff account? This action cannot be undone.'
    );

    if (isConfirmed) {
      dispatch(deleteStaffRequest(id));
      showToast('Deleted', 'Account removed successfully.', 'success');
    }
  };

  const toggleSuspension = async (user) => {
    const isSuspended = !user.isSuspended;
    dispatch(updateStaffRequest({ id: user._id, data: { isSuspended } }));
    showToast('Updated', `Account ${isSuspended ? 'suspended' : 'activated'} successfully.`, 'success');
  };

  const togglePermission = (permId) => {
    const newPermissions = formData.permissions.includes(permId)
      ? formData.permissions.filter(p => p !== permId)
      : [...formData.permissions, permId];
    setFormData({ ...formData, permissions: newPermissions });
  };

  // Filtered users list (excluding current authUser)
  const filteredUsers = users.filter(user => {
    if (authUser && user._id === authUser._id) return false;

    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesYear = yearFilter === 'all' || new Date(user.createdAt).getFullYear().toString() === yearFilter;
    return matchesSearch && matchesRole && matchesYear;
  }).reverse();

  // Statistics
  const adminCount = users.filter(u => u.role === 'Admin').length + (authUser?.role === 'Admin' ? 1 : 0);
  const subAdminCount = users.filter(u => u.role === 'Sub-Admin').length;
  const staffCount = users.filter(u => u.role === 'Staff').length;
  const totalPersonnel = users.length + (authUser?.role === 'Admin' ? 1 : 0);

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const getRoleBadge = (role) => {
    if (role === 'Admin') {
      return (
        <span
          style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 10px',
            borderRadius: '12px',
            background: 'rgba(147, 51, 234, 0.1)',
            color: '#9333ea',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Shield size={12} /> Super Admin
        </span>
      );
    }
    if (role === 'Sub-Admin') {
      return (
        <span
          style={{
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 10px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            color: '#2563eb',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ShieldCheck size={12} /> Sub-Admin
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: '11px',
          fontWeight: '800',
          padding: '3px 10px',
          borderRadius: '12px',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <Award size={12} /> Admin Staff
      </span>
    );
  };

  return (
    <div className="fade-in">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Staff & Admin Management</h1>
          <p>Separate & manage platform Super Admins, Sub-Admins, and Staff Personnel</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add Personnel
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('Admin')}>
          <div className="stat-icon" style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' }}>
            <Shield size={24} />
          </div>
          <div className="stat-info">
            <h3>Super Admins</h3>
            <p>{adminCount}</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('Sub-Admin')}>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>
            <ShieldCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Sub-Admins</h3>
            <p>{subAdminCount}</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('Staff')}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>Admin Staff</h3>
            <p>{staffCount}</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setRoleFilter('all')}>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Personnel</h3>
            <p>{totalPersonnel}</p>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS FOR SEPARATION */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '12px'
        }}
      >
        {[
          { key: 'all', label: 'All Personnel', count: totalPersonnel, icon: <Users size={16} /> },
          { key: 'Admin', label: 'Super Admins', count: adminCount, icon: <Shield size={16} /> },
          { key: 'Sub-Admin', label: 'Sub-Admins', count: subAdminCount, icon: <ShieldCheck size={16} /> },
          { key: 'Staff', label: 'Admin Staff', count: staffCount, icon: <Award size={16} /> }
        ].map((tab) => {
          const isActive = roleFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setRoleFilter(tab.key);
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '13px',
                border: 'none',
                background: isActive ? 'var(--primary)' : 'var(--bg-card)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(var(--primary-rgb), 0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-main)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="card allow-overflow" style={{ marginBottom: '32px', padding: '20px' }}>
        <div className="filter-row">
          <div className="search-wrapper">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '44px', borderRadius: '12px' }}
            />
            <Search size={18} />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }} />}
          </div>

          <div className="filter-actions">
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'Admin', label: 'Super Admin', color: '#9333ea' },
                  { value: 'Sub-Admin', label: 'Sub-Admin', color: '#2563eb' },
                  { value: 'Staff', label: 'Admin Staff', color: '#059669' }
                ]}
                value={roleFilter}
                onChange={setRoleFilter}
                width="180px"
              />
            </div>

            <div className="filter-group">
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Years' },
                  ...[...new Set(users.map(u => new Date(u.createdAt).getFullYear()))]
                    .sort((a, b) => b - a)
                    .map(y => ({ value: y.toString(), label: y.toString() }))
                ]}
                value={yearFilter}
                onChange={setYearFilter}
                width="140px"
              />
            </div>

            <div className="results-count">
              <span className="badge badge-primary">{totalItems}</span>
              <span style={{ marginLeft: '1px', fontWeight: '600', fontSize: '13px' }}>Matches</span>
            </div>

            <div className="view-toggles" style={{ display: 'flex', gap: '4px', background: 'var(--bg-main)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => setView('grid')}
                className={`view-btn ${view === 'grid' ? 'active' : ''}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
                title="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px' }}>Loading records...</p>
      ) : currentUsers.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <Shield size={48} color="#cbd5e1" style={{ marginBottom: '16px', margin: 'auto' }} />
          <p style={{ color: 'var(--text-muted)' }}>No team members found matching current filter.</p>
        </div>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="cards-grid mobile-slider allow-overflow" style={{ marginBottom: '24px' }}>
              {currentUsers.map((user) => (
                <div key={user._id} className="card allow-overflow" style={{ padding: '24px', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={user.avatar ? getImageUrl(user.avatar) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)}
                        alt={user.name}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: '2px', right: '2px',
                        width: '12px', height: '12px', background: user.isTrulyOnline ? '#22c55e' : '#94a3b8',
                        borderRadius: '50%', border: '2px solid white'
                      }}></div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>{user.name}</h3>
                        <span style={{
                          fontSize: '10px',
                          color: user.isTrulyOnline ? '#22c55e' : '#94a3b8',
                          fontWeight: '700', textTransform: 'uppercase'
                        }}>
                          {user.isTrulyOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        {getRoleBadge(user.role)}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} /> <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} /> <span>{user.phone}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={14} /> <span>{user.permissions?.length || 0} Permissions Configured</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                    <div className="action-group">
                      <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', user)}>
                        <Info size={16} />
                      </button>
                      <button className="action-btn" title="Edit Personnel" onClick={() => handleOpenModal('edit', user)}>
                        <Edit size={16} />
                      </button>
                      <button className="action-btn danger" title="Delete Personnel" onClick={() => handleDelete(user._id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Personnel Info</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role Category</th>
                      <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, index) => (
                      <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>
                          {startIndex + index + 1}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                              <img src={user.avatar ? getImageUrl(user.avatar) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name)} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div style={{
                                position: 'absolute', bottom: '0', right: '0',
                                width: '10px', height: '10px', background: user.isTrulyOnline ? '#22c55e' : '#94a3b8',
                                borderRadius: '50%', border: '2px solid white'
                              }}></div>
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
                                {user.name}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>{getRoleBadge(user.role)}</div>
                            {user.isSuspended && <span className="badge badge-error" style={{ width: 'fit-content', fontSize: '10px' }}>Suspended</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div className="action-group">
                            <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', user)}>
                              <Info size={16} />
                            </button>
                            <button className="action-btn" title="Manage Permissions" onClick={() => handleOpenModal('edit', user)}>
                              <Shield size={16} />
                            </button>
                            <button className="action-btn" title={user.isSuspended ? 'Unsuspend' : 'Suspend'} onClick={() => toggleSuspension(user)}>
                              {user.isSuspended ? <CheckCircle size={16} /> : <UserX size={16} />}
                            </button>
                            <button className="action-btn" title="Edit Personnel" onClick={() => handleOpenModal('edit', user)}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn danger" title="Delete Personnel" onClick={() => handleDelete(user._id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && currentUsers.length > 0 && (
            <div style={{ marginTop: '24px', marginBottom: '32px' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={totalItems}
              />
            </div>
          )}
        </>
      )}

      {/* DRAWER MODAL FOR ADD/EDIT/VIEW PERSONNEL */}
      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add Personnel Member' : modalType === 'edit' ? 'Edit Personnel Details' : 'Personnel Dossier'}
      >
        {modalType === 'view' && currentUser && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '32px', background: 'var(--bg-main)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px' }}>
                <img src={currentUser.avatar ? getImageUrl(currentUser.avatar) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '16px', height: '16px', background: currentUser.isTrulyOnline ? '#22c55e' : '#94a3b8', borderRadius: '50%', border: '2px solid white' }}></div>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>{currentUser.name}</h2>
              <div style={{ marginBottom: '8px' }}>{getRoleBadge(currentUser.role)}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{currentUser.email}</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Joined {new Date(currentUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={16} /> Module Permissions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                {currentUser.permissions?.length > 0 ? currentUser.permissions.map(p => {
                  const label = availablePermissions.find(ap => ap.id === p)?.label || p;
                  return (
                    <div key={p} style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.05)', color: 'var(--primary)', border: '1px solid rgba(var(--primary-rgb), 0.1)', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={14} /> {label}
                    </div>
                  );
                }) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No specific permissions assigned.</p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
              <button className="btn" style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Close View</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setModalType('edit')}>Edit Personnel</button>
            </div>
          </div>
        )}

        {modalType !== 'view' && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <div
                style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f8fafc', margin: '0 auto 16px', position: 'relative', border: '2px dashed var(--border)', cursor: 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => document.getElementById('staffAvatar').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <Upload size={24} style={{ marginBottom: '4px' }} />
                    <p style={{ fontSize: '11px' }}>Photo</p>
                  </div>
                )}
                <input id="staffAvatar" type="file" style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => document.getElementById('staffAvatar').click()}>
                {imagePreview ? 'Change Photo' : 'Upload Profile Photo'}
              </p>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text" className="form-control" required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email" className="form-control" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="username"
              />
            </div>

            {/* SEPARATE ROLE SELECTION FOR ADMIN, SUB-ADMIN, AND STAFF */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                <Award size={15} color="var(--primary)" /> Assign Role Category *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { roleVal: 'Admin', label: 'Super Admin', desc: 'Full System Control', icon: <Shield size={16} /> },
                  { roleVal: 'Sub-Admin', label: 'Sub-Admin', desc: 'Configurable Access', icon: <ShieldCheck size={16} /> },
                  { roleVal: 'Staff', label: 'Admin Staff', desc: 'Operational Support', icon: <Award size={16} /> }
                ].map((item) => {
                  const isSelected = formData.role === item.roleVal;
                  return (
                    <div
                      key={item.roleVal}
                      onClick={() => setFormData({ ...formData, role: item.roleVal })}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '12px',
                        border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        background: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--bg-card)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '4px' }}>
                        {item.icon}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)' }}>{item.label}</div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text" className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Password {modalType === 'edit' && '(Leave blank to keep current)'}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  required={modalType === 'add'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* PERMISSIONS SELECTOR FOR SUB-ADMIN & STAFF */}
            {formData.role !== 'Admin' && (
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', display: 'block' }}>
                  Module Permissions for {formData.role}
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                  {availablePermissions.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: isChecked ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isSuspended}
                  onChange={(e) => setFormData({ ...formData, isSuspended: e.target.checked })}
                />
                <span>Account Suspended</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button type="button" className="btn" style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{modalType === 'add' ? 'Save Personnel' : 'Update Personnel'}</button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
};

export default Staff;
