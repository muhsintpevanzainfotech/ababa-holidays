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
  UserX
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
    { id: 'manage_services', label: 'Services & Categories' },
    { id: 'manage_destinations', label: 'Destinations & Locations' },
    { id: 'manage_packages', label: 'Travel Packages' },
    { id: 'manage_bookings', label: 'Bookings & Reservations' },
    { id: 'manage_payments', label: 'Payments & Revenue' },
    { id: 'manage_vendors', label: 'Vendors & Subscriptions' },
    { id: 'manage_blogs', label: 'Blogs & News' },
    { id: 'manage_testimonials', label: 'Testimonials' },
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
    return matchesSearch && matchesRole;
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
            <div className="cards-grid mobile-slider" style={{ marginBottom: '24px' }}>
              {currentUsers.map((user) => (
                <div key={user._id} className="card" style={{ padding: '24px', position: 'relative' }}>
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
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
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
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div
              style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f8fafc', margin: '0 auto 16px', position: 'relative', border: '2px dashed var(--border)', cursor: modalType === 'view' ? 'default' : 'pointer', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => modalType !== 'view' && document.getElementById('staffAvatar').click()}
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
              disabled={modalType === 'add' || modalType === 'view'}
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
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: modalType === 'view' ? 'default' : 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isSuspended}
                onChange={(e) => setFormData({ ...formData, isSuspended: e.target.checked })}
                disabled={modalType === 'view'}
              />
              <span>Account Suspended</span>
            </label>
          </div>

          {authUser?.role === 'Admin' && (modalType === 'edit' || modalType === 'view') && formData.role !== 'Admin' && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '24px', marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="var(--primary)" />
                Module Permissions {modalType === 'view' && '(Read Only)'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                {availablePermissions.map(perm => (
                  <label key={perm.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-main)', borderRadius: '10px', cursor: modalType === 'view' ? 'default' : 'pointer' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{perm.label}</span>
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px' }}
                      checked={formData.permissions.includes(perm.id)}
                      onChange={() => modalType !== 'view' && togglePermission(perm.id)}
                      disabled={modalType === 'view'}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {modalType !== 'view' && (
            <button type="submit" className="btn btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '600', marginTop: '16px' }}>
              {modalType === 'add' ? 'Create Administrator' : 'Update Administrator'}
            </button>
          )}
        </form>
      </Drawer>
    </div>
  );
};

export default Staff;
