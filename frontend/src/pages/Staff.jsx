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
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  LayoutGrid,
  List as ListIcon,
  X,
  CheckCircle,
  UserX,
  Activity
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
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
  const [currentUser, setCurrentUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [adminCount, setAdminCount] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let count = users.filter(u => u.role === 'Admin').length;
    if (authUser?.role === 'Admin') count += 1;
    setAdminCount(count);
  }, [users, authUser]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Sub-Admin',
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
    { id: 'manage_banners', label: 'Platform Studio: Web Banners' },
    { id: 'manage_blogs', label: 'Platform Studio: Web Blogs' },
    { id: 'manage_testimonials', label: 'Platform Studio: Global Reviews' },
  ];

  useEffect(() => {
    dispatch(fetchStaffRequest());
  }, [dispatch]);

  const handleOpenModal = (type, user = null) => {
    setModalType(type);
    if ((type === 'edit' || type === 'view') && user) {
      setCurrentUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        password: '', // Keep empty unless changing
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
        role: 'Sub-Admin',
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
          showToast('Success', 'Staff member added successfully.', 'success');
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
          showToast('Success', 'Staff member updated successfully.', 'success');
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
      'Delete Admin?',
      'Are you sure you want to remove this administrator? This action cannot be undone.'
    );

    if (isConfirmed) {
      dispatch(deleteStaffRequest(id));
      showToast('Deleted', 'Admin removed successfully.', 'success');
    }
  };

  const toggleSuspension = async (user) => {
    const isSuspended = !user.isSuspended;
    dispatch(updateStaffRequest({ id: user._id, data: { isSuspended } }));
    showToast('Updated', `Administrator account ${isSuspended ? 'suspended' : 'activated'} successfully.`, 'success');
  };

  const togglePermission = (permId) => {
    const newPermissions = formData.permissions.includes(permId)
      ? formData.permissions.filter(p => p !== permId)
      : [...formData.permissions, permId];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const filteredUsers = users.filter(user => {
    // Exclude the currently logged in user
    if (authUser && user._id === authUser._id) return false;

    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesYear = yearFilter === 'all' || new Date(user.createdAt).getFullYear().toString() === yearFilter;
    return matchesSearch && matchesRole && matchesYear;
  }).reverse();

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Admin Management</h1>
          <p>Manage platform administrators and sub-admins</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal('add')}>
          <Plus size={20} /> Add New Admin
        </button>
      </div>

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
            <div className="filter-group">
              <FilterSelect
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'Admin', label: 'Admin', color: '#f59e0b' },
                  { value: 'Sub-Admin', label: 'Sub-Admin', color: '#3b82f6' }
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

            <div className="view-toggles">
              <button
                onClick={() => setView('grid')}
                className={`view-btn ${view === 'grid' ? 'active' : ''}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`view-btn ${view === 'list' ? 'active' : ''}`}
              >
                <ListIcon size={18} />
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
          <p style={{ color: 'var(--text-muted)' }}>No administrators found matching filters.</p>
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
                        src={user.avatar ? getImageUrl(user.avatar) : 'https://ui-avatars.com/api/?name=' + user.name}
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
                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{user.name}</h3>
                        <span style={{
                          fontSize: '10px',
                          color: user.isTrulyOnline ? '#22c55e' : '#94a3b8',
                          fontWeight: '700', textTransform: 'uppercase'
                        }}>
                          {user.isTrulyOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: '700',
                        background: user.role === 'Admin' ? '#fef3c7' : '#e0f2fe',
                        color: user.role === 'Admin' ? '#92400e' : '#0369a1'
                      }}>{user.role}</span>
                      {user.isSuspended && <span className="badge badge-error" style={{ marginLeft: '4px', fontSize: '10px' }}>Suspended</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Mail size={14} /> {user.email}
                    </div>
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <Phone size={14} /> {user.phone}
                      </div>
                    )}
                  </div>

                  <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                    <ActionDropdown
                      actions={[
                        { label: 'View Details', icon: <Eye size={16} />, onClick: () => handleOpenModal('view', user) },
                        { label: 'Edit Details', icon: <Edit size={16} />, onClick: () => handleOpenModal('edit', user) },
                        { label: 'Permissions', icon: <Shield size={16} />, onClick: () => handleOpenModal('edit', user) },
                        { divider: true },
                        { label: 'Delete Admin', icon: <Trash2 size={16} />, onClick: () => handleDelete(user._id), variant: 'danger' }
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card allow-overflow" style={{ padding: '0' }}>
              <div className="table-container">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '50px' }}>#</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Administrator</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role & Status</th>
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
                              <img src={user.avatar ? getImageUrl(user.avatar) : 'https://ui-avatars.com/api/?name=' + user.name} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                              <div style={{
                                position: 'absolute', bottom: '0', right: '0',
                                width: '10px', height: '10px', background: user.isTrulyOnline ? '#22c55e' : '#94a3b8',
                                borderRadius: '50%', border: '2px solid white',
                                boxShadow: '0 0 0 2px white'
                              }}></div>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {user.name}
                                <div style={{
                                  width: '8px', height: '8px', borderRadius: '50%',
                                  background: user.isTrulyOnline ? '#22c55e' : '#cbd5e1'
                                }}></div>
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span className="badge badge-primary" style={{ width: 'fit-content' }}>{user.role}</span>
                            {user.isSuspended && <span className="badge badge-error" style={{ width: 'fit-content' }}>Suspended</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div className="action-group">
                            <button className="action-btn" title="View Details" onClick={() => handleOpenModal('view', user)}>
                              <Eye size={16} />
                            </button>
                            <button className="action-btn" title="Manage Permissions" onClick={() => handleOpenModal('edit', user)}>
                              <Shield size={16} />
                            </button>
                            <button className="action-btn" title={user.isSuspended ? 'Unsuspend' : 'Suspend'} onClick={() => toggleSuspension(user)}>
                              {user.isSuspended ? <CheckCircle size={16} /> : <UserX size={16} />}
                            </button>
                            <button className="action-btn" title="Edit Staff" onClick={() => handleOpenModal('edit', user)}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn danger" title="Delete Staff" onClick={() => handleDelete(user._id)}>
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

      <Drawer
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'add' ? 'Add administrator' : modalType === 'edit' ? 'Edit administrator' : 'Administrator Details'}
      >
          {modalType === 'view' && currentUser && (
            <div className="fade-in">
              <div style={{ textAlign: 'center', marginBottom: '32px', background: 'var(--bg-main)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                 <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 16px' }}>
                    <img src={currentUser.avatar ? getImageUrl(currentUser.avatar) : 'https://ui-avatars.com/api/?name=' + currentUser.name} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '16px', height: '16px', background: currentUser.isTrulyOnline ? '#22c55e' : '#94a3b8', borderRadius: '50%', border: '2px solid white' }}></div>
                 </div>
                 <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{currentUser.name}</h2>
                 <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>{currentUser.role} &nbsp;•&nbsp; {currentUser.email}</p>
                 <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Joined {new Date(currentUser.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                 </p>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                       <div style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)' }}>{Math.floor(currentUser.totalTimeSpent || 0)}m</div>
                       <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Time Spent</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                       <div style={{ fontWeight: '800', fontSize: '18px', color: '#16a34a' }}>{currentUser.activityLog?.length || 0}d</div>
                       <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Daily Logs</div>
                    </div>
                 </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} /> Module Permissions
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                   {currentUser.permissions?.length > 0 ? currentUser.permissions.map(p => {
                      const label = availablePermissions.find(ap => ap.id === p)?.label || p;
                      return (
                        <div key={p} style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(79, 70, 229, 0.05)', color: 'var(--primary)', border: '1px solid rgba(79, 70, 229, 0.1)', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={14} /> {label}
                        </div>
                      );
                   }) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No specific permissions assigned.</p>
                   )}
                </div>
              </div>              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '1px', margin: 0 }}>
                    Platform Engagement
                  </h4>
                  <select 
                    style={{ padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', fontSize: '12px', fontWeight: '700', outline: 'none' }}
                    value={heatmapYear}
                    onChange={(e) => setHeatmapYear(parseInt(e.target.value))}
                  >
                     {[...new Set([new Date().getFullYear(), ...currentUser.activityLog?.map(a => parseInt(a.date.split('-')[0])) || []])].sort((a,b) => b-a).map(yr => (
                        <option key={yr} value={yr}>{yr} Logs</option>
                     ))}
                  </select>
                </div>
                
                {(!currentUser.activityLog || currentUser.activityLog.length === 0) ? (
                   <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                      <Activity size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>This administrator has not recorded any dashboard activity yet.</p>
                   </div>
                ) : (
                   <>
                    <div style={{ 
                      background: 'var(--bg-card)', 
                      padding: '24px', 
                      borderRadius: '16px', 
                      border: '1px solid var(--border)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      overflowX: 'auto'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Day labels column */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateRows: 'repeat(7, 10px)', 
                          gap: '3px', 
                          marginTop: '25px',
                          fontSize: '9px',
                          color: 'var(--text-muted)',
                          fontWeight: '700'
                        }}>
                           <div style={{ visibility: 'hidden' }}>Sun</div>
                           <div>Mon</div>
                           <div style={{ visibility: 'hidden' }}>Tue</div>
                           <div>Wed</div>
                           <div style={{ visibility: 'hidden' }}>Thu</div>
                           <div>Fri</div>
                           <div style={{ visibility: 'hidden' }}>Sat</div>
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ position: 'relative', height: '18px', marginBottom: '8px' }}>
                             {(() => {
                               const months = [];
                               for (let m = 0; m < 12; m++) {
                                 const firstOfMonth = new Date(heatmapYear, m, 1);
                                 const startOfYear = new Date(heatmapYear, 0, 1);
                                 const dayOfYear = Math.floor((firstOfMonth - startOfYear) / (24 * 60 * 60 * 1000));
                                 const weekIndex = Math.floor(dayOfYear / 7);
                                 months.push({ name: firstOfMonth.toLocaleString('default', { month: 'short' }), week: weekIndex });
                               }
                               return months.map((m, idx) => (
                                 <span key={idx} style={{ 
                                   position: 'absolute', 
                                   left: `${m.week * 13}px`,
                                   fontSize: '11px', 
                                   color: 'var(--text-muted)', 
                                   fontWeight: '600'
                                 }}>
                                   {m.name}
                                 </span>
                               ));
                             })()}
                          </div>

                           <div style={{ 
                             display: 'grid', 
                             gridTemplateRows: 'repeat(7, 10px)', 
                             gridAutoFlow: 'column', 
                             gridAutoColumns: '10px', 
                             gap: '3px',
                             width: 'max-content'
                           }}>
                             {[...Array(371)].map((_, i) => { 
                                const d = new Date(heatmapYear, 0, 1);
                                d.setDate(d.getDate() + i);
                                
                                if (d.getFullYear() > heatmapYear) return null;

                                const dateStr = d.toISOString().split('T')[0];
                                const activity = (currentUser.activityLog || []).find(a => a.date === dateStr);
                                const leave = (currentUser.leaves || []).find(l => l.date === dateStr);
                                const isSunday = d.getDay() === 0;
                                const isToday = d.toDateString() === new Date().toDateString();
                                const isFuture = d > new Date();

                                const level = activity ? Math.min(Math.ceil(activity.count / 5), 4) : 0;
                                const activityColors = ['#f1f5f9', '#dcfce7', '#86efac', '#22c55e', '#15803d'];
                                
                                // Color priority logic
                                let bgColor = activityColors[level];
                                let title = isFuture ? '' : `${dateStr}: ${activity?.count || 0} actions`;

                                if (leave) {
                                  bgColor = '#fecaca'; // Red for leave
                                  title = `${dateStr}: On Leave (${leave.reason || 'No reason'})`;
                                } else if (activity) {
                                  bgColor = activityColors[level];
                                } else if (isSunday) {
                                  bgColor = '#fef08a'; // Yellow for Sunday
                                  title = `${dateStr}: Sunday (Off Day)`;
                                }
                                
                                return (
                                  <div 
                                    key={i} 
                                    title={title}
                                    className={isToday ? 'pulse-today' : ''}
                                    style={{ 
                                      width: '10px', 
                                      height: '10px', 
                                      borderRadius: '2px', 
                                      background: isFuture ? 'transparent' : bgColor, 
                                      cursor: 'help',
                                      opacity: isFuture ? 0 : 1,
                                      border: isToday ? '1px solid var(--primary)' : 'none',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                );
                             })}
                           </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '10px', color: 'var(--text-muted)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '10px', height: '10px', background: '#fef08a', borderRadius: '2px' }} /> Sunday
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '10px', height: '10px', background: '#fecaca', borderRadius: '2px' }} /> Leave
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
                          Less 
                          <div style={{ width: '10px', height: '10px', background: '#f1f5f9', borderRadius: '2px' }} />
                          <div style={{ width: '10px', height: '10px', background: '#15803d', borderRadius: '2px' }} /> 
                          More
                       </div>
                       <span style={{ marginLeft: '12px', fontWeight: '700', color: 'var(--primary)' }}>{heatmapYear} Performance</span>
                    </div>
                   </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                <button className="btn" style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Close View</button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => setModalType('edit')}>Edit Administrator</button>
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
                <label>Full Name</label>
                <input
                  type="text" className="form-control" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email" className="form-control" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={modalType === 'add'}
                >
                  {modalType === 'add' ? (
                    <option value="Sub-Admin">Sub-Admin</option>
                  ) : (
                    <>
                      <option value="Admin">Admin</option>
                      <option value="Sub-Admin">Sub-Admin</option>
                    </>
                  )}
                </select>
                {modalType === 'add' && (
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    New administrative accounts must be Sub-Admins.
                  </p>
                )}
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

              {authUser?.role === 'Admin' && modalType === 'edit' && formData.role !== 'Admin' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={18} color="var(--primary)" />
                    Module Permissions
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {availablePermissions.map(perm => (
                      <label key={perm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-main)', borderRadius: '10px', cursor: 'pointer' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{perm.label}</span>
                        <input
                          type="checkbox"
                          style={{ width: '18px', height: '18px' }}
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600', marginTop: '16px' }}>
                {modalType === 'add' ? 'Create Administrator' : 'Update Administrator'}
              </button>
            </form>
          )}
      </Drawer>
    </div>
  );
};

export default Staff;
